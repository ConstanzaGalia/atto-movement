"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { ADDING_TO_KIT, ADD_TO_KIT, ADD_TO_KIT_ERROR } from "@/lib/brand"

type Variant = {
  id: string
  color: string
  stock: number
  image_url: string | null
}

type VariantSize = {
  id: string
  variant_id: string
  size: string
  stock: number
}

type Product = {
  id: string
  name: string
  price: number
  stock: number
  image_url: string | null
}

export function ProductVariantSelector({
  product,
  variants,
  variantSizes = [],
  selectedVariantId: externalSelectedVariantId,
  onVariantChange,
}: {
  product: Product
  variants: Variant[]
  variantSizes?: VariantSize[]
  selectedVariantId?: string | null
  onVariantChange?: (variantId: string | null) => void
}) {
  const variantsWithSizes = variants.filter((variant) =>
    variantSizes.some((size) => size.variant_id === variant.id)
  )

  const [internalSelectedVariantId, setInternalSelectedVariantId] = useState<string | null>(
    variantsWithSizes.length > 0 ? variantsWithSizes[0].id : null
  )
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const selectedVariantId =
    externalSelectedVariantId !== undefined
      ? externalSelectedVariantId
      : internalSelectedVariantId

  const setSelectedVariantId = (id: string | null) => {
    if (externalSelectedVariantId === undefined) {
      setInternalSelectedVariantId(id)
    }
    onVariantChange?.(id)
    setSelectedSizeId(null)
  }

  const selectedVariant = variantsWithSizes.find((v) => v.id === selectedVariantId)
  const availableSizes = selectedVariantId
    ? variantSizes.filter((size) => size.variant_id === selectedVariantId)
    : []
  const selectedSize = availableSizes.find((s) => s.id === selectedSizeId)
  const hasStock = selectedSize ? selectedSize.stock > 0 : false

  const addToCart = async () => {
    if (!selectedVariantId || !selectedSizeId) {
      alert("Por favor seleccioná un color y un talle")
      return
    }

    let sessionId = localStorage.getItem("cart_session_id")
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem("cart_session_id", sessionId)
      document.cookie = `cart_session_id=${sessionId}; path=/; max-age=2592000; SameSite=Lax`
    }

    setIsAdding(true)
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          variantId: selectedVariantId,
          variantSizeId: selectedSizeId,
          quantity: 1,
        }),
      })

      if (response.ok) {
        window.dispatchEvent(new Event("cart-updated"))
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || ADD_TO_KIT_ERROR)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  if (variantsWithSizes.length === 0) {
    return (
      <p className="font-technical-micro text-atto-secondary">
        Este producto aún no está disponible. Configurá colores y talles en el panel admin.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="font-label-caps text-black">COLOR // MATRIZ</span>
          <span className="font-technical-data text-atto-secondary uppercase">
            {selectedVariant?.color || "—"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {variantsWithSizes.map((variant) => {
            const variantHasStock = variantSizes
              .filter((size) => size.variant_id === variant.id)
              .some((size) => size.stock > 0)
            const selected = selectedVariantId === variant.id

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={!variantHasStock}
                className={`px-4 py-2 border transition-colors font-technical-data uppercase ${
                  selected
                    ? "border-black bg-black text-white ring-2 ring-black ring-offset-2"
                    : "border-surface-container-high bg-white hover:border-black"
                } ${!variantHasStock ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {variant.color}
              </button>
            )
          })}
        </div>
      </div>

      {selectedVariant && (
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="font-label-caps text-black">TALLE // FIT</span>
            {selectedSize && (
              <span className="font-technical-micro text-atto-secondary">
                EN BASE: {selectedSize.stock}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {availableSizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedSizeId(size.id)}
                disabled={size.stock === 0}
                className={`py-2.5 font-technical-data font-bold transition-colors ${
                  selectedSizeId === size.id
                    ? "bg-black text-white"
                    : "bg-surface-container-low text-black hover:bg-black hover:text-white"
                } ${size.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {size.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={addToCart}
        disabled={isAdding || !hasStock || !selectedSizeId}
        className="w-full py-3.5 bg-black text-white font-label-caps flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="h-4 w-4" />
        {isAdding ? ADDING_TO_KIT : ADD_TO_KIT}
      </button>
    </div>
  )
}
