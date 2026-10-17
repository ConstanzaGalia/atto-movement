"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
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

type Category = {
  id: string
  name: string
  slug: string
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name")
    if (data) setCategories(data)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const categoryData = { name, slug: generateSlug(name) }

    try {
      if (editingCategory) {
        await supabase.from("categories").update(categoryData).eq("id", editingCategory.id)
      } else {
        await supabase.from("categories").insert(categoryData)
      }
      await fetchCategories()
      setIsDialogOpen(false)
      setEditingCategory(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return
    await supabase.from("categories").delete().eq("id", id)
    await fetchCategories()
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // CATEGORÍAS"
        title="Categorías"
        description="Taxonomía de la colección Atto."
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="border border-black bg-black px-3 py-2 font-label-caps text-white hover:bg-transparent hover:text-black transition-colors"
              >
                + Nueva
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-none">
              <DialogHeader>
                <DialogTitle className="font-display uppercase">
                  {editingCategory ? "Editar categoría" : "Nueva categoría"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-technical-micro text-outline uppercase block mb-1">Nombre</label>
                  <Input
                    name="name"
                    required
                    defaultValue={editingCategory?.name}
                    className="rounded-none font-technical-data uppercase"
                  />
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

      <AdminDataTable>
        <AdminTableHead>
          <AdminTh>Nombre</AdminTh>
          <AdminTh>Slug</AdminTh>
          <AdminTh></AdminTh>
        </AdminTableHead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-surface-container-low/80">
              <AdminTd className="font-bold uppercase">{category.name}</AdminTd>
              <AdminTd className="text-atto-secondary">{category.slug}</AdminTd>
              <AdminTd>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="font-technical-micro uppercase border-b border-black"
                    onClick={() => {
                      setEditingCategory(category)
                      setIsDialogOpen(true)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="font-technical-micro uppercase text-atto-secondary border-b border-outline"
                    onClick={() => handleDelete(category.id)}
                  >
                    Borrar
                  </button>
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminDataTable>
      {categories.length === 0 && (
        <p className="font-technical-data text-atto-secondary uppercase">Sin categorías</p>
      )}
    </div>
  )
}
