import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export type ActivePromo = {
  name: string
  discount_type: "percentage" | "fixed"
  discount_value: number
}

export async function GET() {
  const useServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = await createClient({
    role: useServiceRole ? "service_role" : "anon",
  })
  const now = new Date()

  const { data: allActive, error } = await supabase
    .from("promotions")
    .select("id, name, type, discount_type, discount_value, starts_at, ends_at")
    .eq("is_active", true)

  if (error) {
    console.error("[promotions/active] Supabase error:", error)
    return NextResponse.json({ siteWide: null, byProduct: {} }, { status: 500 })
  }

  const rawRows = allActive ?? []
  const nowMs = now.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  const promos = rawRows.filter((p) => {
    const start = p.starts_at ? new Date(p.starts_at).getTime() : 0
    const end = p.ends_at ? new Date(p.ends_at).getTime() : null
    // Activa si ya empezó O empieza dentro de las próximas 24 h (evita problemas de timezone al crear)
    if (nowMs < start && start - nowMs > oneDayMs) return false
    if (end !== null && nowMs > end) return false
    return true
  })

  if (!promos.length) {
    return NextResponse.json({ siteWide: null, byProduct: {} })
  }

  const siteWidePromo = promos.find((p) => p.type === "site_wide") ?? null
  const siteWide: ActivePromo | null = siteWidePromo
    ? {
        name: siteWidePromo.name,
        discount_type: siteWidePromo.discount_type as "percentage" | "fixed",
        discount_value: Number(siteWidePromo.discount_value),
      }
    : null

  const productSpecificIds = promos.filter((p) => p.type === "product_specific").map((p) => p.id)
  const byProduct: Record<string, ActivePromo[]> = {}

  if (productSpecificIds.length > 0) {
    const { data: pp } = await supabase
      .from("promotion_products")
      .select("promotion_id, product_id")
      .in("promotion_id", productSpecificIds)

    for (const row of pp ?? []) {
      const promo = promos.find((p) => p.id === row.promotion_id)
      if (promo) {
        const entry: ActivePromo = {
          name: promo.name,
          discount_type: promo.discount_type as "percentage" | "fixed",
          discount_value: Number(promo.discount_value),
        }
        if (!byProduct[row.product_id]) byProduct[row.product_id] = []
        byProduct[row.product_id].push(entry)
      }
    }
  }

  return NextResponse.json({ siteWide, byProduct })
}
