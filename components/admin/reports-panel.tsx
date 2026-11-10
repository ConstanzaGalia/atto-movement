"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { AdminPageHeader, AdminKpiStrip, AdminDataTable, AdminTableHead, AdminTh, AdminTd } from "@/components/admin/ui"

type Order = {
  id: string
  total_amount: number
  payment_status: string
  payment_method: string
  status: string
  created_at: string
  customer_name: string
}

type OrderItem = {
  product_name: string
  quantity: number
  subtotal: number
  order_id: string
}

function monthStart() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function ReportsPanel() {
  const supabase = createClient()
  const [from, setFrom] = useState(monthStart())
  const [to, setTo] = useState(today())
  const [orders, setOrders] = useState<Order[]>([])
  const [items, setItems] = useState<OrderItem[]>([])

  const load = async () => {
    const fromIso = new Date(from).toISOString()
    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)
    const { data } = await supabase
      .from("orders")
      .select("id, total_amount, payment_status, payment_method, status, created_at, customer_name")
      .gte("created_at", fromIso)
      .lte("created_at", toDate.toISOString())
      .order("created_at", { ascending: false })
    const rows = (data as Order[]) || []
    setOrders(rows)
    if (rows.length) {
      const { data: itemRows } = await supabase
        .from("order_items")
        .select("product_name, quantity, subtotal, order_id")
        .in(
          "order_id",
          rows.map((o) => o.id)
        )
      setItems((itemRows as OrderItem[]) || [])
    } else {
      setItems([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const paidOrders = useMemo(
    () => orders.filter((o) => o.payment_status === "paid" && o.status !== "cancelled"),
    [orders]
  )

  const netSales = paidOrders.reduce((s, o) => s + Number(o.total_amount), 0)
  const avgTicket = paidOrders.length ? netSales / paidOrders.length : 0

  const byMethod = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of paidOrders) {
      const key = o.payment_method || "transfer"
      map.set(key, (map.get(key) || 0) + Number(o.total_amount))
    }
    return Array.from(map.entries())
  }, [paidOrders])

  const topProducts = useMemo(() => {
    const paidIds = new Set(paidOrders.map((o) => o.id))
    const map = new Map<string, { qty: number; total: number }>()
    for (const item of items) {
      if (!paidIds.has(item.order_id)) continue
      const cur = map.get(item.product_name) || { qty: 0, total: 0 }
      cur.qty += item.quantity
      cur.total += Number(item.subtotal)
      map.set(item.product_name, cur)
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [items, paidOrders])

  const exportCsv = () => {
    const header = ["id", "fecha", "cliente", "total", "payment_status", "payment_method", "status"]
    const lines = [
      header.join(","),
      ...orders.map((o) =>
        [
          o.id,
          o.created_at,
          `"${o.customer_name.replaceAll('"', '""')}"`,
          o.total_amount,
          o.payment_status,
          o.payment_method,
          o.status,
        ].join(",")
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `atto-pedidos-${from}_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // REPORTES"
        title="Reportes"
        description="Ventas netas = pedidos pagados, sin cancelados."
        action={
          <button type="button" onClick={exportCsv} className="border border-black px-3 py-2 font-label-caps">
            Export CSV
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
        <div className="w-full sm:w-auto">
          <label className="font-technical-micro text-outline uppercase block mb-1">Desde</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-none w-full" />
        </div>
        <div className="w-full sm:w-auto">
          <label className="font-technical-micro text-outline uppercase block mb-1">Hasta</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-none w-full" />
        </div>
        <button type="button" onClick={load} className="bg-black text-white px-4 py-2 font-label-caps w-full sm:w-auto">
          Actualizar
        </button>
      </div>

      <AdminKpiStrip
        items={[
          { label: "Ventas netas", value: `$ ${netSales.toLocaleString("es-AR")}` },
          { label: "Pedidos pagos", value: String(paidOrders.length) },
          { label: "Ticket prom.", value: `$ ${Math.round(avgTicket).toLocaleString("es-AR")}` },
          { label: "Pedidos periodo", value: String(orders.length) },
        ]}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-technical-micro text-outline uppercase mb-2">Por método de pago</p>
          <AdminDataTable compact>
            <AdminTableHead>
              <AdminTh>Método</AdminTh>
              <AdminTh>Total</AdminTh>
            </AdminTableHead>
            <tbody>
              {byMethod.map(([method, total]) => (
                <tr key={method}>
                  <AdminTd>{method}</AdminTd>
                  <AdminTd>$ {total.toLocaleString("es-AR")}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminDataTable>
        </div>
        <div>
          <p className="font-technical-micro text-outline uppercase mb-2">Top productos</p>
          <AdminDataTable compact>
            <AdminTableHead>
              <AdminTh>Producto</AdminTh>
              <AdminTh>Qty</AdminTh>
              <AdminTh>Total</AdminTh>
            </AdminTableHead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.name}>
                  <AdminTd className="normal-case max-w-[140px] sm:max-w-[180px] truncate">{p.name}</AdminTd>
                  <AdminTd>{p.qty}</AdminTd>
                  <AdminTd>$ {p.total.toLocaleString("es-AR")}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminDataTable>
        </div>
      </div>
    </div>
  )
}
