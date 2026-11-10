import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/client"
import { orderStatusEmail } from "@/lib/email/templates/order-status"
import { requireAdmin } from "@/lib/auth/admin"
import { orderAccessUrl } from "@/lib/orders/access"

const NOTIFY_STATUSES = new Set(["preparing", "delivered", "cancelled"])
const ALLOWED_STATUSES = new Set(["pending", "preparing", "delivered", "cancelled"])

export async function POST(request: Request) {
  const { response } = await requireAdmin()
  if (response) return response

  const { orderId, newStatus } = await request.json()

  if (!orderId || !newStatus) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!ALLOWED_STATUSES.has(newStatus)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, total_amount, user_id, status, view_token")
    .eq("id", orderId)
    .single()

  if (!existingOrder) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
  }

  const previousStatus = existingOrder.status

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (newStatus === "cancelled") {
    const { error: restoreError } = await supabase.rpc("restore_order_stock", { p_order_id: orderId })
    if (restoreError) {
      return NextResponse.json({ error: restoreError.message }, { status: 500 })
    }
  }

  if (existingOrder.customer_email && newStatus !== previousStatus && NOTIFY_STATUSES.has(newStatus)) {
    const { subject, html } = orderStatusEmail({
      customerName: existingOrder.customer_name || "cliente",
      orderId,
      status: newStatus,
      totalAmount: existingOrder.total_amount,
      ordersUrl: orderAccessUrl(orderId, existingOrder.view_token),
    })
    await sendEmail({ to: existingOrder.customer_email, subject, html })
  }

  return NextResponse.json({ success: true })
}
