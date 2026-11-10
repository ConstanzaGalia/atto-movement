import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
import { SpecCell } from "@/components/atto/spec-cell"
import { AdminStatusBadge } from "@/components/admin/ui"
import { SHIPPING_LABEL } from "@/lib/brand"

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

export default async function MiCuentaPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/customer-login")
  }

  const { data: customer } = await supabase.from("customers").select("*").eq("id", user.id).single()

  const email = customer?.email || user.email || ""

  const { data: ordersByUser } = await supabase
    .from("orders")
    .select("id, total_amount, status, payment_status, created_at, tracking_number")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  let orders = ordersByUser || []
  if (orders.length === 0 && email) {
    const { data: ordersByEmail } = await supabase
      .from("orders")
      .select("id, total_amount, status, payment_status, created_at, tracking_number")
      .ilike("customer_email", email)
      .order("created_at", { ascending: false })
    orders = ordersByEmail || []
  }

  const totalOrders = orders.length
  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing").length
  const paidOrders = orders.filter((o) => o.payment_status === "paid" && o.status !== "cancelled")
  const spent = paidOrders.reduce((s, o) => s + Number(o.total_amount), 0)
  const recent = orders.slice(0, 3)
  const displayName = customer?.full_name || user.user_metadata?.full_name || email.split("@")[0]
  const firstName = (displayName || "Corredor").split(" ")[0]

  return (
    <div className="bg-surface min-h-[60vh]">
      <div className="max-w-5xl mx-auto px-atto py-10 md:py-14 space-y-8">
        <div className="space-y-3">
          <AttoEyebrow>
            <span className="size-1.5 bg-black" />
            <span>ACCOUNT // ONLINE</span>
          </AttoEyebrow>
          <h1 className="font-display text-headline-md md:text-headline-lg font-bold uppercase tracking-tight">
            Hola, {firstName}
          </h1>
          <p className="font-technical-data text-atto-secondary max-w-xl">
            Perfil, pedidos y seguimiento de despachos Atto.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant">
          <SpecCell label="Pedidos" value={String(totalOrders)} />
          <SpecCell label="En curso" value={String(activeOrders)} />
          <SpecCell label="Gastado" value={`$ ${Math.round(spent).toLocaleString("es-AR")}`} />
          <SpecCell label="Contacto" value={customer?.phone || "—"} hint={email} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="border border-outline-variant bg-white p-5 md:p-6 space-y-4">
            <AttoEyebrow>
              <span className="size-1.5 bg-black" />
              <span>PROFILE // DATA</span>
            </AttoEyebrow>
            <h2 className="font-display text-headline-sm font-bold uppercase">Mi perfil</h2>
            <dl className="space-y-2 font-technical-data">
              <div className="flex justify-between gap-4 border-b border-outline-variant/60 pb-2">
                <dt className="text-atto-secondary uppercase text-[10px] tracking-wider">Nombre</dt>
                <dd className="text-right uppercase font-bold">{customer?.full_name || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-outline-variant/60 pb-2">
                <dt className="text-atto-secondary uppercase text-[10px] tracking-wider">Email</dt>
                <dd className="text-right normal-case">{email}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-outline-variant/60 pb-2">
                <dt className="text-atto-secondary uppercase text-[10px] tracking-wider">Tel</dt>
                <dd className="text-right">{customer?.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-atto-secondary uppercase text-[10px] tracking-wider">{SHIPPING_LABEL}</dt>
                <dd className="text-right normal-case max-w-[60%]">
                  {customer?.shipping_address || "Sin dirección guardada"}
                </dd>
              </div>
            </dl>
            <Link
              href="/mi-cuenta/perfil"
              className="inline-flex w-full items-center justify-center border border-black bg-black px-4 py-3 font-label-caps text-white hover:bg-transparent hover:text-black transition-colors"
            >
              Editar perfil
            </Link>
          </section>

          <section className="border border-outline-variant bg-white p-5 md:p-6 space-y-4">
            <AttoEyebrow>
              <span className="size-1.5 bg-black" />
              <span>ORDERS // RECENT</span>
            </AttoEyebrow>
            <h2 className="font-display text-headline-sm font-bold uppercase">Últimos pedidos</h2>

            {recent.length === 0 ? (
              <div className="space-y-4 py-4">
                <p className="font-technical-data text-atto-secondary uppercase">Sin pedidos aún</p>
                <Link
                  href="/tienda"
                  className="inline-flex w-full items-center justify-center border border-black px-4 py-3 font-label-caps hover:bg-black hover:text-white transition-colors"
                >
                  Ir a la colección
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((order) => (
                  <Link
                    key={order.id}
                    href={`/mi-cuenta/pedidos/${order.id}`}
                    className="block border border-outline-variant p-3 hover:border-black transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-technical-micro text-atto-secondary uppercase">
                          #{order.id.slice(0, 8)} ·{" "}
                          {new Date(order.created_at).toLocaleDateString("es-AR")}
                        </p>
                        <p className="font-technical-data font-bold mt-1">
                          $ {Number(order.total_amount).toLocaleString("es-AR")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
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
                    </div>
                    {order.tracking_number && (
                      <p className="font-technical-micro text-atto-secondary mt-2 uppercase">
                        Tracking // {order.tracking_number}
                      </p>
                    )}
                  </Link>
                ))}
                <Link
                  href="/mi-cuenta/pedidos"
                  className="inline-flex w-full items-center justify-center border border-black px-4 py-3 font-label-caps hover:bg-black hover:text-white transition-colors"
                >
                  Ver todos los pedidos
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
