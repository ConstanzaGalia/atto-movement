export type ActivePromo = {
  name: string
  discount_type: "percentage" | "fixed"
  discount_value: number
}

export type ActivePromotionsResponse = {
  siteWide: ActivePromo | null
  byProduct: Record<string, ActivePromo[]>
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

/**
 * Given API response and productId + basePrice, returns the best discounted price and optional label.
 */
export function getDiscountedPrice(
  data: ActivePromotionsResponse,
  productId: string,
  basePrice: number
): { finalPrice: number; label: string | null } {
  const candidates: { price: number; name: string }[] = []
  if (data.siteWide) {
    const price = computeDiscountedPrice(
      data.siteWide.discount_type,
      data.siteWide.discount_value,
      basePrice
    )
    candidates.push({ price, name: data.siteWide.name })
  }
  const productPromos = data.byProduct[productId] ?? []
  for (const promo of productPromos) {
    const price = computeDiscountedPrice(
      promo.discount_type,
      promo.discount_value,
      basePrice
    )
    candidates.push({ price, name: promo.name })
  }
  if (candidates.length === 0) {
    return { finalPrice: basePrice, label: null }
  }
  const best = candidates.reduce((a, b) => (a.price <= b.price ? a : b))
  const label =
    best.price < basePrice
      ? best.name
      : null
  return { finalPrice: best.price, label }
}
