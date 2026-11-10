"use client"

import { useState } from "react"
import { ProductVariantSelector } from "@/components/product-variant-selector"
import { ProductImageWrapper } from "./product-image-wrapper"
import { SpecCell } from "@/components/atto/spec-cell"
import { usePromotions } from "@/contexts/promotions-context"
import { FlaskConical } from "lucide-react"
import {
  STOCK_IN_BASE,
  STOCK_OUT_OF_BASE,
  TEST_ALTITUDE,
  TEST_ELEVATION_GAIN,
} from "@/lib/brand"

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
  description?: string | null
}

type Category = {
  name: string
}

type ExtraImage = {
  id: string
  image_url: string
  display_order: number
}

export function ProductDetailsWrapper({
  product,
  category,
  variants,
  variantSizes = [],
  extraImages = [],
  hasStock,
  totalStock,
}: {
  product: Product & { categories?: Category | null }
  category: Category | null
  variants: Variant[]
  variantSizes?: VariantSize[]
  extraImages?: ExtraImage[]
  hasStock: boolean
  totalStock: number
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  )
  const promotions = usePromotions()
  const { finalPrice, label } = promotions
    ? promotions.getDiscountedPrice(product.id, product.price)
    : { finalPrice: product.price, label: null }
  const hasDiscount = finalPrice < product.price
  const cuota = Math.round(finalPrice / 3)

  return (
    <>
      <div className="lg:col-span-7 flex flex-col space-y-6">
        <div className="relative">
          <ProductImageWrapper
            product={product}
            variants={variants}
            extraImages={extraImages}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
          />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
            <span className="bg-black text-white font-technical-micro px-2 py-0.5 tracking-wider">
              INDEX: 01 // FRONT / BACK ART
            </span>
            <span className="bg-white/90 backdrop-blur-md text-black font-technical-micro px-2 py-0.5">
              SERIE: [SS 24/25]
            </span>
          </div>
        </div>

        <div className="w-full bg-surface-container-lowest p-5 sm:p-6 border border-surface-container-high">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span className="font-label-caps text-black">LAB TELEMETRY // REPORT</span>
            </div>
            <span className="font-technical-micro text-atto-secondary">SISTEMA ATTO-PERF</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3">
            <SpecCell label={STOCK_IN_BASE} value={`${totalStock} U`} hint="DISPONIBLE" />
            <SpecCell
              label="COLORES"
              value={String(variants.length || 1).padStart(2, "0")}
              hint="MATRIZ"
            />
            <SpecCell label="CATEGORÍA" value={category?.name || "GEAR"} hint="LÍNEA" />
            <SpecCell
              label="ESTADO"
              value={hasStock ? "READY" : "OUT"}
              hint="RUN MATRIX"
            />
            <SpecCell label="DESNIVEL" value={TEST_ELEVATION_GAIN} hint="PRUEBA YUNGAS" />
            <SpecCell label="ALTITUD" value={TEST_ALTITUDE} hint="SAN JAVIER" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col space-y-6 lg:sticky lg:top-28 self-start">
        <div className="bg-surface-container-lowest p-6 sm:p-7 border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-technical-micro text-atto-secondary tracking-wider">
              [ SS 24/25 // SPEC PROD ]
            </span>
            <span className="bg-surface-container text-black font-technical-micro px-2 py-0.5 font-bold">
              YUNGAS TESTED
            </span>
          </div>
          <p className="font-technical-micro text-atto-secondary mb-2 uppercase">
            {category?.name || "Atto Labs"}
          </p>
          <h1 className="font-headline-lg uppercase text-black leading-tight font-extrabold mb-3">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-3 mb-2">
            {hasDiscount ? (
              <>
                <span className="font-technical-data text-atto-secondary line-through">
                  $ {product.price.toLocaleString("es-AR")}
                </span>
                <span className="font-headline-md font-bold text-black">
                  $ {finalPrice.toLocaleString("es-AR")} ARS
                </span>
                {label && (
                  <span className="font-technical-micro bg-black text-white px-2 py-0.5">
                    {label}
                  </span>
                )}
              </>
            ) : (
              <span className="font-headline-md font-bold text-black">
                $ {finalPrice.toLocaleString("es-AR")} ARS
              </span>
            )}
            <span className="font-technical-micro text-atto-secondary">IVA INCLUIDO</span>
          </div>
          <div className="bg-surface-container-low p-2.5 flex items-center gap-2 mb-4">
            <span className="font-technical-micro font-medium uppercase">
              3 CUOTAS SIN INTERÉS DE $ {cuota.toLocaleString("es-AR")} ARS
            </span>
          </div>

          {product.description && (
            <p className="text-body-md text-atto-secondary mb-4 leading-relaxed">
              {product.description}
            </p>
          )}

          <p className="font-technical-micro mb-6">
            {hasStock ? (
              <span className="text-black font-semibold">
                {totalStock} {STOCK_IN_BASE} // MATCH READY
              </span>
            ) : (
              <span className="text-red-600 font-semibold">{STOCK_OUT_OF_BASE}</span>
            )}
          </p>

          <ProductVariantSelector
            product={product}
            variants={variants}
            variantSizes={variantSizes}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
          />
        </div>
      </div>
    </>
  )
}
