"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Palette, Search, Star, ChevronUp, ChevronDown, ImagePlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { ProductVariantsManager } from "./product-variants-manager"
import { getIncompleteSetupMessage, isProductSetupComplete } from "@/lib/product-setup"
import { getSupabaseErrorMessage } from "@/lib/supabase-errors"
import { AdminPageHeader } from "@/components/admin/ui"

type Product = {
  id: string
  name: string
  sku: string | null
  description: string | null
  price: number
  stock: number
  category_id: string | null
  supplier_id: string | null
  image_url: string | null
  featured: boolean
  categories?: { name: string }
  suppliers?: { name: string }
}

type Category = {
  id: string
  name: string
}

type Supplier = {
  id: string
  name: string
}

type ProductImage = {
  id: string
  product_id: string
  image_url: string
  display_order: number
}

type StockFilter = "all" | "low" | "out" | "incomplete"
type FeaturedFilter = "all" | "featured" | "not_featured"
type SortBy = "name_asc" | "price_desc" | "stock_asc"

const PAGE_SIZE = 20
const LOW_STOCK_THRESHOLD = 10

export function ProductsManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVariantsDialogOpen, setIsVariantsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all")
  const [filterSupplierId, setFilterSupplierId] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortBy>("name_asc")
  const [page, setPage] = useState(1)
  const [isFeatured, setIsFeatured] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [extraImages, setExtraImages] = useState<ProductImage[]>([])
  const [isAddingExtraImages, setIsAddingExtraImages] = useState(false)
  const [totalStockByProductId, setTotalStockByProductId] = useState<Record<string, number>>({})
  const [stockByColorByProductId, setStockByColorByProductId] = useState<
    Record<string, { color: string; stock: number }[]>
  >({})
  const [incompleteSetupByProductId, setIncompleteSetupByProductId] = useState<Record<string, string>>({})

  const supabase = createClient()

  const filteredSortedProducts = useMemo(() => {
    let list = [...products]

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q)
      )
    }

    if (filterCategoryId !== "all") {
      list = list.filter((p) => p.category_id === filterCategoryId)
    }

    if (filterSupplierId !== "all") {
      list = list.filter((p) => p.supplier_id === filterSupplierId)
    }

    if (featuredFilter === "featured") {
      list = list.filter((p) => p.featured)
    } else if (featuredFilter === "not_featured") {
      list = list.filter((p) => !p.featured)
    }

    if (stockFilter === "incomplete") {
      list = list.filter((p) => Boolean(incompleteSetupByProductId[p.id]))
    } else if (stockFilter === "out") {
      list = list.filter(
        (p) => !incompleteSetupByProductId[p.id] && (totalStockByProductId[p.id] ?? 0) === 0
      )
    } else if (stockFilter === "low") {
      list = list.filter((p) => {
        if (incompleteSetupByProductId[p.id]) return false
        const stock = totalStockByProductId[p.id] ?? 0
        return stock > 0 && stock < LOW_STOCK_THRESHOLD
      })
    }

    list.sort((a, b) => {
      if (sortBy === "price_desc") return Number(b.price) - Number(a.price)
      if (sortBy === "stock_asc") {
        return (totalStockByProductId[a.id] ?? 0) - (totalStockByProductId[b.id] ?? 0)
      }
      return a.name.localeCompare(b.name, "es")
    })

    return list
  }, [
    products,
    searchQuery,
    filterCategoryId,
    filterSupplierId,
    featuredFilter,
    stockFilter,
    sortBy,
    totalStockByProductId,
    incompleteSetupByProductId,
  ])

  const totalFiltered = filteredSortedProducts.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredSortedProducts.slice(start, start + PAGE_SIZE)
  }, [filteredSortedProducts, currentPage])

  const rangeStart = totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalFiltered)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, filterCategoryId, filterSupplierId, featuredFilter, stockFilter, sortBy])

  const fetchProducts = async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
    if (showLoading || products.length === 0) {
      setIsLoading(true)
    }
    const { data } = await supabase
      .from("products")
      .select("*, categories(name), suppliers(name)")
      .order("name", { ascending: true })
    if (data) {
      setProducts(data)
      const productIds = data.map((p) => p.id)
      if (productIds.length === 0) {
        setTotalStockByProductId({})
        setStockByColorByProductId({})
        setIncompleteSetupByProductId({})
        setIsLoading(false)
        return
      }
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id, product_id, stock, color")
        .in("product_id", productIds)
      const variantIds = variants?.map((v) => v.id) ?? []
      const { data: variantSizes } =
        variantIds.length > 0
          ? await supabase
              .from("product_variant_sizes")
              .select("variant_id, stock")
              .in("variant_id", variantIds)
          : { data: null }
      const variantToProduct: Record<string, string> = {}
      const variantsByProduct: Record<string, string[]> = {}
      const colorStockByProduct: Record<string, { color: string; stock: number }[]> = {}
      variants?.forEach((v) => {
        variantToProduct[v.id] = v.product_id
        if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = []
        variantsByProduct[v.product_id].push(v.id)
        if (!colorStockByProduct[v.product_id]) colorStockByProduct[v.product_id] = []
        colorStockByProduct[v.product_id].push({
          color: v.color || "—",
          stock: Number(v.stock) || 0,
        })
      })

      const sizesByProduct: Record<string, { variant_id: string; stock?: number }[]> = {}
      if (variantSizes && variantSizes.length > 0) {
        variantSizes.forEach((s) => {
          const pid = variantToProduct[s.variant_id]
          if (pid) {
            if (!sizesByProduct[pid]) sizesByProduct[pid] = []
            sizesByProduct[pid].push(s)
          }
        })
      }

      const totalByProduct: Record<string, number> = {}
      const incompleteByProduct: Record<string, string> = {}
      const sortedColorStock: Record<string, { color: string; stock: number }[]> = {}
      data.forEach((p) => {
        const variantIdsForProduct = variantsByProduct[p.id] ?? []
        const sizes = sizesByProduct[p.id] ?? []
        const incompleteMessage = getIncompleteSetupMessage(variantIdsForProduct, sizes)
        if (incompleteMessage) {
          incompleteByProduct[p.id] = incompleteMessage
          totalByProduct[p.id] = 0
          sortedColorStock[p.id] = []
        } else if (isProductSetupComplete(variantIdsForProduct, sizes)) {
          totalByProduct[p.id] = sizes.reduce((sum, s) => sum + (s.stock ?? 0), 0)
          sortedColorStock[p.id] = (colorStockByProduct[p.id] || []).sort((a, b) =>
            a.color.localeCompare(b.color, "es")
          )
        } else {
          totalByProduct[p.id] = 0
          sortedColorStock[p.id] = []
        }
      })
      setIncompleteSetupByProductId(incompleteByProduct)
      setTotalStockByProductId(totalByProduct)
      setStockByColorByProductId(sortedColorStock)
    }
    setIsLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name")
    if (data) setCategories(data)
  }

  const fetchSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("*").order("name")
    if (data) setSuppliers(data)
  }

  useEffect(() => {
    fetchProducts({ showLoading: true })
    fetchCategories()
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (editingProduct) {
      setSelectedCategoryId(editingProduct.category_id || "")
      setSelectedSupplierId(editingProduct.supplier_id || "")
      setIsFeatured(editingProduct.featured || false)
      setImagePreview(editingProduct.image_url)
      setSelectedFile(null)
      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", editingProduct.id)
        .order("display_order", { ascending: true })
        .then(({ data }) => setExtraImages(data ?? []))
    } else {
      setSelectedCategoryId("")
      setSelectedSupplierId("")
      setIsFeatured(false)
      setImagePreview(null)
      setSelectedFile(null)
      setExtraImages([])
    }
  }, [editingProduct])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddExtraImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length || !editingProduct) return
    setIsAddingExtraImages(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i])
      }
      const res = await fetch("/api/upload/image", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al subir")
      }
      const json = await res.json()
      const urls = json.urls ?? (json.url ? [json.url] : [])
      const maxOrder = extraImages.length > 0 ? Math.max(...extraImages.map((i) => i.display_order)) : -1
      for (let i = 0; i < urls.length; i++) {
        await supabase.from("product_images").insert({
          product_id: editingProduct.id,
          image_url: urls[i],
          display_order: maxOrder + 1 + i,
        })
      }
      const { data: updated } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", editingProduct.id)
        .order("display_order", { ascending: true })
      if (updated) setExtraImages(updated)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Error al agregar imágenes")
    } finally {
      setIsAddingExtraImages(false)
      e.target.value = ""
    }
  }

  const handleRemoveExtraImage = async (id: string) => {
    await supabase.from("product_images").delete().eq("id", id)
    setExtraImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleMoveExtraImage = async (index: number, direction: "up" | "down") => {
    const list = [...extraImages]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= list.length) return
    const a = list[index]
    const b = list[target]
    await supabase.from("product_images").update({ display_order: b.display_order }).eq("id", a.id)
    await supabase.from("product_images").update({ display_order: a.display_order }).eq("id", b.id)
    if (editingProduct) {
      const { data } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", editingProduct.id)
        .order("display_order", { ascending: true })
      if (data) setExtraImages(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsSubmitting(true)
    setIsUploading(true)

    try {
      let imageUrl = editingProduct?.image_url || null

      // Upload new file if selected
      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", selectedFile)
        if (editingProduct?.image_url) {
          uploadFormData.append("oldImageUrl", editingProduct.image_url)
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
      const skuRaw = String(formData.get("sku") || "").trim()
      const productData: Record<string, unknown> = {
        name: formData.get("name") as string,
        sku: skuRaw ? skuRaw.toUpperCase() : null,
        description: formData.get("description") as string,
        price: Number.parseFloat(formData.get("price") as string),
        category_id: selectedCategoryId || null,
        supplier_id: selectedSupplierId || null,
        image_url: imageUrl,
        featured: isFeatured,
      }

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)

        if (error) {
          throw new Error(getSupabaseErrorMessage(error, "Error al actualizar el producto"))
        }

        await fetchProducts()
        setIsDialogOpen(false)
        setEditingProduct(null)
        setSelectedCategoryId("")
        setSelectedSupplierId("")
        setIsFeatured(false)
        setSelectedFile(null)
        setImagePreview(null)
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert({ ...productData, stock: 0 })
          .select()
          .single()

        if (error || !newProduct) {
          throw new Error(getSupabaseErrorMessage(error, "Error al crear el producto"))
        }

        await fetchProducts()
        setIsDialogOpen(false)
        setEditingProduct(null)
        setSelectedCategoryId("")
        setSelectedSupplierId("")
        setIsFeatured(false)
        setSelectedFile(null)
        setImagePreview(null)
        setSelectedProductForVariants(newProduct.id)
        setIsVariantsDialogOpen(true)
      }
    } catch (error) {
      console.error("Error saving product:", error)
      alert(error instanceof Error ? error.message : "Error al guardar el producto")
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    await supabase.from("products").delete().eq("id", id)
    await fetchProducts()
  }

  const toggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ featured: !currentFeatured })
        .eq("id", productId)

      if (error) throw error

      // Update local state immediately for instant feedback
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, featured: !currentFeatured } : p))
      )
    } catch (error) {
      console.error("Error toggling featured:", error)
      alert("Error al actualizar el estado destacado")
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="OPS // COLECCIÓN"
        title="Colección"
        description="Productos, stock por color/talle y destacados."
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null)
                  setSelectedCategoryId("")
                  setSelectedSupplierId("")
                  setIsFeatured(false)
                  setSelectedFile(null)
                  setImagePreview(null)
                }}
                className="border border-black bg-black px-3 py-2 font-label-caps text-white hover:bg-transparent hover:text-black"
              >
                + Producto
              </button>
            </DialogTrigger>
          <DialogContent className="rounded-none max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display uppercase">
                {editingProduct ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
              <DialogDescription>Complete los datos del producto</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2 block">Nombre *</Label>
                <Input id="name" name="name" required defaultValue={editingProduct?.name} />
              </div>
              <div>
                <Label htmlFor="sku" className="mb-2 block">SKU (solo admin)</Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="Ej. 4051S26"
                  defaultValue={editingProduct?.sku || ""}
                  className="uppercase"
                />
              </div>
              <div>
                <Label htmlFor="description" className="mb-2 block">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingProduct?.description || ""}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="price" className="mb-2 block">Precio *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.price}
                  />
                </div>
                {editingProduct && (
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                    <p>
                      Stock total: {totalStockByProductId[editingProduct.id] ?? 0}{" "}
                      (calculado desde colores y talles)
                    </p>
                    {incompleteSetupByProductId[editingProduct.id] && (
                      <p className="text-amber-600 mt-1">{incompleteSetupByProductId[editingProduct.id]}</p>
                    )}
                  </div>
                )}
                {!editingProduct && (
                  <p className="text-sm text-muted-foreground">
                    Después de crear el producto, vas a configurar colores y talles con stock.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="category_id" className="mb-2 block">Categoría</Label>
                  <Select value={selectedCategoryId || undefined} onValueChange={(value) => setSelectedCategoryId(value || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                  <Label htmlFor="supplier_id" className="mb-2 block">Proveedor</Label>
                  <Select value={selectedSupplierId || undefined} onValueChange={(value) => setSelectedSupplierId(value || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="image_file" className="mb-2 block">Imagen del Producto</Label>
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

              {editingProduct && (
                <div>
                  <Label className="mb-2 block">Imágenes adicionales (galería en ficha de producto)</Label>
                  {extraImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {extraImages.map((img, index) => (
                        <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                          <Image src={img.image_url} alt="" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-0.5 transition-opacity">
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleMoveExtraImage(index, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleMoveExtraImage(index, "down")}
                              disabled={index === extraImages.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRemoveExtraImage(img.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="extra_images"
                      onChange={handleAddExtraImages}
                      disabled={isAddingExtraImages}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("extra_images")?.click()}
                      disabled={isAddingExtraImages}
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      {isAddingExtraImages ? "Subiendo..." : "Agregar imágenes"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked === true)}
                />
                <Label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Producto destacado (aparecerá en la página principal)
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-none">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading} className="rounded-none bg-black">
                  {isUploading ? "Subiendo imagen..." : isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        }
      />

      {!isLoading && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-atto-secondary" />
            <Input
              placeholder="Buscar por nombre o SKU…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-none font-technical-data"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
              <SelectTrigger className="rounded-none w-full font-technical-data">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
              <SelectTrigger className="rounded-none w-full font-technical-data">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo stock</SelectItem>
                <SelectItem value="low">Stock bajo (&lt;{LOW_STOCK_THRESHOLD})</SelectItem>
                <SelectItem value="out">Sin stock</SelectItem>
                <SelectItem value="incomplete">Setup incompleto</SelectItem>
              </SelectContent>
            </Select>

            <Select value={featuredFilter} onValueChange={(v) => setFeaturedFilter(v as FeaturedFilter)}>
              <SelectTrigger className="rounded-none w-full font-technical-data">
                <SelectValue placeholder="Destacados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="featured">Solo destacados</SelectItem>
                <SelectItem value="not_featured">No destacados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSupplierId} onValueChange={setFilterSupplierId}>
              <SelectTrigger className="rounded-none w-full font-technical-data">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos proveedores</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="rounded-none w-full font-technical-data">
                <SelectValue placeholder="Orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Nombre A–Z</SelectItem>
                <SelectItem value="price_desc">Precio desc</SelectItem>
                <SelectItem value="stock_asc">Stock asc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="font-technical-micro text-atto-secondary uppercase tracking-wider">
            Mostrando {rangeStart}–{rangeEnd} de {totalFiltered}
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="font-technical-data text-atto-secondary uppercase">Cargando colección…</p>
      ) : totalFiltered === 0 ? (
        <p className="font-technical-data text-atto-secondary uppercase border border-outline-variant bg-white p-8 text-center">
          Sin productos
        </p>
      ) : (
        <>
          <div className="border border-outline-variant divide-y divide-outline-variant bg-white">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 p-4 hover:bg-surface-container-low/60 sm:flex-row sm:gap-4">
                <div className="flex gap-3 min-w-0 flex-1">
                <div className="w-16 h-20 relative bg-surface-container-low overflow-hidden flex-shrink-0 border border-outline-variant">
                  <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold uppercase tracking-tight">{product.name}</h3>
                  <p className="font-technical-micro text-black mt-1 tracking-wider">
                    {product.sku ? `SKU · ${product.sku}` : "SIN SKU"}
                  </p>
                  <p className="font-technical-micro text-atto-secondary uppercase mt-0.5">
                    {product.categories?.name || "Sin cat."}
                    {product.suppliers?.name ? ` // ${product.suppliers.name}` : ""}
                  </p>
                  <p className="font-technical-data mt-1">
                    $ {product.price.toLocaleString("es-AR")} · Total {totalStockByProductId[product.id] ?? 0}
                    {product.featured ? " · Destacado" : ""}
                  </p>
                  {(stockByColorByProductId[product.id] || []).length > 0 && (
                    <p className="font-technical-micro text-atto-secondary mt-1 uppercase tracking-wide break-words">
                      {(stockByColorByProductId[product.id] || [])
                        .map((c) => `${c.color} ${c.stock}`)
                        .join(" · ")}
                    </p>
                  )}
                  {incompleteSetupByProductId[product.id] && (
                    <p className="font-technical-micro text-atto-secondary mt-1">{incompleteSetupByProductId[product.id]}</p>
                  )}
                </div>
                </div>
                <div className="flex flex-row flex-wrap gap-3 items-center sm:flex-col sm:items-end lg:flex-row lg:items-center">
                  <button
                    type="button"
                    onClick={() => toggleFeatured(product.id, product.featured)}
                    className={`p-2 border ${product.featured ? "border-black bg-black text-white" : "border-outline-variant"}`}
                    title={product.featured ? "Quitar destacado" : "Destacar"}
                  >
                    <Star className={`h-4 w-4 ${product.featured ? "fill-current" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductForVariants(product.id)
                      setIsVariantsDialogOpen(true)
                    }}
                    className="font-technical-micro uppercase border-b border-black"
                  >
                    Colores
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(product)
                      setIsDialogOpen(true)
                    }}
                    className="font-technical-micro uppercase border-b border-black"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="font-technical-micro uppercase text-atto-secondary border-b border-outline"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border border-black px-3 py-2 font-label-caps disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
              >
                Anterior
              </button>
              <span className="font-technical-micro text-atto-secondary uppercase tracking-wider">
                Página {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="border border-black px-3 py-2 font-label-caps disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Variants Dialog */}
      <Dialog open={isVariantsDialogOpen} onOpenChange={(open) => {
        setIsVariantsDialogOpen(open)
        if (!open) setSelectedProductForVariants(null)
      }}>
        <DialogContent className="rounded-none max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Colores y Talles</DialogTitle>
            <DialogDescription>
              Cada producto debe tener al menos un color y cada color al menos un talle con stock.
            </DialogDescription>
          </DialogHeader>
          {isVariantsDialogOpen && selectedProductForVariants && (
            <ProductVariantsManager
              productId={selectedProductForVariants}
              onStockChange={() => fetchProducts()}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
