"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Ruler } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { syncVariantAndProductStock } from "@/lib/stock-sync"

type VariantSize = {
  id: string
  variant_id: string
  size: string
  stock: number
}

export function VariantSizesManager({
  variantId,
  productId,
  onStockChange,
}: {
  variantId: string
  productId: string
  onStockChange?: () => void
}) {
  const [sizes, setSizes] = useState<VariantSize[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSize, setEditingSize] = useState<VariantSize | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  const fetchSizes = async () => {
    const { data } = await supabase
      .from("product_variant_sizes")
      .select("*")
      .eq("variant_id", variantId)
      .order("size")
    if (data) setSizes(data)
  }

  useEffect(() => {
    if (variantId) {
      fetchSizes()
    }
  }, [variantId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const sizeData = {
      variant_id: variantId,
      size: formData.get("size") as string,
      stock: Number.parseInt(formData.get("stock") as string),
    }

    try {
      if (editingSize) {
        await supabase.from("product_variant_sizes").update(sizeData).eq("id", editingSize.id)
      } else {
        await supabase.from("product_variant_sizes").insert(sizeData)
      }

      await fetchSizes()
      await syncVariantAndProductStock(supabase, variantId, productId)
      onStockChange?.()
      setIsDialogOpen(false)
      setEditingSize(null)
    } catch (error) {
      console.error("Error saving size:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (sizes.length <= 1) {
      alert("Cada color debe tener al menos un talle. Agregá otro talle antes de eliminar este.")
      return
    }

    if (!confirm("¿Estás seguro de eliminar este talle?")) return

    await supabase.from("product_variant_sizes").delete().eq("id", id)
    await fetchSizes()
    await syncVariantAndProductStock(supabase, variantId, productId)
    onStockChange?.()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Talles
        </h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditingSize(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Talle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSize ? "Editar Talle" : "Nuevo Talle"}</DialogTitle>
              <DialogDescription>Agregar un talle para esta variante de color</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="size" className="mb-2 block">Talle *</Label>
                <Input
                  id="size"
                  name="size"
                  required
                  placeholder="Ej: S, M, L, XL..."
                  defaultValue={editingSize?.size}
                />
              </div>
              <div>
                <Label htmlFor="stock" className="mb-2 block">Stock *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  required
                  min="0"
                  defaultValue={editingSize?.stock}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sizes.length === 0 ? (
        <p className="text-sm text-amber-600">Agregá al menos un talle con stock para este color.</p>
      ) : (
        <div className="grid gap-2">
          {sizes.map((size) => (
            <div key={size.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
              <div>
                <p className="font-medium">Talle {size.size}</p>
                <p className="text-sm text-muted-foreground">Stock: {size.stock}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingSize(size)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(size.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
