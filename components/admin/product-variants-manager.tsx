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
import { Plus, Edit, Trash2, Palette } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getSupabaseErrorMessage } from "@/lib/supabase-errors"
import { VariantSizesManager } from "./variant-sizes-manager"
import { syncProductStock } from "@/lib/stock-sync"
import Image from "next/image"

type ProductVariant = {
  id: string
  product_id: string
  color: string
  stock: number
  image_url: string | null
}

export function ProductVariantsManager({
  productId,
  onStockChange,
}: {
  productId: string
  onStockChange?: () => void
}) {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [sizeCountByVariantId, setSizeCountByVariantId] = useState<Record<string, number>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const supabase = createClient()

  const fetchVariants = async () => {
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("color")

    if (!data) return

    setVariants(data)

    const variantIds = data.map((v) => v.id)
    if (variantIds.length === 0) {
      setSizeCountByVariantId({})
      return
    }

    const { data: sizes } = await supabase
      .from("product_variant_sizes")
      .select("variant_id")
      .in("variant_id", variantIds)

    const counts: Record<string, number> = {}
    sizes?.forEach((size) => {
      counts[size.variant_id] = (counts[size.variant_id] ?? 0) + 1
    })
    setSizeCountByVariantId(counts)

    const firstIncomplete = data.find((variant) => (counts[variant.id] ?? 0) === 0)
    if (firstIncomplete) {
      setExpandedVariantId(firstIncomplete.id)
    }
  }

  const refreshVariants = async () => {
    await fetchVariants()
    onStockChange?.()
  }

  useEffect(() => {
    if (productId) {
      syncProductStock(supabase, productId).then(() => fetchVariants())
    }
  }, [productId])

  useEffect(() => {
    if (editingVariant) {
      setImagePreview(editingVariant.image_url)
      setSelectedFile(null)
    } else {
      setImagePreview(null)
      setSelectedFile(null)
    }
  }, [editingVariant])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsSubmitting(true)
    setIsUploading(true)

    try {
      let imageUrl = editingVariant?.image_url || null

      // Upload new file if selected
      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", selectedFile)
        if (editingVariant?.image_url) {
          uploadFormData.append("oldImageUrl", editingVariant.image_url)
        }

        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "Failed to upload image")
        }

        const { url } = await uploadResponse.json()
        imageUrl = url
      }

      const formData = new FormData(form)
      const variantData = {
        product_id: productId,
        color: formData.get("color") as string,
        stock: editingVariant?.stock ?? 0,
        image_url: imageUrl,
      }

      if (editingVariant) {
        const { error } = await supabase
          .from("product_variants")
          .update(variantData)
          .eq("id", editingVariant.id)

        if (error) {
          throw new Error(
            getSupabaseErrorMessage(error, "Error al actualizar el color", {
              color: variantData.color,
            }),
          )
        }

        await fetchVariants()
      } else {
        const { data: newVariant, error } = await supabase
          .from("product_variants")
          .insert(variantData)
          .select()
          .single()

        if (error || !newVariant) {
          throw new Error(
            getSupabaseErrorMessage(error, "Error al crear el color", {
              color: variantData.color,
            }),
          )
        }

        await fetchVariants()
        setExpandedVariantId(newVariant.id)
      }
      setIsDialogOpen(false)
      setEditingVariant(null)
      setSelectedFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error saving variant:", error)
      alert(error instanceof Error ? error.message : "Error al guardar la variante")
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (variants.length <= 1) {
      alert("Cada producto debe tener al menos un color. Agregá otro color antes de eliminar este.")
      return
    }

    if (!confirm("¿Estás seguro de eliminar esta variante?")) return

    await supabase.from("product_variants").delete().eq("id", id)
    await syncProductStock(supabase, productId)
    await fetchVariants()
    onStockChange?.()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Variantes de Color
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                setEditingVariant(null)
                setSelectedFile(null)
                setImagePreview(null)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Color
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVariant ? "Editar Variante" : "Nueva Variante"}</DialogTitle>
              <DialogDescription>Agregar una variante de color para este producto</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="color" className="mb-2 block">Color *</Label>
                <Input
                  id="color"
                  name="color"
                  required
                  placeholder="Ej: Negro, Blanco, Azul..."
                  defaultValue={editingVariant?.color}
                />
              </div>
              <div>
                <Label htmlFor="image_file" className="mb-2 block">Imagen de la Variante (opcional)</Label>
                <Input
                  id="image_file"
                  name="image_file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Archivo seleccionado: {selectedFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isUploading ? "Subiendo imagen..." : isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-sm text-muted-foreground">
        Cada color debe tener al menos un talle con stock. El stock total se calcula automáticamente.
      </p>

      {variants.length === 0 ? (
        <p className="text-sm text-amber-600">Agregá al menos un color y luego sus talles.</p>
      ) : (
        <div className="grid gap-4">
          {variants.map((variant) => (
            <div key={variant.id} className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{variant.color}</p>
                  <p className="text-sm text-muted-foreground">Stock: {variant.stock} (suma de talles)</p>
                  {(sizeCountByVariantId[variant.id] ?? 0) === 0 && (
                    <p className="text-sm text-amber-600 mt-1">Falta agregar al menos un talle</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingVariant(variant)
                      setIsDialogOpen(true)
                      setSelectedFile(null)
                      setImagePreview(variant.image_url)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(variant.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedVariantId(expandedVariantId === variant.id ? null : variant.id)}
                  >
                    {expandedVariantId === variant.id ? "Ocultar Talles" : "Gestionar Talles"}
                  </Button>
                </div>
              </div>
              {(expandedVariantId === variant.id || (sizeCountByVariantId[variant.id] ?? 0) === 0) && (
                <div className="border-t pt-3">
                  <VariantSizesManager
                    variantId={variant.id}
                    productId={productId}
                    onStockChange={refreshVariants}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

