import type { SupabaseClient } from "@supabase/supabase-js"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/brand"

export type SiteSettingsMap = {
  shipping_base_cost: number
  free_shipping_threshold: number
  admin_notify_email: string
  transfer_instructions: string
}

const DEFAULTS: SiteSettingsMap = {
  shipping_base_cost: 5000,
  free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
  admin_notify_email: "",
  transfer_instructions:
    "Te enviamos los datos de transferencia por WhatsApp al confirmar el pedido.",
}

export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettingsMap> {
  const { data } = await supabase.from("site_settings").select("key, value")
  const map = { ...DEFAULTS }
  if (!data) return map
  for (const row of data) {
    if (row.key === "shipping_base_cost") map.shipping_base_cost = Number(row.value) || 0
    if (row.key === "free_shipping_threshold")
      map.free_shipping_threshold = Number(row.value) || FREE_SHIPPING_THRESHOLD
    if (row.key === "admin_notify_email") map.admin_notify_email = row.value || ""
    if (row.key === "transfer_instructions")
      map.transfer_instructions = row.value || DEFAULTS.transfer_instructions
  }
  return map
}

export function computeShippingCost(
  subtotal: number,
  settings: Pick<SiteSettingsMap, "shipping_base_cost" | "free_shipping_threshold">
): number {
  if (subtotal >= settings.free_shipping_threshold) return 0
  return Math.max(0, settings.shipping_base_cost)
}
