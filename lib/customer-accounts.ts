import type { SupabaseClient } from "@supabase/supabase-js"

export async function upsertCustomerAccount(
  supabase: SupabaseClient,
  params: {
    email: string
    fullName: string
    phone?: string | null
    shippingAddress?: string | null
    userId?: string | null
  }
): Promise<string | null> {
  const email = params.email.trim().toLowerCase()
  if (!email) return null

  const { data: existing } = await supabase
    .from("customer_accounts")
    .select("id, full_name, phone, shipping_address, user_id")
    .ilike("email", email)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("customer_accounts")
      .update({
        full_name: params.fullName || existing.full_name,
        phone: params.phone ?? existing.phone,
        shipping_address: params.shippingAddress ?? existing.shipping_address,
        user_id: params.userId || existing.user_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
    return existing.id as string
  }

  const { data: created, error } = await supabase
    .from("customer_accounts")
    .insert({
      email,
      full_name: params.fullName,
      phone: params.phone || null,
      shipping_address: params.shippingAddress || null,
      user_id: params.userId || null,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[customer_accounts] upsert error:", error)
    return null
  }
  return created?.id ?? null
}
