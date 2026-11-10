import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/client"
import { orderTrackingEmail } from "@/lib/email/templates/order-tracking"
import { requireAdmin } from "@/lib/auth/admin"

export async function POST(request: Request) {
  const { response } = await requireAdmin()
  if (response) return response

  const { orderId, shippingCarrier, trackingNumber, notifyCustomer } = await request.json()
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, tracking_number")
    .eq("id", orderId)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const { error } = await supabase
    .from("orders")
    .update({
      shipping_carrier: shippingCarrier || null,
      tracking_number: trackingNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (notifyCustomer && trackingNumber && order.customer_email) {
    const mail = orderTrackingEmail({
      customerName: order.customer_name,
      orderId: order.id,
      carrier: shippingCarrier,
      trackingNumber,
    })
    await sendEmail({ to: order.customer_email, subject: mail.subject, html: mail.html })
  }

  return NextResponse.json({ success: true })
}
