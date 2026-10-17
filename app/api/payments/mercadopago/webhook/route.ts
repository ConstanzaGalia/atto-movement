import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { fetchMercadoPagoPayment, isMercadoPagoConfigured } from "@/lib/mercadopago"

export async function POST(request: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ ok: true })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const url = new URL(request.url)
    const topic = url.searchParams.get("topic") || url.searchParams.get("type") || body.type
    const dataId =
      url.searchParams.get("id") ||
      url.searchParams.get("data.id") ||
      body?.data?.id ||
      body?.id

    if (topic !== "payment" && topic !== "payments" && body.action !== "payment.updated") {
      return NextResponse.json({ ok: true })
    }

    if (!dataId) return NextResponse.json({ ok: true })

    const payment = await fetchMercadoPagoPayment(String(dataId))
    const orderId = payment.external_reference
    if (!orderId) return NextResponse.json({ ok: true })

    const supabase = await createClient({ role: "service_role" })

    if (payment.status === "approved") {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          mercadopago_payment_id: String(payment.id),
          payment_method: "mercadopago",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[mp webhook]", err)
    return NextResponse.json({ ok: true })
  }
}

export async function GET(request: Request) {
  // MP sometimes pings with query params
  return POST(request)
}
