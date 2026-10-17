"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import {
  AdminPageHeader,
  AdminDataTable,
  AdminTableHead,
  AdminTh,
  AdminTd,
  AdminStatusBadge,
} from "@/components/admin/ui"

type GiftCard = {
  id: string
  code: string
  initial_amount: number
  balance: number
  status: string
  expires_at: string | null
  notes: string | null
  created_at: string
}

function randomCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ATTO-${part()}-${part()}`
}

export function GiftCardsManager() {
  const supabase = createClient()
  const [cards, setCards] = useState<GiftCard[]>([])
  const [amount, setAmount] = useState("10000")
  const [code, setCode] = useState(randomCode())
  const [expires, setExpires] = useState("")
  const [notes, setNotes] = useState("")

  const load = async () => {
    const { data } = await supabase.from("gift_cards").select("*").order("created_at", { ascending: false })
    setCards((data as GiftCard[]) || [])
  }

  useEffect(() => {
    load()
  }, [])

  const issue = async () => {
    const initial = Number(amount)
    if (!initial || initial <= 0 || !code.trim()) return
    const { error } = await supabase.from("gift_cards").insert({
      code: code.trim().toUpperCase(),
      initial_amount: initial,
      balance: initial,
      status: "active",
      expires_at: expires ? new Date(expires).toISOString() : null,
      notes: notes || null,
    })
    if (error) {
      alert(error.message)
      return
    }
    setCode(randomCode())
    setNotes("")
    await load()
  }

  const setStatus = async (id: string, status: string) => {
    await supabase.from("gift_cards").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    await load()
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // GIFT CARDS"
        title="Gift cards"
        description="Emisión manual y control de saldos. Canje en checkout."
        action={
          <button type="button" onClick={() => setCode(randomCode())} className="border border-black px-3 py-2 font-label-caps">
            Nuevo código
          </button>
        }
      />

      <div className="border border-outline-variant bg-white p-4 grid md:grid-cols-4 gap-3">
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código" className="rounded-none font-technical-data uppercase" />
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto" className="rounded-none" />
        <Input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="rounded-none" />
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" className="rounded-none" />
        <button type="button" onClick={issue} className="md:col-span-4 bg-black text-white px-4 py-3 font-label-caps">
          Emitir gift card
        </button>
      </div>

      <AdminDataTable>
        <AdminTableHead>
          <AdminTh>Código</AdminTh>
          <AdminTh>Saldo</AdminTh>
          <AdminTh>Estado</AdminTh>
          <AdminTh>Vence</AdminTh>
          <AdminTh></AdminTh>
        </AdminTableHead>
        <tbody>
          {cards.map((c) => (
            <tr key={c.id}>
              <AdminTd className="font-bold">{c.code}</AdminTd>
              <AdminTd>
                $ {Number(c.balance).toLocaleString("es-AR")} / {Number(c.initial_amount).toLocaleString("es-AR")}
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge status={c.status} />
              </AdminTd>
              <AdminTd>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("es-AR") : "—"}</AdminTd>
              <AdminTd>
                {c.status === "active" ? (
                  <button type="button" onClick={() => setStatus(c.id, "inactive")} className="font-technical-micro uppercase border-b border-black">
                    Anular
                  </button>
                ) : c.status === "inactive" ? (
                  <button type="button" onClick={() => setStatus(c.id, "active")} className="font-technical-micro uppercase border-b border-black">
                    Reactivar
                  </button>
                ) : null}
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminDataTable>
    </div>
  )
}
