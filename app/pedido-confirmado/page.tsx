import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { WHATSAPP_URL } from "@/lib/brand"

const PAYMENT_COPY: Record<string, string> = {
  paid: "El pago quedó registrado.",
  on_account: "El pedido quedó cargado en cuenta corriente.",
  awaiting_transfer: "Te contactamos por WhatsApp para coordinar la transferencia y el despacho.",
  unpaid: "El pago todavía está pendiente. Te avisamos por email cuando se acredite.",
}

export default async function PedidoConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; t?: string }>
}) {
  const { orderId, t: token } = await searchParams

  const admin = await createClient({ role: "service_role" })
  let order: {
    id: string
    total_amount: number
    customer_email: string
    payment_status: string
  } | null = null

  if (orderId && token) {
    const { data } = await admin
      .from("orders")
      .select("id, total_amount, customer_email, payment_status")
      .eq("id", orderId)
      .eq("view_token", token)
      .maybeSingle()
    order = data
  }

  if (!order && orderId) {
    const session = await createClient()
    const {
      data: { user },
    } = await session.auth.getUser()
    if (user) {
      const { data } = await admin
        .from("orders")
        .select("id, total_amount, customer_email, payment_status")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle()
      order = data
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-atto">
        <div className="text-center border border-surface-container-high bg-surface-container-lowest p-10 space-y-4">
          <p className="font-technical-data text-atto-secondary uppercase">
            No se encontró información del pedido
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pedido/consultar" className="inline-flex bg-black text-white font-label-caps px-6 py-3">
              PEDIR EL ENLACE
            </Link>
            <Link href="/tienda" className="inline-flex border border-black font-label-caps px-6 py-3">
              VOLVER A LA TIENDA
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const paymentCopy = PAYMENT_COPY[order.payment_status] || "Recibimos tu pedido."

  return (
    <div className="min-h-screen flex items-center justify-center px-atto py-16">
      <div className="max-w-md w-full text-center space-y-6 border border-surface-container-high bg-surface-container-lowest p-8">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-black" />
        </div>
        <p className="font-technical-micro text-atto-secondary">DISPATCH // CONFIRMED</p>
        <h1 className="font-headline-md uppercase">Pedido confirmado</h1>
        <div className="border border-surface-container-high p-5 text-left space-y-3">
          <p className="font-technical-micro text-atto-secondary normal-case">{paymentCopy}</p>
          <div className="space-y-2 font-technical-data">
            <div className="flex justify-between uppercase">
              <span className="text-atto-secondary">Pedido</span>
              <span className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between uppercase">
              <span className="text-atto-secondary">Total</span>
              <span className="font-bold">$ {Number(order.total_amount).toLocaleString("es-AR")} ARS</span>
            </div>
            <div className="flex justify-between uppercase">
              <span className="text-atto-secondary">Email</span>
              <span className="normal-case">{order.customer_email}</span>
            </div>
          </div>
        </div>
        <p className="font-technical-micro text-atto-secondary normal-case">
          Guardá esta página. Si la perdés, pedí el enlace de nuevo con tu email.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-black text-white font-label-caps px-6 py-3 hover:bg-neutral-800"
          >
            COORDINAR POR WHATSAPP
          </a>
          <Link
            href="/pedido/consultar"
            className="inline-flex items-center justify-center border border-black font-label-caps px-6 py-3 hover:bg-surface-container-low"
          >
            PEDIR EL ENLACE
          </Link>
        </div>
      </div>
    </div>
  )
}
