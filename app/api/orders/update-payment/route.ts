import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabaseAuth = await createClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user?.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { orderId, paymentStatus, paymentNotes, paymentMethod } = await request.json()
  if (!orderId || !paymentStatus) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const allowed = ["unpaid", "awaiting_transfer", "paid", "refunded", "on_account"]
  if (!allowed.includes(paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const patch: Record<string, unknown> = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  }
  if (paymentNotes !== undefined) patch.payment_notes = paymentNotes
  if (paymentMethod) patch.payment_method = paymentMethod
  if (paymentStatus === "paid") patch.paid_at = new Date().toISOString()
  if (paymentStatus === "refunded" || paymentStatus === "awaiting_transfer" || paymentStatus === "unpaid") {
    if (paymentStatus !== "paid") {
      /* keep paid_at if refunded for history; clear only if unpaid */
    }
  }
  if (paymentStatus === "unpaid" || paymentStatus === "awaiting_transfer") {
    patch.paid_at = null
  }

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
