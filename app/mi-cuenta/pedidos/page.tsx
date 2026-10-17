import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
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

export default async function PedidosPage() {
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

  const { data: ordersByUser } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  let orders = ordersByUser || []
  if (orders.length === 0 && email) {
    const { data: ordersByEmail } = await supabase
      .from("orders")
      .select("*")
      .ilike("customer_email", email)
      .order("created_at", { ascending: false })
    orders = ordersByEmail || []
  }

  return (
    <div className="bg-surface min-h-[50vh]">
      <div className="max-w-3xl mx-auto px-atto py-10 md:py-14 space-y-6">
        <Link
          href="/mi-cuenta"
          className="inline-flex font-technical-micro text-atto-secondary uppercase border-b border-outline-variant hover:text-black hover:border-black"
        >
          ← Volver a mi cuenta
        </Link>

        <div className="space-y-2">
          <AttoEyebrow>
            <span className="size-1.5 bg-black" />
            <span>ACCOUNT // ORDERS</span>
          </AttoEyebrow>
          <h1 className="font-display text-headline-sm md:text-headline-md font-bold uppercase tracking-tight">
            Mis pedidos
          </h1>
          <p className="font-technical-data text-atto-secondary">
            {orders.length} pedido{orders.length === 1 ? "" : "s"} registrados
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="border border-outline-variant bg-white p-8 text-center space-y-4">
            <p className="font-technical-data text-atto-secondary uppercase">Sin pedidos aún</p>
            <Link
              href="/tienda"
              className="inline-flex border border-black bg-black px-4 py-3 font-label-caps text-white hover:bg-transparent hover:text-black transition-colors"
            >
              Ir a la colección
            </Link>
          </div>
        ) : (
          <div className="border border-outline-variant bg-white divide-y divide-outline-variant">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/mi-cuenta/pedidos/${order.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-container-low/60 transition-colors"
              >
                <div>
                  <p className="font-technical-micro text-atto-secondary uppercase">
                    #{order.id.slice(0, 8)} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="font-display font-bold uppercase mt-1">
                    $ {Number(order.total_amount).toLocaleString("es-AR")}
                  </p>
                  {order.tracking_number && (
                    <p className="font-technical-micro text-atto-secondary mt-1 uppercase">
                      Tracking // {order.tracking_number}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <AdminStatusBadge
                    status={order.status}
                    label={STATUS_LABELS[order.status] || order.status}
                  />
                  {order.payment_status && (
                    <AdminStatusBadge
                      status={order.payment_status}
                      label={PAYMENT_LABELS[order.payment_status] || order.payment_status}
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
