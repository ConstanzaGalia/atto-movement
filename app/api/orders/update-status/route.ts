import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { syncVariantAndProductStock } from "@/lib/stock-sync"
import { getSiteUrl, sendEmail } from "@/lib/email/client"
import { orderStatusEmail } from "@/lib/email/templates/order-status"

const NOTIFY_STATUSES = new Set(["preparing", "delivered", "cancelled"])

export async function POST(request: Request) {
  const { orderId, newStatus, oldStatus } = await request.json()

  if (!orderId || !newStatus) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, total_amount, user_id, status")
    .eq("id", orderId)
    .single()

  // Update order status
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (
    existingOrder?.customer_email &&
    newStatus !== oldStatus &&
    NOTIFY_STATUSES.has(newStatus)
  ) {
    const ordersUrl = existingOrder.user_id
      ? `${getSiteUrl()}/mi-cuenta/pedidos/${orderId}`
      : `${getSiteUrl()}/mi-cuenta/pedidos`
    const { subject, html } = orderStatusEmail({
      customerName: existingOrder.customer_name || "cliente",
      orderId,
      status: newStatus,
      totalAmount: existingOrder.total_amount,
      ordersUrl,
    })
    await sendEmail({ to: existingOrder.customer_email, subject, html })
  }

  // If order is being cancelled (and wasn't cancelled before), restore stock
  if (newStatus === "cancelled" && oldStatus !== "cancelled") {
    // Get all order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, variant_id, variant_size_id, quantity")
      .eq("order_id", orderId)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Restore stock for each item (priority: variant_size > variant > product)
    for (const item of orderItems || []) {
      if (item.variant_size_id) {
        const { data: variantSize } = await supabase
          .from("product_variant_sizes")
          .select("stock, variant_id")
          .eq("id", item.variant_size_id)
          .single()

        if (variantSize) {
          await supabase
            .from("product_variant_sizes")
            .update({ stock: variantSize.stock + item.quantity })
            .eq("id", item.variant_size_id)

          await syncVariantAndProductStock(supabase, variantSize.variant_id, item.product_id)
        }
      } else if (item.variant_id) {
        // Restore variant stock
        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", item.variant_id)
          .single()

        if (variant) {
          await supabase
            .from("product_variants")
            .update({ stock: variant.stock + item.quantity })
            .eq("id", item.variant_id)
        }
      } else {
        // Restore product stock
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single()

        if (product) {
          await supabase
            .from("products")
            .update({ stock: product.stock + item.quantity })
            .eq("id", item.product_id)
        }
      }
    }
  }

  return NextResponse.json({ success: true })
}

