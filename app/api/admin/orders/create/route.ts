import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { upsertCustomerAccount } from "@/lib/customer-accounts"
import { getApplicableDiscount } from "@/lib/promotions"
import { computeShippingCost, getSiteSettings } from "@/lib/site-settings"
import { sendEmail } from "@/lib/email/client"
import { orderCreatedEmail } from "@/lib/email/templates/order-created"
import { adminNewOrderEmail } from "@/lib/email/templates/admin-new-order"
import { orderAccessUrl } from "@/lib/orders/access"
import { releaseExpiredOrders } from "@/lib/orders/release-expired"

function mapPlaceOrderError(message: string) {
  if (message.includes("STOCK_INSUFFICIENT")) {
    return { status: 400, body: { error: "Stock insuficiente" } }
  }
  if (message.includes("CREDIT_DISABLED")) {
    return { status: 400, body: { error: "Cuenta corriente no habilitada" } }
  }
  if (message.includes("CREDIT_LIMIT")) {
    return { status: 400, body: { error: "Supera el límite de cuenta corriente" } }
  }
  if (message.includes("CREDIT_ACCOUNT_MISSING")) {
    return { status: 400, body: { error: "Cliente sin cuenta corriente" } }
  }
  if (message.includes("EMPTY_CART")) {
    return { status: 400, body: { error: "Agregá al menos un ítem" } }
  }
  if (message.includes("PRICE_ABOVE_CATALOG")) {
    return { status: 400, body: { error: "El precio no coincide con el catálogo" } }
  }
  return { status: 500, body: { error: "No se pudo crear el pedido" } }
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.user) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const customerName = String(body?.customerName || "").trim()
  const customerEmail = String(body?.customerEmail || "").trim().toLowerCase()
  const customerPhone = String(body?.customerPhone || "").trim()
  const shippingAddress = String(body?.shippingAddress || "").trim()
  const notes = String(body?.notes || "").trim()
  const rawPaymentMethod = String(body?.paymentMethod || "transfer")
  const useAccountCredit =
    body?.useAccountCredit === true || rawPaymentMethod === "account_credit"
  const freeShipping = body?.freeShipping === true
  const shippingOverride =
    body?.shippingCost !== undefined && body?.shippingCost !== null
      ? Number(body.shippingCost)
      : null
  const lineInputs = Array.isArray(body?.items) ? body.items : []

  if (!customerName || !customerEmail || !shippingAddress) {
    return NextResponse.json(
      { error: "Faltan nombre, email o dirección del cliente" },
      { status: 400 }
    )
  }
  if (lineInputs.length === 0) {
    return NextResponse.json({ error: "Agregá al menos un ítem" }, { status: 400 })
  }

  let paymentMethod = rawPaymentMethod
  if (!["transfer", "mercadopago", "account_credit"].includes(paymentMethod)) {
    paymentMethod = "transfer"
  }
  if (useAccountCredit) paymentMethod = "account_credit"

  const supabase = await createClient({ role: "service_role" })

  try {
    await releaseExpiredOrders(supabase)
  } catch (err) {
    console.error("[admin/orders/create] release expired:", err)
  }

  const items: {
    product_id: string
    product_name: string
    product_price: number
    quantity: number
    variant_id: string | null
    variant_color: string | null
    variant_size_id: string | null
    variant_size: string | null
  }[] = []

  let subtotal = 0

  for (const line of lineInputs) {
    const variantSizeId = String(line?.variantSizeId || "")
    const quantity = Number(line?.quantity)
    if (!variantSizeId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Ítem inválido" }, { status: 400 })
    }

    const { data: sizeRow, error: sizeError } = await supabase
      .from("product_variant_sizes")
      .select("id, size, stock, variant_id, product_variants(id, color, product_id, products(id, name, price))")
      .eq("id", variantSizeId)
      .maybeSingle()

    if (sizeError || !sizeRow) {
      return NextResponse.json({ error: "Talle no encontrado" }, { status: 400 })
    }

    const variantRaw = sizeRow.product_variants as
      | {
          id: string
          color: string
          product_id: string
          products: { id: string; name: string; price: number } | { id: string; name: string; price: number }[] | null
        }
      | {
          id: string
          color: string
          product_id: string
          products: { id: string; name: string; price: number } | { id: string; name: string; price: number }[] | null
        }[]
      | null

    const variant = Array.isArray(variantRaw) ? variantRaw[0] : variantRaw
    if (!variant) {
      return NextResponse.json({ error: "Variante no encontrada" }, { status: 400 })
    }
    const productRaw = variant.products
    const product = Array.isArray(productRaw) ? productRaw[0] : productRaw
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 400 })
    }

    if ((sizeRow.stock ?? 0) < quantity) {
      return NextResponse.json(
        { error: `Stock insuficiente: ${product.name} ${variant.color} ${sizeRow.size}` },
        { status: 400 }
      )
    }

    const catalogPrice = Number(product.price)
    const { discountedPrice } = await getApplicableDiscount(supabase, product.id, catalogPrice)
    const finalPrice = Math.round(discountedPrice * 100) / 100
    let productName = product.name
    if (variant.color) productName += ` - ${variant.color}`
    if (sizeRow.size) productName += ` - Talle ${sizeRow.size}`

    items.push({
      product_id: product.id,
      product_name: productName,
      product_price: finalPrice,
      quantity,
      variant_id: variant.id,
      variant_color: variant.color || null,
      variant_size_id: sizeRow.id,
      variant_size: sizeRow.size || null,
    })
    subtotal += Math.round(finalPrice * quantity * 100) / 100
  }
  subtotal = Math.round(subtotal * 100) / 100

  const settings = await getSiteSettings(supabase)
  let shippingCost =
    shippingOverride !== null && !Number.isNaN(shippingOverride)
      ? Math.max(0, shippingOverride)
      : computeShippingCost(subtotal, settings)
  if (freeShipping) shippingCost = 0

  const customerAccountId = await upsertCustomerAccount(supabase, {
    email: customerEmail,
    fullName: customerName,
    phone: customerPhone || null,
    shippingAddress,
  })

  const { data: placed, error: placeError } = await supabase.rpc("place_order", {
    payload: {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      notes,
      user_id: null,
      customer_account_id: customerAccountId,
      payment_method: paymentMethod,
      shipping_cost: shippingCost,
      gift_card_code: null,
      use_account_credit: useAccountCredit,
      hold_hours: settings.unpaid_hold_hours,
      items,
    },
  })

  if (placeError || !placed) {
    const mapped = mapPlaceOrderError(`${placeError?.message || ""} ${String(placeError?.details || "")}`)
    return NextResponse.json(mapped.body, { status: mapped.status })
  }

  const result = placed as {
    order_id: string
    view_token: string
    payment_method: string
    payment_status: string
    total_amount: number
  }

  const emailItems = items.map((item) => ({
    name: item.product_name,
    quantity: item.quantity,
    subtotal: Math.round(item.product_price * item.quantity * 100) / 100,
  }))

  const ordersUrl = orderAccessUrl(result.order_id, result.view_token)
  const { subject, html } = orderCreatedEmail({
    customerName,
    orderId: result.order_id,
    totalAmount: Number(result.total_amount),
    items: emailItems,
    ordersUrl,
  })
  await sendEmail({ to: customerEmail, subject, html })

  const adminEmail = settings.admin_notify_email || process.env.ADMIN_NOTIFY_EMAIL
  if (adminEmail) {
    const adminMail = adminNewOrderEmail({
      orderId: result.order_id,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount: Number(result.total_amount),
      paymentMethod: result.payment_method,
      paymentStatus: result.payment_status,
    })
    await sendEmail({ to: adminEmail, subject: adminMail.subject, html: adminMail.html })
  }

  return NextResponse.json({
    success: true,
    orderId: result.order_id,
    paymentStatus: result.payment_status,
    paymentMethod: result.payment_method,
  })
}
