import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { computeStockFromSizes, isProductSetupComplete } from "@/lib/product-setup"

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const supabase = await createClient()
  const { categoria } = await searchParams

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  let query = supabase.from("products").select("*, categories(name, slug)").order("name", {
    ascending: true,
  })

  if (categoria) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categoria)
      .single()

    if (categoryData) {
      query = query.eq("category_id", categoryData.id)
    }
  }

  const { data: products } = await query

  const productIds = products?.map((p) => p.id) || []
  let variantSizesMap: Record<string, any[]> = {}
  let variantMap: Record<string, any[]> = {}
  let variants: { id: string; product_id: string; stock?: number }[] | null = null

  if (productIds.length > 0) {
    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("id, product_id, stock")
      .in("product_id", productIds)
    variants = variantsData ?? null

    if (variants && variants.length > 0) {
      variants.forEach((variant) => {
        if (!variantMap[variant.product_id]) {
          variantMap[variant.product_id] = []
        }
        variantMap[variant.product_id].push(variant.id)
      })

      const variantIds = variants.map((v) => v.id)
      const { data: variantSizes } = await supabase
        .from("product_variant_sizes")
        .select("*")
        .in("variant_id", variantIds)
        .order("size")

      if (variantSizes) {
        variantSizes.forEach((size) => {
          const variant = variants!.find((v) => v.id === size.variant_id)
          if (variant) {
            if (!variantSizesMap[variant.product_id]) {
              variantSizesMap[variant.product_id] = []
            }
            variantSizesMap[variant.product_id].push(size)
          }
        })
      }
    }
  }

  const productsWithStock =
    products?.filter((product) => {
      const variantIdsForProduct = variantMap[product.id] || []
      const sizesForProduct = variantSizesMap[product.id] || []
      if (!isProductSetupComplete(variantIdsForProduct, sizesForProduct)) {
        return false
      }
      return computeStockFromSizes(sizesForProduct) > 0
    }) ?? []

  const activeCategory = categories?.find((c) => c.slug === categoria)
  const catIndex = activeCategory
    ? String((categories?.findIndex((c) => c.id === activeCategory.id) ?? 0) + 1).padStart(2, "0")
    : "00"
  const title = activeCategory
    ? `CAT.${catIndex} // ${activeCategory.name.toUpperCase()}`
    : "CAT.00 // COLECCIÓN COMPLETA"

  return (
    <div className="min-h-screen">
      <section className="px-atto py-8 lg:py-12 border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="max-w-2xl">
            <p className="font-technical-micro text-atto-secondary mb-2">INDEX // ATTO LABS</p>
            <h1 className="font-headline-lg uppercase text-black mb-4">{title}</h1>
            <p className="text-body-md text-atto-secondary leading-relaxed">
              Indumentaria técnica desarrollada para carrera en condiciones reales. Probada en
              humedad, rocío térmico y desnivel positivo de las Yungas tucumanas.
            </p>
          </div>
          <div className="bg-surface-container-low p-4 space-y-2 lg:w-72 shrink-0">
            <div className="flex items-center justify-between text-atto-secondary">
              <span className="font-technical-micro">ZONA PRUEBA</span>
              <span className="font-technical-data text-black font-bold">SAN JAVIER / YUNGAS</span>
            </div>
            <div className="flex items-center justify-between text-atto-secondary">
              <span className="font-technical-micro">TEMP / HUMEDAD</span>
              <span className="font-technical-data text-black font-bold">29°C // 86% RH</span>
            </div>
            <div className="flex items-center justify-between text-atto-secondary">
              <span className="font-technical-micro">ÍTEMS EN INDEX</span>
              <span className="font-technical-data text-black font-bold">
                {String(productsWithStock.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 pt-6">
          <Link
            href="/tienda"
            className={`px-4 py-2 font-label-caps transition-colors ${
              !categoria
                ? "bg-black text-white"
                : "bg-surface-container-low hover:bg-surface-container-high text-black"
            }`}
          >
            TODOS
          </Link>
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/tienda?categoria=${cat.slug}`}
              className={`px-4 py-2 font-label-caps transition-colors ${
                categoria === cat.slug
                  ? "bg-black text-white"
                  : "bg-surface-container-low hover:bg-surface-container-high text-black"
              }`}
            >
              {cat.name.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>

      <section className="w-full bg-surface-container-low px-atto py-4 sticky top-[var(--atto-header-offset)] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <span className="font-technical-micro text-atto-secondary">
            FILTRO // CATEGORÍA ACTIVA
          </span>
          <span className="font-technical-micro text-atto-secondary hidden md:inline">
            INDEX 01–{String(productsWithStock.length).padStart(2, "0")} /{" "}
            {String(productsWithStock.length).padStart(2, "0")}
          </span>
        </div>
      </section>

      <section className="px-atto py-10">
        <div className="max-w-7xl mx-auto">
          {productsWithStock.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsWithStock.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variantSizes={variantSizesMap[product.id] || []}
                  variantIds={variantMap[product.id] || []}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-surface-container-high bg-surface-container-lowest">
              <p className="font-technical-data text-atto-secondary uppercase">
                No hay productos disponibles en esta categoría
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
