import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductDetailsWrapper } from "./product-details-wrapper"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Plus } from "lucide-react"
import { computeStockFromSizes, isProductSetupComplete } from "@/lib/product-setup"
import { AttoTelemetryBar } from "@/components/atto/atto-telemetry-bar"

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .single()

  if (!product) {
    notFound()
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("color")

  const variantIds = variants?.map((v) => v.id) || []
  const { data: variantSizes } =
    variantIds.length > 0
      ? await supabase
          .from("product_variant_sizes")
          .select("*")
          .in("variant_id", variantIds)
          .order("size")
      : { data: null }

  const sizes = variantSizes ?? []
  const isSetupComplete = isProductSetupComplete(variantIds, sizes)
  const hasStock = isSetupComplete && sizes.some((s) => s.stock > 0)
  const totalStock = isSetupComplete ? computeStockFromSizes(sizes) : 0

  const { data: extraImages } = await supabase
    .from("product_images")
    .select("id, image_url, display_order")
    .eq("product_id", id)
    .order("display_order", { ascending: true })

  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4)

  return (
    <div className="min-h-screen">
      <AttoTelemetryBar
        left="GEAR DISPATCH: 24H TRACKING READY"
        right={
          <>
            <span className="hidden sm:inline">ALTITUD VALIDADA: 2.100M</span>
            <span className="text-black font-bold">SPEC VIEW</span>
          </>
        }
      />

      <div className="px-atto py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 font-label-caps text-atto-secondary hover:text-black mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            VOLVER AL INDEX
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-16">
            <ProductDetailsWrapper
              product={product}
              category={product.categories || null}
              variants={variants || []}
              variantSizes={variantSizes || []}
              extraImages={extraImages || []}
              hasStock={hasStock}
              totalStock={totalStock}
            />
          </div>

          {relatedProducts && relatedProducts.length > 0 && (
            <section className="bg-surface-container-low px-4 sm:px-6 py-10 -mx-4 lg:mx-0 lg:px-8">
              <div className="flex items-end justify-between gap-4 mb-8 border-b border-surface-container-high pb-4">
                <div>
                  <p className="font-technical-micro text-atto-secondary mb-1">
                    CONFORMACIÓN // MATCH READY
                  </p>
                  <h2 className="font-headline-md uppercase text-black">
                    Diseñado para completar el kit
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/producto/${relatedProduct.id}`}
                    className="group bg-white border border-surface-container-high p-3 hover:border-black transition-colors"
                  >
                    <div className="aspect-[3/4] relative bg-surface-container-low mb-3 overflow-hidden">
                      <Image
                        src={relatedProduct.image_url || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-technical-micro text-atto-secondary mb-1">
                      REF. {relatedProduct.id.slice(0, 8).toUpperCase()}
                    </p>
                    <h3 className="font-label-caps text-black mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-technical-data font-bold">
                        $ {relatedProduct.price.toLocaleString("es-AR")} ARS
                      </span>
                      <span className="inline-flex items-center gap-1 bg-black text-white font-technical-micro px-2 py-1">
                        <Plus className="h-3 w-3" />
                        AGREGAR
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
