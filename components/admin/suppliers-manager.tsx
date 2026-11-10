"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import {
  AdminPageHeader,
  AdminDataTable,
  AdminTableHead,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui"

type Supplier = {
  id: string
  name: string
  address: string | null
  phone: string | null
}

export function SuppliersManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const fetchSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("*").order("name")
    if (data) setSuppliers(data)
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const supplierData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || null,
      phone: (formData.get("phone") as string) || null,
    }

    try {
      if (editingSupplier) {
        await supabase.from("suppliers").update(supplierData).eq("id", editingSupplier.id)
      } else {
        await supabase.from("suppliers").insert(supplierData)
      }
      await fetchSuppliers()
      setIsDialogOpen(false)
      setEditingSupplier(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este proveedor?")) return
    await supabase.from("suppliers").delete().eq("id", id)
    await fetchSuppliers()
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // PROVEEDORES"
        title="Proveedores"
        description="Contactos de sourcing y reposición."
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                className="border border-black bg-black px-3 py-2 font-label-caps text-white hover:bg-transparent hover:text-black transition-colors"
              >
                + Nuevo
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-none max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display uppercase">
                  {editingSupplier ? "Editar proveedor" : "Nuevo proveedor"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-technical-micro text-outline uppercase block mb-1">Nombre</label>
                  <Input name="name" required defaultValue={editingSupplier?.name} className="rounded-none font-technical-data uppercase" />
                </div>
                <div>
                  <label className="font-technical-micro text-outline uppercase block mb-1">Dirección</label>
                  <Textarea name="address" rows={3} defaultValue={editingSupplier?.address || ""} className="rounded-none normal-case" />
                </div>
                <div>
                  <label className="font-technical-micro text-outline uppercase block mb-1">Teléfono</label>
                  <Input name="phone" type="tel" defaultValue={editingSupplier?.phone || ""} className="rounded-none" />
                </div>
                <div className="flex justify-end gap-2">
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

      <AdminDataTable compact>
        <AdminTableHead>
          <AdminTh>Proveedor</AdminTh>
          <AdminTh>Contacto</AdminTh>
          <AdminTh></AdminTh>
        </AdminTableHead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-surface-container-low/80">
              <AdminTd>
                <p className="font-bold uppercase">{supplier.name}</p>
                {supplier.address && <p className="text-atto-secondary normal-case mt-0.5">{supplier.address}</p>}
              </AdminTd>
              <AdminTd className="normal-case">{supplier.phone || "—"}</AdminTd>
              <AdminTd>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="font-technical-micro uppercase border-b border-black"
                    onClick={() => {
                      setEditingSupplier(supplier)
                      setIsDialogOpen(true)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="font-technical-micro uppercase text-atto-secondary border-b border-outline"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    Borrar
                  </button>
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminDataTable>
      {suppliers.length === 0 && (
        <p className="font-technical-data text-atto-secondary uppercase">Sin proveedores</p>
      )}
    </div>
  )
}
