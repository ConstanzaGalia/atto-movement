"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import {
  AdminPageHeader,
  AdminDataTable,
  AdminTableHead,
  AdminTh,
  AdminTd,
  AdminStatusBadge,
} from "@/components/admin/ui"

type Order = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: string
  total_amount: number
  status: string
  notes: string | null
  created_at: string
  payment_status?: string
  payment_method?: string
  payment_notes?: string | null
  paid_at?: string | null
  shipping_cost?: number
  shipping_carrier?: string | null
  tracking_number?: string | null
  internal_notes?: string | null
  gift_card_amount?: number
}

type OrderItem = {
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  variant_color: string | null
  variant_size: string | null
}

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Sin pagar",
  awaiting_transfer: "Espera transfer",
  paid: "Pagado",
  refunded: "Reembolsado",
  on_account: "Cta. cte.",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

export function OrdersManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [carrier, setCarrier] = useState("")
  const [tracking, setTracking] = useState("")

  const supabase = createClient()

  const fetchOrders = async () => {
    setIsLoading(true)
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (statusFilter !== "all") query = query.eq("status", statusFilter)
    if (paymentFilter !== "all") query = query.eq("payment_status", paymentFilter)

    const { data } = await query
    let rows = (data as Order[]) || []
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (o) =>
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_email?.toLowerCase().includes(q) ||
          o.customer_phone?.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      )
    }
    setOrders(rows)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, paymentFilter])

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order)
    setPaymentNotes(order.payment_notes || "")
    setInternalNotes(order.internal_notes || "")
    setCarrier(order.shipping_carrier || "")
    setTracking(order.tracking_number || "")
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id)
    if (data) setOrderItems(data)
    setIsDialogOpen(true)
  }

  const handleStatusChange = async (orderId: string, newStatus: string, oldStatus: string) => {
    const response = await fetch("/api/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, newStatus, oldStatus }),
    })
    if (!response.ok) {
      alert("Error al actualizar el estado del pedido")
      return
    }
    await fetchOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const markPayment = async (paymentStatus: string) => {
    if (!selectedOrder) return
    const response = await fetch("/api/orders/update-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: selectedOrder.id,
        paymentStatus,
        paymentNotes,
      }),
    })
    if (!response.ok) {
      alert("Error al actualizar cobro")
      return
    }
    await fetchOrders()
    setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus, payment_notes: paymentNotes })
  }

  const saveInternalNotes = async () => {
    if (!selectedOrder) return
    await fetch("/api/orders/update-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selectedOrder.id, internalNotes }),
    })
    setSelectedOrder({ ...selectedOrder, internal_notes: internalNotes })
  }

  const saveShipping = async (notifyCustomer: boolean) => {
    if (!selectedOrder) return
    const response = await fetch("/api/orders/update-shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: selectedOrder.id,
        shippingCarrier: carrier,
        trackingNumber: tracking,
        notifyCustomer,
      }),
    })
    if (!response.ok) {
      alert("Error al guardar envío")
      return
    }
    setSelectedOrder({
      ...selectedOrder,
      shipping_carrier: carrier,
      tracking_number: tracking,
    })
    await fetchOrders()
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // ORDERS"
        title="Pedidos"
        description="Logística y cobranza. Marcá transferencias y cargá tracking."
      />

      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Buscar nombre, email, tel…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
          className="rounded-none md:max-w-xs font-technical-data"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-none md:w-44 font-technical-data">
            <SelectValue placeholder="Logística" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas logística</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="preparing">Preparando</SelectItem>
            <SelectItem value="delivered">Entregados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="rounded-none md:w-44 font-technical-data">
            <SelectValue placeholder="Cobro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos cobros</SelectItem>
            <SelectItem value="awaiting_transfer">Espera transfer</SelectItem>
            <SelectItem value="paid">Pagados</SelectItem>
            <SelectItem value="on_account">Cta. cte.</SelectItem>
            <SelectItem value="unpaid">Sin pagar</SelectItem>
            <SelectItem value="refunded">Reembolsados</SelectItem>
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={fetchOrders}
          className="border border-black px-4 py-2 font-label-caps hover:bg-black hover:text-white transition-colors"
        >
          Filtrar
        </button>
      </div>

      {isLoading ? (
        <p className="font-technical-data text-atto-secondary uppercase">Cargando…</p>
      ) : (
        <AdminDataTable>
          <AdminTableHead>
            <AdminTh>Fecha</AdminTh>
            <AdminTh>Cliente</AdminTh>
            <AdminTh>Total</AdminTh>
            <AdminTh>Cobro</AdminTh>
            <AdminTh>Logística</AdminTh>
            <AdminTh></AdminTh>
          </AdminTableHead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-container-low/80">
                <AdminTd>{new Date(order.created_at).toLocaleDateString("es-AR")}</AdminTd>
                <AdminTd>
                  <div className="normal-case">
                    <p className="font-bold uppercase">{order.customer_name}</p>
                    <p className="text-atto-secondary">{order.customer_email}</p>
                  </div>
                </AdminTd>
                <AdminTd>$ {Number(order.total_amount).toLocaleString("es-AR")}</AdminTd>
                <AdminTd>
                  <AdminStatusBadge
                    status={order.payment_status || "awaiting_transfer"}
                    label={PAYMENT_LABELS[order.payment_status || "awaiting_transfer"]}
                  />
                </AdminTd>
                <AdminTd>
                  <Select
                    value={order.status}
                    onValueChange={(v) => handleStatusChange(order.id, v, order.status)}
                  >
                    <SelectTrigger className="rounded-none h-8 w-36 font-technical-micro">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="preparing">Preparando</SelectItem>
                      <SelectItem value="delivered">Entregado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </AdminTd>
                <AdminTd>
                  <button
                    type="button"
                    onClick={() => handleViewOrder(order)}
                    className="font-technical-micro uppercase border-b border-black"
                  >
                    Ver
                  </button>
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminDataTable>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              Pedido {selectedOrder ? selectedOrder.id.slice(0, 8) : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5 font-technical-data">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="text-atto-secondary">Cliente</span>
                  <br />
                  {selectedOrder.customer_name}
                </p>
                <p>
                  <span className="text-atto-secondary">Email</span>
                  <br />
                  {selectedOrder.customer_email}
                </p>
                <p>
                  <span className="text-atto-secondary">Tel</span>
                  <br />
                  {selectedOrder.customer_phone || "—"}
                </p>
                <p>
                  <span className="text-atto-secondary">Método</span>
                  <br />
                  {selectedOrder.payment_method || "transfer"}
                </p>
                <p className="col-span-2">
                  <span className="text-atto-secondary">Dirección</span>
                  <br />
                  {selectedOrder.shipping_address}
                </p>
              </div>

              <div className="space-y-2 border border-outline-variant p-3">
                <p className="font-technical-micro text-outline uppercase">Ítems</p>
                {orderItems.map((item, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>$ {Number(item.subtotal).toLocaleString("es-AR")}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Envío</span>
                  <span>$ {Number(selectedOrder.shipping_cost || 0).toLocaleString("es-AR")}</span>
                </div>
                {(selectedOrder.gift_card_amount || 0) > 0 && (
                  <div className="flex justify-between text-atto-secondary">
                    <span>Gift card</span>
                    <span>- $ {Number(selectedOrder.gift_card_amount).toLocaleString("es-AR")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>$ {Number(selectedOrder.total_amount).toLocaleString("es-AR")}</span>
                </div>
              </div>

              <div className="space-y-2 border border-outline-variant p-3">
                <p className="font-technical-micro text-outline uppercase">Cobro</p>
                <AdminStatusBadge
                  status={selectedOrder.payment_status || "awaiting_transfer"}
                  label={PAYMENT_LABELS[selectedOrder.payment_status || "awaiting_transfer"]}
                />
                <Textarea
                  placeholder="Ref. transferencia / notas de pago"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="rounded-none"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => markPayment("paid")}
                    className="bg-black text-white px-3 py-2 font-label-caps"
                  >
                    Marcar pagado
                  </button>
                  <button
                    type="button"
                    onClick={() => markPayment("awaiting_transfer")}
                    className="border border-black px-3 py-2 font-label-caps"
                  >
                    Espera transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => markPayment("refunded")}
                    className="border border-outline px-3 py-2 font-label-caps text-atto-secondary"
                  >
                    Reembolso
                  </button>
                </div>
              </div>

              <div className="space-y-2 border border-outline-variant p-3">
                <p className="font-technical-micro text-outline uppercase">Envío / tracking</p>
                <Input
                  placeholder="Carrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="rounded-none"
                />
                <Input
                  placeholder="Tracking"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  className="rounded-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveShipping(false)}
                    className="border border-black px-3 py-2 font-label-caps"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => saveShipping(true)}
                    className="bg-black text-white px-3 py-2 font-label-caps"
                  >
                    Guardar + email
                  </button>
                </div>
              </div>

              <div className="space-y-2 border border-outline-variant p-3">
                <p className="font-technical-micro text-outline uppercase">Notas internas</p>
                <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className="rounded-none" />
                <button
                  type="button"
                  onClick={saveInternalNotes}
                  className="border border-black px-3 py-2 font-label-caps"
                >
                  Guardar notas
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-technical-micro text-outline">Logística:</span>
                <AdminStatusBadge status={selectedOrder.status} label={STATUS_LABELS[selectedOrder.status]} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
