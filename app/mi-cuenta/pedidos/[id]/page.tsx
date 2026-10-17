import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
import { SpecCell } from "@/components/atto/spec-cell"
import { AdminStatusBadge } from "@/components/admin/ui"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

const PAYMENT_LABELS: Record<string, string> = {
  awaiting_transfer: "Espera transfer",
  unpaid: "Sin pagar",
  paid: "Pagado",
  refunded: "Reembolso",
  on_account: "Cta. cte.",
}

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/customer-login")
  }

  const { data: customer } = await supabase.from("customers").select("email").eq("id", user.id).single()
  const email = customer?.email || user.email || ""

  let { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!order && email) {
    const { data: byEmail } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .ilike("customer_email", email)
      .maybeSingle()
    order = byEmail
  }

  if (!order) {
    notFound()
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at")

  return (
    <div className="bg-surface min-h-[50vh]">
      <div className="max-w-3xl mx-auto px-atto py-10 md:py-14 space-y-6">
        <Link
          href="/mi-cuenta/pedidos"
          className="inline-flex font-technical-micro text-atto-secondary uppercase border-b border-outline-variant hover:text-black hover:border-black"
        >
          ← Volver a pedidos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-2">
            <AttoEyebrow>
              <span className="size-1.5 bg-black" />
              <span>ORDER // #{order.id.slice(0, 8).toUpperCase()}</span>
            </AttoEyebrow>
            <h1 className="font-display text-headline-sm md:text-headline-md font-bold uppercase tracking-tight">
              Detalle del pedido
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge status={order.status} label={STATUS_LABELS[order.status] || order.status} />
            {order.payment_status && (
              <AdminStatusBadge
                status={order.payment_status}
                label={PAYMENT_LABELS[order.payment_status] || order.payment_status}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant">
          <SpecCell
            label="Fecha"
            value={new Date(order.created_at).toLocaleDateString("es-AR")}
          />
          <SpecCell label="Total" value={`$ ${Number(order.total_amount).toLocaleString("es-AR")}`} />
          <SpecCell
            label="Envío"
            value={
              order.shipping_cost != null
                ? Number(order.shipping_cost) === 0
                  ? "Gratis"
                  : `$ ${Number(order.shipping_cost).toLocaleString("es-AR")}`
                : "—"
            }
          />
          <SpecCell label="Tracking" value={order.tracking_number || "—"} hint={order.shipping_carrier || undefined} />
        </div>

        <section className="border border-outline-variant bg-white p-5 space-y-3">
          <p className="font-technical-micro text-outline uppercase">Envío</p>
          <dl className="space-y-2 font-technical-data">
            <div className="flex justify-between gap-4 border-b border-outline-variant/50 pb-2">
              <dt className="text-atto-secondary uppercase text-[10px]">Nombre</dt>
              <dd className="uppercase font-bold text-right">{order.customer_name}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-outline-variant/50 pb-2">
              <dt className="text-atto-secondary uppercase text-[10px]">Email</dt>
              <dd className="normal-case text-right">{order.customer_email}</dd>
            </div>
            {order.customer_phone && (
              <div className="flex justify-between gap-4 border-b border-outline-variant/50 pb-2">
                <dt className="text-atto-secondary uppercase text-[10px]">Tel</dt>
                <dd className="text-right">{order.customer_phone}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-atto-secondary uppercase text-[10px]">Dirección</dt>
              <dd className="normal-case text-right max-w-[65%]">{order.shipping_address}</dd>
            </div>
            {order.notes && (
              <div className="flex justify-between gap-4 pt-2 border-t border-outline-variant/50">
                <dt className="text-atto-secondary uppercase text-[10px]">Notas</dt>
                <dd className="normal-case text-right max-w-[65%]">{order.notes}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="border border-outline-variant bg-white">
          <div className="px-5 py-3 border-b border-outline-variant">
            <p className="font-technical-micro text-outline uppercase">Productos</p>
          </div>
          <div className="divide-y divide-outline-variant">
            {orderItems?.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 px-5 py-3 font-technical-data">
                <div>
                  <p className="font-bold uppercase">{item.product_name}</p>
                  <p className="text-atto-secondary mt-0.5">
                    {item.quantity} × $ {Number(item.product_price).toLocaleString("es-AR")}
                    {item.variant_color ? ` // ${item.variant_color}` : ""}
                    {item.variant_size ? ` // Talle ${item.variant_size}` : ""}
                  </p>
                </div>
                <p className="font-bold shrink-0">$ {Number(item.subtotal).toLocaleString("es-AR")}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-5 py-4 border-t border-black font-label-caps">
            <span>Total</span>
            <span>$ {Number(order.total_amount).toLocaleString("es-AR")}</span>
          </div>
        </section>
      </div>
    </div>
  )
}
