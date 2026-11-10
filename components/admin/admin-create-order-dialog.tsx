"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DEFAULT_SHIPPING_BASE_COST } from "@/lib/brand"

type CustomerOption = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  shipping_address: string | null
}

type ProductOption = {
  id: string
  name: string
  sku: string | null
  price: number
}

type VariantOption = {
  id: string
  color: string
  stock: number
}

type SizeOption = {
  id: string
  size: string
  stock: number
}

type LineDraft = {
  key: string
  productId: string
  productName: string
  variantId: string
  color: string
  variantSizeId: string
  size: string
  quantity: number
  unitPrice: number
}

export function AdminCreateOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const supabase = createClient()
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "mercadopago" | "account_credit">(
    "transfer"
  )
  const [freeShipping, setFreeShipping] = useState(false)
  const [shippingCost, setShippingCost] = useState(String(DEFAULT_SHIPPING_BASE_COST))
  const [lines, setLines] = useState<LineDraft[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [pickProductId, setPickProductId] = useState("")
  const [variants, setVariants] = useState<VariantOption[]>([])
  const [pickVariantId, setPickVariantId] = useState("")
  const [sizes, setSizes] = useState<SizeOption[]>([])
  const [pickSizeId, setPickSizeId] = useState("")
  const [pickQty, setPickQty] = useState("1")

  useEffect(() => {
    if (!open) return
    const load = async () => {
      const [{ data: customerRows }, { data: productRows }] = await Promise.all([
        supabase.from("customer_accounts").select("id, email, full_name, phone, shipping_address").order("full_name"),
        supabase.from("products").select("id, name, sku, price").order("name"),
      ])
      setCustomers((customerRows as CustomerOption[]) || [])
      setProducts((productRows as ProductOption[]) || [])
    }
    load()
  }, [open])

  useEffect(() => {
    if (!selectedCustomerId || customerMode !== "existing") return
    const c = customers.find((x) => x.id === selectedCustomerId)
    if (!c) return
    setCustomerName(c.full_name || "")
    setCustomerEmail(c.email || "")
    setCustomerPhone(c.phone || "")
    setShippingAddress(c.shipping_address || "")
  }, [selectedCustomerId, customers, customerMode])

  useEffect(() => {
    if (!pickProductId) {
      setVariants([])
      setPickVariantId("")
      setSizes([])
      setPickSizeId("")
      return
    }
    const loadVariants = async () => {
      const { data } = await supabase
        .from("product_variants")
        .select("id, color, stock")
        .eq("product_id", pickProductId)
        .order("color")
      setVariants((data as VariantOption[]) || [])
      setPickVariantId("")
      setSizes([])
      setPickSizeId("")
    }
    loadVariants()
  }, [pickProductId])

  useEffect(() => {
    if (!pickVariantId) {
      setSizes([])
      setPickSizeId("")
      return
    }
    const loadSizes = async () => {
      const { data } = await supabase
        .from("product_variant_sizes")
        .select("id, size, stock")
        .eq("variant_id", pickVariantId)
        .order("size")
      setSizes((data as SizeOption[]) || [])
      setPickSizeId("")
    }
    loadSizes()
  }, [pickVariantId])

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines]
  )

  const addLine = () => {
    const product = products.find((p) => p.id === pickProductId)
    const variant = variants.find((v) => v.id === pickVariantId)
    const size = sizes.find((s) => s.id === pickSizeId)
    const qty = Number(pickQty)
    if (!product || !variant || !size || !Number.isInteger(qty) || qty < 1) {
      alert("Elegí producto, color, talle y cantidad")
      return
    }
    if (size.stock < qty) {
      alert(`Stock disponible: ${size.stock}`)
      return
    }
    setLines((prev) => [
      ...prev,
      {
        key: `${size.id}-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        color: variant.color,
        variantSizeId: size.id,
        size: size.size,
        quantity: qty,
        unitPrice: Number(product.price),
      },
    ])
    setPickQty("1")
  }

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  const submit = async () => {
    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
      alert("Completá nombre, email y dirección")
      return
    }
    if (lines.length === 0) {
      alert("Agregá al menos un ítem")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          notes: notes.trim(),
          paymentMethod,
          useAccountCredit: paymentMethod === "account_credit",
          freeShipping,
          shippingCost: freeShipping ? 0 : Number(shippingCost) || 0,
          items: lines.map((l) => ({
            variantSizeId: l.variantSizeId,
            quantity: l.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Error al crear el pedido")
        return
      }
      setLines([])
      setNotes("")
      setPaymentMethod("transfer")
      setFreeShipping(false)
      onOpenChange(false)
      onCreated()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display uppercase">Nuevo pedido</DialogTitle>
          <DialogDescription>
            Venta offline (WhatsApp / mostrador). Descuenta stock como la web.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex gap-3 font-technical-data">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={customerMode === "existing"}
                onChange={() => setCustomerMode("existing")}
              />
              Cliente existente
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={customerMode === "new"}
                onChange={() => {
                  setCustomerMode("new")
                  setSelectedCustomerId("")
                }}
              />
              Cliente nuevo
            </label>
          </div>

          {customerMode === "existing" && (
            <div>
              <Label className="mb-1 block">Cliente</Label>
              <Select value={selectedCustomerId || undefined} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Elegir cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {(c.full_name || "Sin nombre") + " · " + c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block">Nombre *</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="rounded-none" />
            </div>
            <div>
              <Label className="mb-1 block">Email *</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="rounded-none normal-case"
              />
            </div>
            <div>
              <Label className="mb-1 block">Teléfono</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="rounded-none" />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Dirección *</Label>
              <Textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="rounded-none"
                rows={2}
              />
            </div>
          </div>

          <div className="border border-outline-variant p-3 space-y-3">
            <p className="font-technical-micro uppercase text-outline">Agregar ítem</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Select value={pickProductId || undefined} onValueChange={setPickProductId}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.sku ? ` (${p.sku})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={pickVariantId || undefined}
                onValueChange={setPickVariantId}
                disabled={!pickProductId}
              >
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((v) => (
                    <SelectItem key={v.id} value={v.id} disabled={v.stock <= 0}>
                      {v.color} ({v.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={pickSizeId || undefined} onValueChange={setPickSizeId} disabled={!pickVariantId}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Talle" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => (
                    <SelectItem key={s.id} value={s.id} disabled={s.stock <= 0}>
                      {s.size} ({s.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  value={pickQty}
                  onChange={(e) => setPickQty(e.target.value)}
                  className="rounded-none"
                  placeholder="Cant."
                />
                <button
                  type="button"
                  onClick={addLine}
                  className="border border-black px-3 py-2 font-label-caps whitespace-nowrap hover:bg-black hover:text-white"
                >
                  Sumar
                </button>
              </div>
            </div>

            {lines.length > 0 && (
              <div className="space-y-1">
                {lines.map((line) => (
                  <div
                    key={line.key}
                    className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center font-technical-data border-b border-outline-variant/50 py-2"
                  >
                    <span className="min-w-0 break-words">
                      {line.productName} · {line.color} · {line.size} × {line.quantity}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      $ {(line.unitPrice * line.quantity).toLocaleString("es-AR")}
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="text-atto-secondary underline"
                      >
                        Quitar
                      </button>
                    </span>
                  </div>
                ))}
                <p className="font-technical-data font-bold pt-1">
                  Subtotal $ {subtotal.toLocaleString("es-AR")}
                </p>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block">Pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
              >
                <SelectTrigger className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="account_credit">Cuenta corriente</SelectItem>
                  <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Despacho</Label>
              <label className="flex items-center gap-2 font-technical-data mb-2">
                <input
                  type="checkbox"
                  checked={freeShipping}
                  onChange={(e) => setFreeShipping(e.target.checked)}
                />
                Despacho gratis
              </label>
              {!freeShipping && (
                <Input
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="rounded-none"
                  placeholder="Costo despacho"
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Notas</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-none" rows={2} />
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="w-full bg-black text-white px-4 py-3 font-label-caps disabled:opacity-50"
          >
            {submitting ? "Creando…" : "Confirmar pedido"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
