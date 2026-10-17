"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import {
  AdminPageHeader,
  AdminDataTable,
  AdminTableHead,
  AdminTh,
  AdminTd,
  AdminStatusBadge,
} from "@/components/admin/ui"

type Promotion = {
  id: string
  name: string
  type: "site_wide" | "product_specific"
  discount_type: "percentage" | "fixed"
  discount_value: number
  starts_at: string
  ends_at: string | null
  is_active: boolean
  created_at: string
}

type Product = { id: string; name: string }

export function PromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promoType, setPromoType] = useState<"site_wide" | "product_specific">("site_wide")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [isActive, setIsActive] = useState(true)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  const supabase = createClient()

  const fetchPromotions = async () => {
    const { data } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })
    if (data) setPromotions(data)
  }

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name").order("name")
    if (data) setProducts(data)
  }

  useEffect(() => {
    fetchPromotions()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (editingPromo) {
      setPromoType(editingPromo.type)
      setDiscountType(editingPromo.discount_type)
      setIsActive(editingPromo.is_active)
      if (editingPromo.type === "product_specific") {
        supabase
          .from("promotion_products")
          .select("product_id")
          .eq("promotion_id", editingPromo.id)
          .then(({ data }) => {
            setSelectedProductIds(new Set((data ?? []).map((r) => r.product_id)))
          })
      } else {
        setSelectedProductIds(new Set())
      }
    } else {
      setPromoType("site_wide")
      setDiscountType("percentage")
      setIsActive(true)
      setSelectedProductIds(new Set())
    }
  }, [editingPromo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value
    const discountValue = Number((form.querySelector('[name="discount_value"]') as HTMLInputElement)?.value)
    const startsAt = (form.querySelector('[name="starts_at"]') as HTMLInputElement)?.value
    const endsAt = (form.querySelector('[name="ends_at"]') as HTMLInputElement)?.value

    if (!name || discountValue < 0) {
      setIsSubmitting(false)
      return
    }

    const startsAtISO = startsAt ? new Date(startsAt).toISOString() : new Date().toISOString()
    const endsAtISO = endsAt ? new Date(endsAt).toISOString() : null

    try {
      if (editingPromo) {
        await supabase
          .from("promotions")
          .update({
            name,
            type: promoType,
            discount_type: discountType as "percentage" | "fixed",
            discount_value: discountValue,
            starts_at: startsAtISO,
            ends_at: endsAtISO,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPromo.id)

        await supabase.from("promotion_products").delete().eq("promotion_id", editingPromo.id)
      } else {
        const { data: inserted } = await supabase
          .from("promotions")
          .insert({
            name,
            type: promoType,
            discount_type: discountType as "percentage" | "fixed",
            discount_value: discountValue,
            starts_at: startsAtISO,
            ends_at: endsAtISO,
            is_active: isActive,
          })
          .select("id")
          .single()

        if (inserted && promoType === "product_specific" && selectedProductIds.size > 0) {
          await supabase.from("promotion_products").insert(
            Array.from(selectedProductIds).map((product_id) => ({
              promotion_id: inserted.id,
              product_id,
            }))
          )
        }
      }

      if (editingPromo && promoType === "product_specific" && selectedProductIds.size > 0) {
        await supabase.from("promotion_products").insert(
          Array.from(selectedProductIds).map((product_id) => ({
            promotion_id: editingPromo.id,
            product_id,
          }))
        )
      }

      await fetchPromotions()
      setIsDialogOpen(false)
      setEditingPromo(null)
    } catch (err) {
      console.error("Error saving promotion:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción?")) return
    await supabase.from("promotions").delete().eq("id", id)
    await fetchPromotions()
  }

  const formatDiscount = (p: Promotion) => {
    if (p.discount_type === "percentage") return `${p.discount_value}%`
    return `$${Number(p.discount_value).toLocaleString("es-AR")}`
  }

  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("es-AR", { dateStyle: "short" }) : "-")

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // PROMOS"
        title="Promociones"
        description="Descuentos site-wide o por producto."
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={() => setEditingPromo(null)}
                className="border border-black bg-black px-3 py-2 font-label-caps text-white hover:bg-transparent hover:text-black"
              >
                + Promo
              </button>
            </DialogTrigger>
          <DialogContent className="rounded-none max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display uppercase">
                {editingPromo ? "Editar promoción" : "Nueva promoción"}
              </DialogTitle>
              <DialogDescription>Descuento para toda la web o productos elegidos</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input name="name" required defaultValue={editingPromo?.name} placeholder="Ej: Promo lanzamiento" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={promoType} onValueChange={(v) => setPromoType(v as "site_wide" | "product_specific")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site_wide">Toda la web</SelectItem>
                    <SelectItem value="product_specific">Productos específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Tipo de descuento</Label>
                  <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentaje</SelectItem>
                      <SelectItem value="fixed">Monto fijo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input
                    name="discount_value"
                    type="number"
                    min={0}
                    step={0.01}
                    required
                    defaultValue={editingPromo?.discount_value ?? 0}
                    placeholder={discountType === "percentage" ? "50" : "500"}
                  />
                </div>
              </div>
              <div>
                <Label>Vigencia desde</Label>
                <Input
                  name="starts_at"
                  type="datetime-local"
                  defaultValue={
                    editingPromo?.starts_at
                      ? new Date(editingPromo.starts_at).toISOString().slice(0, 16)
                      : undefined
                  }
                />
              </div>
              <div>
                <Label>Vigencia hasta (opcional)</Label>
                <Input
                  name="ends_at"
                  type="datetime-local"
                  defaultValue={
                    editingPromo?.ends_at ? new Date(editingPromo.ends_at).toISOString().slice(0, 16) : undefined
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={isActive} onCheckedChange={(c) => setIsActive(Boolean(c))} />
                <Label>Activa</Label>
              </div>
              {promoType === "product_specific" && (
                <div>
                  <Label className="mb-2 block">Productos incluidos</Label>
                  <div className="border rounded-md p-2 max-h-48 overflow-y-auto space-y-2">
                    {products.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedProductIds.has(p.id)}
                          onCheckedChange={(checked) => {
                            setSelectedProductIds((prev) => {
                              const next = new Set(prev)
                              if (checked) next.add(p.id)
                              else next.delete(p.id)
                              return next
                            })
                          }}
                        />
                        <span className="text-sm">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="border border-black px-3 py-2 font-label-caps">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-black text-white px-3 py-2 font-label-caps disabled:opacity-50">
                  {isSubmitting ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        }
      />

      <AdminDataTable>
        <AdminTableHead>
          <AdminTh>Nombre</AdminTh>
          <AdminTh>Tipo</AdminTh>
          <AdminTh>Dto.</AdminTh>
          <AdminTh>Vigencia</AdminTh>
          <AdminTh>Estado</AdminTh>
          <AdminTh></AdminTh>
        </AdminTableHead>
        <tbody>
          {promotions.map((p) => (
            <tr key={p.id} className="hover:bg-surface-container-low/80">
              <AdminTd className="font-bold uppercase">{p.name}</AdminTd>
              <AdminTd>{p.type === "site_wide" ? "Site-wide" : "Productos"}</AdminTd>
              <AdminTd>{formatDiscount(p)}</AdminTd>
              <AdminTd className="normal-case">
                {formatDate(p.starts_at)} → {formatDate(p.ends_at)}
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge status={p.is_active ? "active" : "inactive"} label={p.is_active ? "Activa" : "Off"} />
              </AdminTd>
              <AdminTd>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="font-technical-micro uppercase border-b border-black"
                    onClick={() => {
                      setEditingPromo(p)
                      setIsDialogOpen(true)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="font-technical-micro uppercase text-atto-secondary border-b border-outline"
                    onClick={() => handleDelete(p.id)}
                  >
                    Borrar
                  </button>
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminDataTable>
      {promotions.length === 0 && (
        <p className="font-technical-data text-atto-secondary uppercase">Sin promociones</p>
      )}
    </div>
  )
}
