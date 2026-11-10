import type { SupabaseClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/email/client"
import { orderStatusEmail } from "@/lib/email/templates/order-status"
import { orderAccessUrl } from "@/lib/orders/access"

type ReleasedOrder = {
  id: string
  customer_name?: string | null
  customer_email?: string | null
  total_amount?: number | null
  view_token?: string | null
  user_id?: string | null
}

export async function releaseExpiredOrders(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc("release_expired_orders")
  if (error) {
    throw error
  }

  const rows = (Array.isArray(data) ? data : []) as ReleasedOrder[]

  for (const row of rows) {
    if (!row.customer_email || !row.id) continue
    const { subject, html } = orderStatusEmail({
      customerName: row.customer_name || "cliente",
      orderId: row.id,
      status: "cancelled",
      totalAmount: row.total_amount != null ? Number(row.total_amount) : null,
      ordersUrl: orderAccessUrl(row.id, row.view_token),
      message:
        "Pasó el plazo para pagar y liberamos el stock. Si todavía lo querés, podés armar el pedido de nuevo.",
    })
    await sendEmail({ to: row.customer_email, subject, html })
  }

  return rows.length
}
