import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { getSiteSettings } from "@/lib/site-settings"

export async function POST(request: Request) {
  const { response } = await requireAdmin()
  if (response) return response

  const { orderId, paymentStatus, paymentNotes, paymentMethod } = await request.json()
  if (!orderId || !paymentStatus) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const allowed = ["unpaid", "awaiting_transfer", "paid", "refunded", "on_account"]
  if (!allowed.includes(paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const { data: existing } = await supabase
    .from("orders")
    .select("status, stock_restored_at")
    .eq("id", orderId)
    .maybeSingle()

  const patch: Record<string, unknown> = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  }
  if (paymentNotes !== undefined) patch.payment_notes = paymentNotes
  if (paymentMethod) patch.payment_method = paymentMethod
  if (paymentStatus === "paid") patch.paid_at = new Date().toISOString()
  if (paymentStatus === "unpaid" || paymentStatus === "awaiting_transfer") {
    patch.paid_at = null
  }
  if (paymentStatus === "paid" || paymentStatus === "on_account" || paymentStatus === "refunded") {
    patch.stock_held_until = null
  }
  if (
    (paymentStatus === "unpaid" || paymentStatus === "awaiting_transfer") &&
    existing &&
    !existing.stock_restored_at &&
    existing.status !== "cancelled"
  ) {
    const settings = await getSiteSettings(supabase)
    patch.stock_held_until = new Date(Date.now() + settings.unpaid_hold_hours * 60 * 60 * 1000).toISOString()
  }

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
