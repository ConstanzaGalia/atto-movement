import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const { sessionId, productId, variantId, variantSizeId, quantity } = await request.json()

  if (!sessionId || !productId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set("cart_session_id", sessionId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })

  const supabase = await createClient()

  const { data: productVariants } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId)

  const hasVariants = (productVariants?.length ?? 0) > 0

  if (hasVariants && !variantSizeId) {
    return NextResponse.json({ error: "Debes seleccionar color y talle" }, { status: 400 })
  }

  // Check stock: priority order: variant_size > variant > product
  if (variantSizeId) {
    const { data: variantSize } = await supabase
      .from("product_variant_sizes")
      .select("stock, variant_id")
      .eq("id", variantSizeId)
      .single()

    if (!variantSize || variantSize.stock < quantity) {
      return NextResponse.json({ error: "Size not available or insufficient stock" }, { status: 400 })
    }

    // Verify the size belongs to the variant and product
    if (variantId && variantSize.variant_id !== variantId) {
      return NextResponse.json({ error: "Size does not match variant" }, { status: 400 })
    }
  } else if (variantId) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", variantId)
      .eq("product_id", productId)
      .single()

    if (!variant || variant.stock < quantity) {
      return NextResponse.json({ error: "Variant not available or insufficient stock" }, { status: 400 })
    }
  } else {
    const { data: product } = await supabase.from("products").select("stock").eq("id", productId).single()

    if (!product || product.stock < quantity) {
      return NextResponse.json({ error: "Product not available or insufficient stock" }, { status: 400 })
    }
  }

  // Check for existing item (same product, variant, and size)
  let existingItemQuery = supabase
    .from("cart_items")
    .select("*")
    .eq("session_id", sessionId)
    .eq("product_id", productId)

  if (variantId) {
    existingItemQuery = existingItemQuery.eq("variant_id", variantId)
  } else {
    existingItemQuery = existingItemQuery.is("variant_id", null)
  }

  if (variantSizeId) {
    existingItemQuery = existingItemQuery.eq("variant_size_id", variantSizeId)
  } else {
    existingItemQuery = existingItemQuery.is("variant_size_id", null)
  }

  const { data: existingItem } = await existingItemQuery.maybeSingle()

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("id", existingItem.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Insert new item
    const { error } = await supabase.from("cart_items").insert({
      session_id: sessionId,
      product_id: productId,
      variant_id: variantId || null,
      variant_size_id: variantSizeId || null,
      quantity,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
