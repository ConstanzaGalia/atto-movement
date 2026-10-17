import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowRight, CreditCard, MessageCircle, Truck } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { HeroSection } from "@/components/hero-section"
import { computeStockFromSizes, isProductSetupComplete } from "@/lib/product-setup"
import { SITE_TAGLINE, WHATSAPP_URL } from "@/lib/brand"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("featured", true)
    .order("name", { ascending: true })
    .limit(8)

  const { data: categories } = await supabase.from("categories").select("*").order("name")

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

  return (
    <div className="min-h-screen">
      <HeroSection />

      <section className="px-atto py-12 lg:py-16 border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-2">
            <p className="font-technical-micro text-atto-secondary mb-4">CATEGORÍAS DE LÍNEA</p>
            {(categories && categories.length > 0
              ? categories
              : [{ id: "all", name: "Colección completa", slug: "" }]
            ).map((cat, i) => (
              <Link
                key={cat.id}
                href={cat.slug ? `/tienda?categoria=${cat.slug}` : "/tienda"}
                className="group flex items-center justify-between border-b border-surface-container-high py-4 hover:border-black transition-colors"
              >
                <span className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight">
                  {cat.name} /
                </span>
                <span className="w-9 h-9 border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
          <div className="lg:col-span-7 bg-surface-container-low p-8 lg:p-12 flex flex-col justify-end min-h-[280px]">
            <p className="font-technical-micro text-atto-secondary mb-3">MANIFESTO // FIELD NOTE</p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-tight">
              Nunca fue solo un run, es todo nuestro mundo.
            </h2>
          </div>
        </div>
      </section>

      <section id="lookbook" className="px-atto py-12 lg:py-16 scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-black pb-6">
            <div>
              <p className="font-technical-data text-atto-secondary uppercase mb-2">
                BESTSELLERS // SERIE PRIMAVERA-VERANO
              </p>
              <h2 className="font-headline-lg uppercase text-black">Productos Destacados</h2>
            </div>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 font-label-caps border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
            >
              VER TODOS
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

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
              <p className="font-technical-data text-atto-secondary mb-6 uppercase">
                No hay productos destacados en este momento.
              </p>
              <Link
                href="/tienda"
                className="inline-flex bg-black text-white font-label-caps px-6 py-3 hover:bg-neutral-800"
              >
                VER COLECCIÓN
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="px-atto py-16 lg:py-24 bg-white border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tighter leading-[1.05] text-black">
              Nacidos en Tucumán para conquistar cada sendero, cumbre y calle.
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <p className="font-technical-micro text-atto-secondary">ORIGEN // ATTO LABS</p>
            <p className="text-body-lg text-atto-secondary leading-relaxed">
              {SITE_TAGLINE} Desarrollamos indumentaria técnica testeada en las Yungas tucumanas:
              humedad crítica, desnivel positivo y ritmo que no se negocia.
            </p>
            <Link
              href="/sobre-mi"
              className="inline-flex items-center gap-2 font-label-caps border-b border-black pb-0.5"
            >
              CONOCER MÁS
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-atto py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Truck, title: "ENVÍOS A TODO EL PAÍS", desc: "Despacho express 24–48h" },
              { icon: CreditCard, title: "PAGO POR TRANSFERENCIA", desc: "Coordinamos por WhatsApp" },
              { icon: MessageCircle, title: "CANAL WHATSAPP DIRECTO", desc: "Coordinación real" },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="border border-surface-container-high bg-surface-container-lowest p-6 flex gap-4"
              >
                <Icon className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-label-caps text-black mb-1">{title}</p>
                  <p className="font-technical-micro text-atto-secondary">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-black text-white font-label-caps px-8 py-4 hover:bg-neutral-800 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              COMUNICATE POR WHATSAPP
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
