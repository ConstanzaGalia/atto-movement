import type { SupabaseClient } from "@supabase/supabase-js"

export type PromotionResult = {
  discountedPrice: number
  promotionName: string | null
}

/**
 * Returns the best applicable discounted price for a product.
 * Evaluates all active promotions (site-wide and product-specific) and returns the lowest price.
 */
export async function getApplicableDiscount(
  supabase: SupabaseClient,
  productId: string,
  basePrice: number
): Promise<PromotionResult> {
  const now = new Date().toISOString()

  const { data: promos } = await supabase
    .from("promotions")
    .select("id, name, type, discount_type, discount_value")
    .eq("is_active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gte.${now}`)

  if (!promos?.length) {
    return { discountedPrice: basePrice, promotionName: null }
  }

  const siteWide = promos.filter((p) => p.type === "site_wide")
  const productSpecificIds = promos.filter((p) => p.type === "product_specific").map((p) => p.id)

  let productPromos: typeof promos = []
  if (productSpecificIds.length > 0) {
    const { data: pp } = await supabase
      .from("promotion_products")
      .select("promotion_id")
      .eq("product_id", productId)
      .in("promotion_id", productSpecificIds)
    const applicableIds = pp?.map((p) => p.promotion_id) ?? []
    productPromos = promos.filter((p) => p.type === "product_specific" && applicableIds.includes(p.id))
  }

  const applicable = [...siteWide, ...productPromos]
  let bestPrice = basePrice
  let bestName: string | null = null

  for (const p of applicable) {
    const value = Number(p.discount_value)
    let finalPrice: number
    if (p.discount_type === "percentage") {
      finalPrice = basePrice * (1 - value / 100)
    } else {
      finalPrice = Math.max(0, basePrice - value)
    }
    finalPrice = Math.round(finalPrice * 100) / 100
    if (finalPrice < bestPrice) {
      bestPrice = finalPrice
      bestName = p.name
    }
  }

  return { discountedPrice: bestPrice, promotionName: bestName }
}

export function computeDiscountedPrice(
  discountType: "percentage" | "fixed",
  discountValue: number,
  basePrice: number
): number {
  if (discountType === "percentage") {
    return Math.round(basePrice * (1 - discountValue / 100) * 100) / 100
  }
  return Math.max(0, Math.round((basePrice - discountValue) * 100) / 100)
}
