import type { SupabaseClient } from "@supabase/supabase-js"

export async function syncVariantStock(supabase: SupabaseClient, variantId: string): Promise<number> {
  const { data: sizes } = await supabase
    .from("product_variant_sizes")
    .select("stock")
    .eq("variant_id", variantId)

  const total = sizes?.reduce((sum, s) => sum + (s.stock ?? 0), 0) ?? 0

  await supabase.from("product_variants").update({ stock: total }).eq("id", variantId)

  return total
}

export async function syncProductStock(supabase: SupabaseClient, productId: string): Promise<number | null> {
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, stock")
    .eq("product_id", productId)

  if (!variants || variants.length === 0) {
    return null
  }

  const variantIds = variants.map((v) => v.id)
  const { data: variantSizes } = await supabase
    .from("product_variant_sizes")
    .select("stock")
    .in("variant_id", variantIds)

  const total = variantSizes?.reduce((sum, s) => sum + (s.stock ?? 0), 0) ?? 0

  await supabase.from("products").update({ stock: total }).eq("id", productId)

  return total
}

export async function syncVariantAndProductStock(
  supabase: SupabaseClient,
  variantId: string,
  productId: string
): Promise<void> {
  await syncVariantStock(supabase, variantId)
  await syncProductStock(supabase, productId)
}
