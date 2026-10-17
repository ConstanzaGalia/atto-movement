"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { AdminPageHeader, AdminKpiStrip, AdminDataTable, AdminTableHead, AdminTh, AdminTd, AdminStatusBadge } from "@/components/admin/ui"

function monthStart() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function SalesStats() {
  const [isLoading, setIsLoading] = useState(true)
  const [from, setFrom] = useState(monthStart())
  const [to, setTo] = useState(today())
  const [stats, setStats] = useState({
    totalSales: 0,
    paidOrders: 0,
    awaitingTransfer: 0,
    lowStockProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<
    Array<{
      id: string
      customer_name: string
      total_amount: number
      status: string
      payment_status: string
      created_at: string
    }>
  >([])

  const supabase = createClient()

  const fetchStats = async () => {
    setIsLoading(true)
    const fromIso = new Date(from).toISOString()
    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)

    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount, payment_status, status")
      .gte("created_at", fromIso)
      .lte("created_at", toDate.toISOString())

    const paid = (orders || []).filter((o) => o.payment_status === "paid" && o.status !== "cancelled")
    const totalSales = paid.reduce((sum, order) => sum + Number(order.total_amount), 0)
    const awaitingTransfer =
      (orders || []).filter((o) => o.payment_status === "awaiting_transfer" && o.status !== "cancelled").length

    const { count: lowStockProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("stock", 10)

    setStats({
      totalSales,
      paidOrders: paid.length,
      awaitingTransfer,
      lowStockProducts: lowStockProducts || 0,
    })

    const { data: recent } = await supabase
      .from("orders")
      .select("id, customer_name, total_amount, status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recent) setRecentOrders(recent as typeof recentOrders)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // DASHBOARD"
        title="Operaciones"
        description="Ventas netas = cobrado (paid), sin cancelados."
      />

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="font-technical-micro text-outline uppercase block mb-1">Desde</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-none" />
        </div>
        <div>
          <label className="font-technical-micro text-outline uppercase block mb-1">Hasta</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-none" />
        </div>
        <button type="button" onClick={fetchStats} className="bg-black text-white px-4 py-2 font-label-caps">
          Actualizar
        </button>
      </div>

      {isLoading ? (
        <p className="font-technical-data text-atto-secondary uppercase">Cargando…</p>
      ) : (
        <>
          <AdminKpiStrip
            items={[
              { label: "Ventas netas", value: `$ ${stats.totalSales.toLocaleString("es-AR")}` },
              { label: "Pedidos pagos", value: String(stats.paidOrders) },
              { label: "Espera transfer", value: String(stats.awaitingTransfer) },
              { label: "Stock bajo", value: String(stats.lowStockProducts), hint: "< 10 u." },
            ]}
          />

          <div>
            <p className="font-technical-micro text-outline uppercase mb-2">Últimos pedidos</p>
            <AdminDataTable>
              <AdminTableHead>
                <AdminTh>Cliente</AdminTh>
                <AdminTh>Total</AdminTh>
                <AdminTh>Cobro</AdminTh>
                <AdminTh>Logística</AdminTh>
              </AdminTableHead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <AdminTd>
                      <p className="font-bold uppercase">{o.customer_name}</p>
                      <p className="text-atto-secondary">{new Date(o.created_at).toLocaleDateString("es-AR")}</p>
                    </AdminTd>
                    <AdminTd>$ {Number(o.total_amount).toLocaleString("es-AR")}</AdminTd>
                    <AdminTd>
                      <AdminStatusBadge status={o.payment_status || "awaiting_transfer"} />
                    </AdminTd>
                    <AdminTd>
                      <AdminStatusBadge status={o.status} />
                    </AdminTd>
                  </tr>
                ))}
              </tbody>
            </AdminDataTable>
          </div>
        </>
      )}
    </div>
  )
}
