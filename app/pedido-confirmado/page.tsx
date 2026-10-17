import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { WHATSAPP_URL } from "@/lib/brand"

export default async function PedidoConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-atto">
        <div className="text-center border border-surface-container-high bg-surface-container-lowest p-10">
          <p className="font-technical-data text-atto-secondary mb-4 uppercase">
            No se encontró información del pedido
          </p>
          <Link
            href="/tienda"
            className="inline-flex bg-black text-white font-label-caps px-6 py-3"
          >
            VOLVER A LA TIENDA
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single()

  return (
    <div className="min-h-screen flex items-center justify-center px-atto py-16">
      <div className="max-w-md w-full text-center space-y-6 border border-surface-container-high bg-surface-container-lowest p-8">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-black" />
        </div>
        <p className="font-technical-micro text-atto-secondary">DISPATCH // CONFIRMED</p>
        <h1 className="font-headline-md uppercase">Pedido confirmado</h1>
        <div className="border border-surface-container-high p-5 text-left space-y-3">
          <p className="font-technical-micro text-atto-secondary">
            Tu pedido fue recibido. Te contactamos por WhatsApp para coordinar el pago y el
            despacho.
          </p>
          {order && (
            <div className="space-y-2 font-technical-data">
              <div className="flex justify-between uppercase">
                <span className="text-atto-secondary">Pedido</span>
                <span className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between uppercase">
                <span className="text-atto-secondary">Total</span>
                <span className="font-bold">
                  $ {order.total_amount.toLocaleString("es-AR")} ARS
                </span>
              </div>
              <div className="flex justify-between uppercase">
                <span className="text-atto-secondary">Email</span>
                <span className="normal-case">{order.customer_email}</span>
              </div>
            </div>
          )}
        </div>
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
            href="/tienda"
            className="inline-flex items-center justify-center border border-black font-label-caps px-6 py-3 hover:bg-surface-container-low"
          >
            SEGUIR EXPLORANDO
          </Link>
        </div>
      </div>
    </div>
  )
}
