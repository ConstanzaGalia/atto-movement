import { randomBytes } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/client"
import { orderLookupEmail } from "@/lib/email/templates/order-lookup"
import { orderAccessUrl } from "@/lib/orders/access"

const GENERIC = {
  ok: true,
  message: "Si hay un pedido con ese email, te enviamos el enlace.",
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = String(body?.email || "")
    .trim()
    .toLowerCase()

  if (!email || !email.includes("@")) {
    return NextResponse.json(GENERIC)
  }

  const supabase = await createClient({ role: "service_role" })
  const { data: orders } = await supabase
    .from("orders")
    .select("id, view_token")
    .ilike("customer_email", email)
    .order("created_at", { ascending: false })
    .limit(10)

  if (!orders?.length) {
    return NextResponse.json(GENERIC)
  }

  const links: { orderId: string; url: string }[] = []
  for (const order of orders) {
    let token = order.view_token as string | null
    if (!token) {
      token = randomBytes(24).toString("hex")
      await supabase.from("orders").update({ view_token: token }).eq("id", order.id)
    }
    links.push({ orderId: order.id, url: orderAccessUrl(order.id, token) })
  }

  const mail = orderLookupEmail({ links })
  await sendEmail({ to: email, subject: mail.subject, html: mail.html })

  return NextResponse.json(GENERIC)
}
