import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { cartItemId, quantity } = await request.json()

  if (!cartItemId || quantity < 0) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  const supabase = await createClient()

  if (quantity === 0) {
    // Remove item from cart
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", cartItemId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
