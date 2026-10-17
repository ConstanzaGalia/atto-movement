"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePromotions } from "@/contexts/promotions-context"

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
  image_url: string | null
  stock: number
  description?: string | null
  categories?: {
    name: string
  } | null
}

type ProductCardProps = {
  product: Product
  variantSizes?: VariantSize[]
  variantIds?: string[]
}

export function ProductCard({ product, variantSizes = [], variantIds = [] }: ProductCardProps) {
  const router = useRouter()
  const promotions = usePromotions()
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const { finalPrice, label } = promotions
    ? promotions.getDiscountedPrice(product.id, product.price)
    : { finalPrice: product.price, label: null }
  const hasDiscount = finalPrice < product.price

  useEffect(() => {
    if (variantSizes.length > 0 && !selectedSizeId) {
      const firstAvailable = variantSizes.find((s) => s.stock > 0)
      if (firstAvailable) {
        setSelectedSizeId(firstAvailable.id)
      }
    }
  }, [variantSizes, selectedSizeId])

  const hasSizes = variantSizes.length > 0
  const selectedSize = variantSizes.find((s) => s.id === selectedSizeId)

  const uniqueSizes = hasSizes
    ? Array.from(
        new Map(
          variantSizes
            .sort((a, b) => a.size.localeCompare(b.size))
            .map((size) => [size.size, size])
        ).values()
      )
    : []

  const hasStock = hasSizes
    ? selectedSize
      ? selectedSize.stock > 0
      : variantSizes.some((s) => s.stock > 0)
    : product.stock > 0

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasSizes && !selectedSizeId) return

    let variantId: string | null = null
    if (hasSizes && selectedSizeId) {
      const size = variantSizes.find((s) => s.id === selectedSizeId)
      if (size) variantId = size.variant_id
    } else if (variantIds.length > 0) {
      variantId = variantIds[0]
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
          variantId: variantId,
          variantSizeId: selectedSizeId || null,
          quantity: 1,
        }),
      })

      if (response.ok) {
        window.dispatchEvent(new Event("cart-updated"))
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const shortId = product.id.slice(0, 6).toUpperCase()

  return (
    <div className="group flex flex-col bg-surface-container-lowest transition-all hover:shadow-lg border border-transparent hover:border-surface-container-high">
      <div className="p-3 bg-surface-container-low flex items-center justify-between font-technical-micro text-atto-secondary">
        <span className="font-bold text-black">#{shortId} // ATTO LABS</span>
        <span className="bg-surface-container-highest px-1.5 py-0.5 text-black font-bold">
          {product.categories?.name || "GEAR"}
        </span>
      </div>

      <Link href={`/producto/${product.id}`} className="relative w-full aspect-[3/4] bg-surface-container-low overflow-hidden">
        <Image
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-black text-white font-technical-micro px-2 py-0.5 uppercase tracking-wider">
            {label || "SALE"}
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1 justify-between bg-surface-container-lowest space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <Link href={`/producto/${product.id}`}>
              <h2 className="font-label-caps text-black font-bold tracking-wider line-clamp-2 hover:underline">
                {product.name}
              </h2>
            </Link>
            <div className="text-right shrink-0">
              {hasDiscount && (
                <span className="block font-technical-micro text-atto-secondary line-through">
                  $ {product.price.toLocaleString("es-AR")}
                </span>
              )}
              <span className="font-technical-data text-black font-bold whitespace-nowrap">
                $ {finalPrice.toLocaleString("es-AR")} ARS
              </span>
            </div>
          </div>
          {product.description && (
            <p className="font-technical-micro text-atto-secondary line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="pt-2 space-y-2">
          {hasSizes && uniqueSizes.length > 0 && (
            <div className="grid grid-cols-4 gap-1">
              {uniqueSizes.map((size) => {
                const sizesWithSameName = variantSizes.filter((s) => s.size === size.size)
                const hasStockForSize = sizesWithSameName.some((s) => s.stock > 0)
                const sizeIdToUse =
                  sizesWithSameName.find((s) => s.stock > 0)?.id || sizesWithSameName[0]?.id
                const isSelected =
                  !!selectedSizeId && sizesWithSameName.some((s) => s.id === selectedSizeId)

                return (
                  <button
                    key={size.size}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (sizeIdToUse) setSelectedSizeId(sizeIdToUse)
                    }}
                    disabled={!hasStockForSize}
                    className={`py-1 font-technical-micro text-center font-semibold transition-colors ${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-surface-container-low text-black hover:bg-black hover:text-white"
                    } ${!hasStockForSize ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {size.size}
                  </button>
                )
              })}
            </div>
          )}

          <button
            type="button"
            onClick={addToCart}
            disabled={isAdding || !hasStock || (hasSizes && !selectedSizeId)}
            className="w-full py-2.5 bg-black text-white hover:bg-surface-container-highest hover:text-black transition-colors font-label-caps flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{isAdding ? "AGREGANDO..." : "AGREGAR A BOLSA"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
