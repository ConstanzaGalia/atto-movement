"use client"

import { ProductImageCarousel } from "@/components/product-image-carousel"

type Variant = {
  id: string
  color: string
  stock: number
  image_url: string | null
}

type Product = {
  id: string
  name: string
  image_url: string | null
}

type ExtraImage = {
  id: string
  image_url: string
  display_order: number
}

export function ProductImageWrapper({
  product,
  variants,
  extraImages = [],
  selectedVariantId,
  onVariantChange,
}: {
  product: Product
  variants: Variant[]
  extraImages?: ExtraImage[]
  selectedVariantId: string | null
  onVariantChange: (variantId: string | null) => void
}) {
  return (
    <ProductImageCarousel
      product={product}
      variants={variants}
      extraImages={extraImages}
      selectedVariantId={selectedVariantId}
      onVariantChange={onVariantChange}
    />
  )
}

