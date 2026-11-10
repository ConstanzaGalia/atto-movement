import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getApplicableDiscount } from "@/lib/promotions"
import { sendEmail } from "@/lib/email/client"
import { orderCreatedEmail } from "@/lib/email/templates/order-created"
import { adminNewOrderEmail } from "@/lib/email/templates/admin-new-order"
import { upsertCustomerAccount } from "@/lib/customer-accounts"
import { computeShippingCost, getSiteSettings } from "@/lib/site-settings"
import { orderAccessUrl } from "@/lib/orders/access"
import { releaseExpiredOrders } from "@/lib/orders/release-expired"
import {
  CART_EMPTY_ERROR,
  CART_ITEM_UNAVAILABLE_ERROR,
  CART_QTY_INVALID_ERROR,
} from "@/lib/brand"

type CartRow = {
  quantity: number
  variant_id: string | null
  variant_size_id: string | null
  products:
    | { id: string; name: string; price: number }
    | { id: string; name: string; price: number }[]
    | null
  product_variants: { id: string; color: string; product_id: string } | { id: string; color: string; product_id: string }[] | null
  product_variant_sizes: { id: string; size: string; variant_id: string } | { id: string; size: string; variant_id: string }[] | null
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function mapPlaceOrderError(message: string) {
  if (message.includes("STOCK_INSUFFICIENT")) {
    const detail = message.split("STOCK_INSUFFICIENT:")[1]?.trim()
    return {
      status: 400,
      body: {
        error: "Stock insuficiente",
        details: detail || "No hay suficiente stock para completar el pedido.",
      },
    }
  }
  if (message.includes("GIFT_CARD_INVALID")) {
    return { status: 400, body: { error: "Gift card inválida o inactiva" } }
  }
  if (message.includes("GIFT_CARD_EXPIRED")) {
    return { status: 400, body: { error: "Gift card vencida" } }
  }
  if (message.includes("GIFT_CARD_EMPTY")) {
    return { status: 400, body: { error: "Gift card sin saldo" } }
  }
  if (message.includes("CREDIT_DISABLED")) {
    return { status: 400, body: { error: "Cuenta corriente no habilitada" } }
  }
  if (message.includes("CREDIT_LIMIT")) {
    return { status: 400, body: { error: "Supera el límite de cuenta corriente" } }
  }
  if (message.includes("CREDIT_ACCOUNT_MISSING")) {
    return { status: 400, body: { error: "No se pudo resolver la cuenta del cliente" } }
  }
  if (message.includes("EMPTY_CART")) {
    return { status: 400, body: { error: CART_EMPTY_ERROR } }
  }
  if (message.includes("PRICE_ABOVE_CATALOG")) {
    return { status: 400, body: { error: "El precio del pedido no coincide con el catálogo" } }
  }
  return { status: 500, body: { error: "No se pudo crear el pedido" } }
}

export async function POST(request: Request) {
  const body = await request.json()
  const customerName = String(body?.customerName || "").trim()
  const customerEmail = String(body?.customerEmail || "").trim().toLowerCase()
  const customerPhone = String(body?.customerPhone || "").trim()
  const shippingAddress = String(body?.shippingAddress || "").trim()
  const notes = String(body?.notes || "").trim()
  const giftCardCode = String(body?.giftCardCode || "").trim()
  const rawPaymentMethod = String(body?.paymentMethod || "transfer")
  const useAccountCredit = body?.useAccountCredit === true || rawPaymentMethod === "account_credit"

  if (!customerName || !customerEmail || !shippingAddress) {
    return NextResponse.json({ error: "Faltan nombre, email o dirección" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const sessionId = cookieStore.get("cart_session_id")?.value
  if (!sessionId) {
    return NextResponse.json({ error: CART_EMPTY_ERROR }, { status: 400 })
  }

  const sessionClient = await createClient()
  const {
    data: { user },
  } = await sessionClient.auth.getUser()

  let userId: string | null = null
  if (user) {
    const { data: adminRow } = await sessionClient
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()
    if (!adminRow) userId = user.id
  }

  const supabase = await createClient({ role: "service_role" })

  try {
    await releaseExpiredOrders(supabase)
  } catch (err) {
    console.error("[orders/create] release expired:", err)
  }

  const { data: cartRows, error: cartError } = await supabase
    .from("cart_items")
    .select(
      "quantity, variant_id, variant_size_id, products(id, name, price), product_variants(id, color, product_id), product_variant_sizes(id, size, variant_id)"
    )
    .eq("session_id", sessionId)

  if (cartError) {
    return NextResponse.json({ error: cartError.message }, { status: 500 })
  }

  const cartItems = (cartRows || []) as CartRow[]
  if (cartItems.length === 0) {
    return NextResponse.json({ error: CART_EMPTY_ERROR }, { status: 400 })
  }

  const settings = await getSiteSettings(supabase)
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
  for (const row of cartItems) {
    const product = one(row.products)
    const variant = one(row.product_variants)
    const size = one(row.product_variant_sizes)
    if (!product) {
      return NextResponse.json({ error: CART_ITEM_UNAVAILABLE_ERROR }, { status: 400 })
    }

    const quantity = Number(row.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: CART_QTY_INVALID_ERROR }, { status: 400 })
    }

    const catalogPrice = Number(product.price)
    const { discountedPrice } = await getApplicableDiscount(supabase, product.id, catalogPrice)
    const finalPrice = Math.round(discountedPrice * 100) / 100
    let productName = product.name
    if (variant?.color) productName += ` - ${variant.color}`
    if (size?.size) productName += ` - Talle ${size.size}`

    items.push({
      product_id: product.id,
      product_name: productName,
      product_price: finalPrice,
      quantity,
      variant_id: row.variant_id,
      variant_color: variant?.color || null,
      variant_size_id: row.variant_size_id,
      variant_size: size?.size || null,
    })
    subtotal += Math.round(finalPrice * quantity * 100) / 100
  }
  subtotal = Math.round(subtotal * 100) / 100

  const shippingCost = computeShippingCost(subtotal, settings)
  let paymentMethod = rawPaymentMethod
  if (!["transfer", "mercadopago", "account_credit"].includes(paymentMethod)) {
    paymentMethod = "transfer"
  }
  if (useAccountCredit) paymentMethod = "account_credit"

  const customerAccountId = await upsertCustomerAccount(supabase, {
    email: customerEmail,
    fullName: customerName,
    phone: customerPhone || null,
    shippingAddress,
    userId,
  })

  const { data: placed, error: placeError } = await supabase.rpc("place_order", {
    payload: {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      notes,
      user_id: userId,
      customer_account_id: customerAccountId,
      payment_method: paymentMethod,
      shipping_cost: shippingCost,
      gift_card_code: giftCardCode || null,
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
    payable_amount: number
    shipping_cost: number
    gift_card_amount: number
    subtotal: number
    total_amount: number
  }

  await supabase.from("cart_items").delete().eq("session_id", sessionId)

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
    viewToken: result.view_token,
    paymentMethod: result.payment_method,
    paymentStatus: result.payment_status,
    payableAmount: Number(result.payable_amount),
    shippingCost: Number(result.shipping_cost),
    giftCardAmount: Number(result.gift_card_amount),
  })
}
