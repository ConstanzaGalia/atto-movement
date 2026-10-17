type VariantSizeRef = { variant_id: string; stock?: number }

export function isProductSetupComplete(
  variantIds: string[],
  variantSizes: VariantSizeRef[]
): boolean {
  if (variantIds.length === 0) return false

  const sizesCountByVariant = new Map<string, number>()
  for (const size of variantSizes) {
    sizesCountByVariant.set(size.variant_id, (sizesCountByVariant.get(size.variant_id) ?? 0) + 1)
  }

  return variantIds.every((id) => (sizesCountByVariant.get(id) ?? 0) > 0)
}

export function computeStockFromSizes(variantSizes: VariantSizeRef[]): number {
  return variantSizes.reduce((sum, s) => sum + (s.stock ?? 0), 0)
}

export function getProductStockTotal(
  productStock: number,
  variantIds: string[],
  variantSizes: VariantSizeRef[]
): number {
  if (!isProductSetupComplete(variantIds, variantSizes)) {
    return 0
  }
  return computeStockFromSizes(variantSizes)
}

export function getIncompleteSetupMessage(
  variantIds: string[],
  variantSizes: VariantSizeRef[]
): string | null {
  if (variantIds.length === 0) {
    return "Agregá al menos un color con sus talles"
  }

  const sizesCountByVariant = new Map<string, number>()
  for (const size of variantSizes) {
    sizesCountByVariant.set(size.variant_id, (sizesCountByVariant.get(size.variant_id) ?? 0) + 1)
  }

  const colorsWithoutSizes = variantIds.filter((id) => (sizesCountByVariant.get(id) ?? 0) === 0).length
  if (colorsWithoutSizes > 0) {
    return `Faltan talles en ${colorsWithoutSizes} color${colorsWithoutSizes > 1 ? "es" : ""}`
  }

  return null
}
