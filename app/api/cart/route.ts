import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select("*, products(*), product_variants(color, stock), product_variant_sizes(size, stock)")
    .eq("session_id", sessionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: cartItems || [] })
}
