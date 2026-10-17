"use client"

import { useEffect, useState } from "react"
import { HeroSettingsManager } from "./hero-settings-manager"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AdminPageHeader } from "@/components/admin/ui"

export function SiteSettingsManager() {
  const supabase = createClient()
  const [shippingBase, setShippingBase] = useState("5000")
  const [freeThreshold, setFreeThreshold] = useState("50000")
  const [adminEmail, setAdminEmail] = useState("")
  const [transferInstructions, setTransferInstructions] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("key, value")
      for (const row of data || []) {
        if (row.key === "shipping_base_cost") setShippingBase(row.value)
        if (row.key === "free_shipping_threshold") setFreeThreshold(row.value)
        if (row.key === "admin_notify_email") setAdminEmail(row.value)
        if (row.key === "transfer_instructions") setTransferInstructions(row.value)
      }
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    const rows = [
      { key: "shipping_base_cost", value: String(Number(shippingBase) || 0) },
      { key: "free_shipping_threshold", value: String(Number(freeThreshold) || 0) },
      { key: "admin_notify_email", value: adminEmail.trim() },
      { key: "transfer_instructions", value: transferInstructions },
    ]
    for (const row of rows) {
      const { error } = await supabase.from("site_settings").upsert({
        ...row,
        updated_at: new Date().toISOString(),
      })
      if (error) {
        setMessage(error.message)
        setSaving(false)
        return
      }
    }
    setMessage("Guardado")
    setSaving(false)
  }

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="OPS // CONFIG"
          title="Configuración"
          description="Envío, alertas admin y copy de transferencia."
        />
        <div className="border border-outline-variant bg-white p-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="font-technical-micro text-outline uppercase block mb-1">Costo envío base</label>
            <Input value={shippingBase} onChange={(e) => setShippingBase(e.target.value)} className="rounded-none" />
          </div>
          <div>
            <label className="font-technical-micro text-outline uppercase block mb-1">Umbral envío gratis</label>
            <Input value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} className="rounded-none" />
          </div>
          <div className="md:col-span-2">
            <label className="font-technical-micro text-outline uppercase block mb-1">Email aviso pedidos</label>
            <Input
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="ops@atto.com"
              className="rounded-none normal-case"
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-technical-micro text-outline uppercase block mb-1">Instrucciones transferencia</label>
            <Textarea
              value={transferInstructions}
              onChange={(e) => setTransferInstructions(e.target.value)}
              className="rounded-none normal-case"
              rows={3}
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-black text-white px-4 py-2 font-label-caps disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar config"}
            </button>
            {message && <span className="font-technical-data text-atto-secondary">{message}</span>}
          </div>
        </div>
      </div>
      <HeroSettingsManager />
    </div>
  )
}
