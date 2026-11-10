import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"

export async function POST(request: Request) {
  const { response } = await requireAdmin()
  if (response) return response

  const { orderId, internalNotes } = await request.json()
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const { error } = await supabase
    .from("orders")
    .update({ internal_notes: internalNotes ?? null, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
