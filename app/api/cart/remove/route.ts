import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { cartItemId } = await request.json()

  if (!cartItemId) {
    return NextResponse.json({ error: "Cart item ID required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
