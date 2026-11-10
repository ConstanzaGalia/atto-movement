"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AdminPageHeader,
  AdminDataTable,
  AdminTableHead,
  AdminTh,
  AdminTd,
  AdminKpiStrip,
} from "@/components/admin/ui"

type CustomerAccount = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  shipping_address: string | null
  notes: string | null
  created_at: string
}

type CreditAccount = {
  id: string
  credit_limit: number
  balance: number
  enabled: boolean
}

type CreditMovement = {
  id: string
  type: string
  amount: number
  notes: string | null
  created_at: string
  order_id: string | null
}

type OrderRow = {
  id: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
}

export function CustomersManager() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<CustomerAccount[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<CustomerAccount | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [credit, setCredit] = useState<CreditAccount | null>(null)
  const [movements, setMovements] = useState<CreditMovement[]>([])
  const [notes, setNotes] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [creditLimit, setCreditLimit] = useState("0")
  const [creditEnabled, setCreditEnabled] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newAddress, setNewAddress] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [newEnableCredit, setNewEnableCredit] = useState(false)
  const [newCreditLimit, setNewCreditLimit] = useState("0")

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customer_accounts")
      .select("*")
      .order("created_at", { ascending: false })
    let rows = (data as CustomerAccount[]) || []
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.full_name?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      )
    }
    setCustomers(rows)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const openCustomer = async (c: CustomerAccount) => {
    setSelected(c)
    setNotes(c.notes || "")
    setPhone(c.phone || "")
    setAddress(c.shipping_address || "")

    const { data: orderRows } = await supabase
      .from("orders")
      .select("id, total_amount, status, payment_status, created_at")
      .eq("customer_account_id", c.id)
      .order("created_at", { ascending: false })
    setOrders((orderRows as OrderRow[]) || [])

    const { data: creditRow } = await supabase
      .from("credit_accounts")
      .select("*")
      .eq("customer_account_id", c.id)
      .maybeSingle()

    if (creditRow) {
      setCredit(creditRow as CreditAccount)
      setCreditLimit(String(creditRow.credit_limit))
      setCreditEnabled(!!creditRow.enabled)
      const { data: movs } = await supabase
        .from("credit_movements")
        .select("*")
        .eq("credit_account_id", creditRow.id)
        .order("created_at", { ascending: false })
        .limit(30)
      setMovements((movs as CreditMovement[]) || [])
    } else {
      setCredit(null)
      setCreditLimit("0")
      setCreditEnabled(false)
      setMovements([])
    }
  }

  const saveProfile = async () => {
    if (!selected) return
    await supabase
      .from("customer_accounts")
      .update({
        notes,
        phone,
        shipping_address: address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id)
    await loadCustomers()
    setSelected({ ...selected, notes, phone, shipping_address: address })
  }

  const saveCredit = async () => {
    if (!selected) return
    const res = await fetch("/api/admin/credit/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerAccountId: selected.id,
        creditLimit: Number(creditLimit) || 0,
        enabled: creditEnabled,
      }),
    })
    if (!res.ok) {
      alert("Error al guardar cuenta corriente")
      return
    }
    await openCustomer(selected)
  }

  const registerPayment = async () => {
    if (!selected || !credit) return
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0) return
    const res = await fetch("/api/admin/credit/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creditAccountId: credit.id,
        amount,
        notes: paymentNotes,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Error al registrar pago")
      return
    }
    setPaymentAmount("")
    setPaymentNotes("")
    await openCustomer(selected)
  }

  const paidTotal = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + Number(o.total_amount), 0)

  const createCustomer = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      alert("Nombre y email son requeridos")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/admin/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim() || null,
          shippingAddress: newAddress.trim() || null,
          notes: newNotes.trim() || null,
          enableCredit: newEnableCredit,
          creditLimit: Number(newCreditLimit) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Error al crear cliente")
        return
      }
      setIsCreateOpen(false)
      setNewName("")
      setNewEmail("")
      setNewPhone("")
      setNewAddress("")
      setNewNotes("")
      setNewEnableCredit(false)
      setNewCreditLimit("0")
      await loadCustomers()
      if (data.customer) await openCustomer(data.customer as CustomerAccount)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="CRM // CLIENTES"
        title="Clientes"
        description="Fichas, historial de pedidos y cuenta corriente."
        action={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="border border-black bg-black px-3 py-2 font-label-caps text-white hover:bg-transparent hover:text-black"
          >
            + Cliente
          </button>
        }
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-none max-w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase">Nuevo cliente</DialogTitle>
            <DialogDescription>Alta offline. No crea cuenta web automática.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="mb-1 block">Nombre *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-none" />
            </div>
            <div>
              <Label className="mb-1 block">Email *</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="rounded-none normal-case"
              />
            </div>
            <div>
              <Label className="mb-1 block">Teléfono</Label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="rounded-none" />
            </div>
            <div>
              <Label className="mb-1 block">Dirección</Label>
              <Textarea value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="rounded-none" rows={2} />
            </div>
            <div>
              <Label className="mb-1 block">Notas</Label>
              <Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="rounded-none" rows={2} />
            </div>
            <label className="flex items-center gap-2 font-technical-data">
              <input
                type="checkbox"
                checked={newEnableCredit}
                onChange={(e) => setNewEnableCredit(e.target.checked)}
              />
              Habilitar cuenta corriente
            </label>
            {newEnableCredit && (
              <div>
                <Label className="mb-1 block">Límite CC</Label>
                <Input
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(e.target.value)}
                  className="rounded-none"
                />
              </div>
            )}
            <button
              type="button"
              disabled={creating}
              onClick={createCustomer}
              className="w-full bg-black text-white px-3 py-2 font-label-caps disabled:opacity-50"
            >
              {creating ? "Guardando…" : "Crear cliente"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Buscar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadCustomers()}
          className="rounded-none w-full sm:max-w-sm font-technical-data"
        />
        <button
          type="button"
          onClick={loadCustomers}
          className="border border-black px-4 py-2 font-label-caps hover:bg-black hover:text-white w-full sm:w-auto"
        >
          Buscar
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminDataTable compact>
          <AdminTableHead>
            <AdminTh>Cliente</AdminTh>
            <AdminTh>Contacto</AdminTh>
          </AdminTableHead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="cursor-pointer hover:bg-surface-container-low"
                onClick={() => openCustomer(c)}
              >
                <AdminTd>
                  <p className="font-bold uppercase">{c.full_name || "—"}</p>
                  <p className="text-atto-secondary normal-case">{c.email}</p>
                </AdminTd>
                <AdminTd className="normal-case">{c.phone || "—"}</AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminDataTable>

        {selected ? (
          <div className="border border-outline-variant bg-white p-4 space-y-4">
            <AdminKpiStrip
              items={[
                { label: "Pedidos", value: String(orders.length) },
                { label: "Pagado hist.", value: `$ ${paidTotal.toLocaleString("es-AR")}` },
                {
                  label: "Saldo CC",
                  value: credit ? `$ ${Number(credit.balance).toLocaleString("es-AR")}` : "—",
                },
                {
                  label: "Límite",
                  value: credit ? `$ ${Number(credit.credit_limit).toLocaleString("es-AR")}` : "—",
                },
              ]}
            />

            <div className="space-y-2">
              <p className="font-display font-bold uppercase">{selected.full_name}</p>
              <p className="font-technical-data text-atto-secondary normal-case">{selected.email}</p>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="rounded-none" />
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección" className="rounded-none" />
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" className="rounded-none" />
              <button type="button" onClick={saveProfile} className="border border-black px-3 py-2 font-label-caps">
                Guardar ficha
              </button>
            </div>

            <div className="border-t border-outline-variant pt-4 space-y-2">
              <p className="font-technical-micro text-outline uppercase">Cuenta corriente</p>
              <label className="flex items-center gap-2 font-technical-data">
                <input type="checkbox" checked={creditEnabled} onChange={(e) => setCreditEnabled(e.target.checked)} />
                Habilitada
              </label>
              <Input
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="Límite"
                className="rounded-none"
              />
              <button type="button" onClick={saveCredit} className="bg-black text-white px-3 py-2 font-label-caps">
                Guardar CC
              </button>
              {credit && (
                <div className="space-y-2 pt-2">
                  <Input
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Monto cobro CC"
                    className="rounded-none"
                  />
                  <Input
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Nota / ref transfer"
                    className="rounded-none"
                  />
                  <button type="button" onClick={registerPayment} className="border border-black px-3 py-2 font-label-caps">
                    Registrar pago a cuenta
                  </button>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {movements.map((m) => (
                      <div key={m.id} className="flex justify-between font-technical-micro border-b border-outline-variant/50 py-1">
                        <span>
                          {m.type} · {new Date(m.created_at).toLocaleDateString("es-AR")}
                        </span>
                        <span>$ {Number(m.amount).toLocaleString("es-AR")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant pt-4 space-y-1">
              <p className="font-technical-micro text-outline uppercase">Pedidos</p>
              {orders.length === 0 && <p className="font-technical-data text-atto-secondary">Sin pedidos</p>}
              {orders.map((o) => (
                <div key={o.id} className="flex justify-between font-technical-data border-b border-outline-variant/40 py-1">
                  <span>
                    {new Date(o.created_at).toLocaleDateString("es-AR")} · {o.payment_status}
                  </span>
                  <span>$ {Number(o.total_amount).toLocaleString("es-AR")}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-outline-variant p-8 font-technical-data text-atto-secondary uppercase">
            Seleccioná un cliente
          </div>
        )}
      </div>
    </div>
  )
}
