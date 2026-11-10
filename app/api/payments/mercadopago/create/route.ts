import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createMercadoPagoPreference, isMercadoPagoConfigured } from "@/lib/mercadopago"
import { getSiteUrl } from "@/lib/email/client"

export async function POST(request: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "MercadoPago no configurado. Definí MERCADOPAGO_ACCESS_TOKEN." },
      { status: 503 }
    )
  }

  const { orderId } = await request.json()
  if (!orderId) return NextResponse.json({ error: "orderId requerido" }, { status: 400 })

  const supabase = await createClient({ role: "service_role" })
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).single()
  if (error || !order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

  const gift = Number(order.gift_card_amount || 0)
  const amount = Math.round((Number(order.total_amount) - gift) * 100) / 100
  if (amount <= 0) {
    return NextResponse.json({ error: "El pedido no tiene monto a cobrar por MP" }, { status: 400 })
  }

  const site = getSiteUrl()
  const tokenQuery = order.view_token ? `&t=${encodeURIComponent(order.view_token)}` : ""
  try {
    const pref = await createMercadoPagoPreference({
      orderId: order.id,
      title: `Atto pedido ${order.id.slice(0, 8)}`,
      amount,
      payerEmail: order.customer_email,
      successUrl: `${site}/pedido-confirmado?orderId=${order.id}${tokenQuery}&mp=success`,
      failureUrl: `${site}/pedido-confirmado?orderId=${order.id}${tokenQuery}&mp=failure`,
      pendingUrl: `${site}/pedido-confirmado?orderId=${order.id}${tokenQuery}&mp=pending`,
      notificationUrl: `${site}/api/payments/mercadopago/webhook`,
    })

    await supabase
      .from("orders")
      .update({
        payment_method: order.gift_card_amount > 0 ? "mixed" : "mercadopago",
        payment_status: "unpaid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)

    const initPoint =
      process.env.MERCADOPAGO_USE_SANDBOX === "true"
        ? pref.sandbox_init_point || pref.init_point
        : pref.init_point

    return NextResponse.json({ preferenceId: pref.id, initPoint })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error MercadoPago"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
