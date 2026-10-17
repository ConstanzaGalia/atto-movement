import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getApplicableDiscount } from "@/lib/promotions"
import { syncVariantAndProductStock } from "@/lib/stock-sync"
import { getSiteUrl, sendEmail } from "@/lib/email/client"
import { orderCreatedEmail } from "@/lib/email/templates/order-created"
import { adminNewOrderEmail } from "@/lib/email/templates/admin-new-order"
import { upsertCustomerAccount } from "@/lib/customer-accounts"
import { computeShippingCost, getSiteSettings } from "@/lib/site-settings"

export async function POST(request: Request) {
  const body = await request.json()
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    notes,
    sessionId,
    items,
    userId,
    paymentMethod: rawPaymentMethod,
    giftCardCode,
    useAccountCredit,
  } = body

  if (!customerName || !customerEmail || !shippingAddress || !items || items.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const settings = await getSiteSettings(supabase)

  for (const item of items) {
    let availableStock = 0
    if (item.variantSizeId) {
      const { data: row } = await supabase
        .from("product_variant_sizes")
        .select("stock")
        .eq("id", item.variantSizeId)
        .single()
      availableStock = row?.stock ?? 0
    } else if (item.variantId) {
      const { data: row } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variantId)
        .single()
      availableStock = row?.stock ?? 0
    } else {
      const { data: row } = await supabase.from("products").select("stock").eq("id", item.productId).single()
      availableStock = row?.stock ?? 0
    }
    if (item.quantity > availableStock) {
      const name = [item.productName, item.variantColor, item.variantSize].filter(Boolean).join(" - ")
      return NextResponse.json(
        {
          error: "Stock insuficiente",
          details: `No hay suficiente stock para "${name}". Disponible: ${availableStock}, solicitado: ${item.quantity}.`,
        },
        { status: 400 }
      )
    }
  }

  let subtotal = 0
  const itemsWithPrice: { item: (typeof items)[0]; finalPrice: number }[] = []
  for (const item of items) {
    const basePrice = Number(item.productPrice)
    const { discountedPrice } = await getApplicableDiscount(supabase, item.productId, basePrice)
    const line = Math.round(discountedPrice * item.quantity * 100) / 100
    subtotal += line
    itemsWithPrice.push({ item, finalPrice: discountedPrice })
  }
  subtotal = Math.round(subtotal * 100) / 100

  const shippingCost = computeShippingCost(subtotal, settings)
  let orderTotal = Math.round((subtotal + shippingCost) * 100) / 100

  let giftCardAmount = 0
  let giftCardId: string | null = null
  if (giftCardCode && String(giftCardCode).trim()) {
    const code = String(giftCardCode).trim().toUpperCase()
    const { data: card } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("code", code)
      .eq("status", "active")
      .maybeSingle()

    if (!card) {
      return NextResponse.json({ error: "Gift card inválida o inactiva" }, { status: 400 })
    }
    if (card.expires_at && new Date(card.expires_at) < new Date()) {
      return NextResponse.json({ error: "Gift card vencida" }, { status: 400 })
    }
    const balance = Number(card.balance)
    if (balance <= 0) {
      return NextResponse.json({ error: "Gift card sin saldo" }, { status: 400 })
    }
    giftCardAmount = Math.min(balance, orderTotal)
    giftCardId = card.id
    orderTotal = Math.round((orderTotal - giftCardAmount) * 100) / 100
  }

  let paymentMethod = (rawPaymentMethod as string) || "transfer"
  if (!["transfer", "mercadopago", "account_credit"].includes(paymentMethod)) {
    paymentMethod = "transfer"
  }

  let paymentStatus = "awaiting_transfer"
  if (paymentMethod === "mercadopago") paymentStatus = "unpaid"
  if (paymentMethod === "account_credit") paymentStatus = "on_account"
  if (orderTotal === 0 && giftCardAmount > 0) {
    paymentMethod = "gift_card"
    paymentStatus = "paid"
  } else if (giftCardAmount > 0 && paymentMethod === "transfer") {
    paymentMethod = "mixed"
  }

  const customerAccountId = await upsertCustomerAccount(supabase, {
    email: customerEmail,
    fullName: customerName,
    phone: customerPhone,
    shippingAddress,
    userId: userId || null,
  })

  if (useAccountCredit || paymentMethod === "account_credit") {
    if (!customerAccountId) {
      return NextResponse.json({ error: "No se pudo resolver la cuenta del cliente" }, { status: 400 })
    }
    const { data: credit } = await supabase
      .from("credit_accounts")
      .select("*")
      .eq("customer_account_id", customerAccountId)
      .eq("enabled", true)
      .maybeSingle()

    if (!credit) {
      return NextResponse.json({ error: "Cuenta corriente no habilitada" }, { status: 400 })
    }
    const nextBalance = Number(credit.balance) + orderTotal
    if (nextBalance > Number(credit.credit_limit)) {
      return NextResponse.json(
        {
          error: "Supera el límite de cuenta corriente",
          details: `Saldo+pedido ${nextBalance} > límite ${credit.credit_limit}`,
        },
        { status: 400 }
      )
    }
    paymentMethod = giftCardAmount > 0 ? "mixed" : "account_credit"
    paymentStatus = "on_account"
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      notes,
      total_amount: Math.round((subtotal + shippingCost) * 100) / 100,
      status: "pending",
      user_id: userId || null,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      paid_at: paymentStatus === "paid" ? new Date().toISOString() : null,
      shipping_cost: shippingCost,
      gift_card_amount: giftCardAmount,
      customer_account_id: customerAccountId,
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  if (giftCardId && giftCardAmount > 0) {
    const { data: card } = await supabase.from("gift_cards").select("balance").eq("id", giftCardId).single()
    const newBalance = Math.round((Number(card?.balance || 0) - giftCardAmount) * 100) / 100
    await supabase
      .from("gift_cards")
      .update({
        balance: newBalance,
        status: newBalance <= 0 ? "depleted" : "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", giftCardId)
    await supabase.from("gift_card_redemptions").insert({
      gift_card_id: giftCardId,
      order_id: order.id,
      amount: giftCardAmount,
    })
  }

  if (paymentStatus === "on_account" && customerAccountId && orderTotal > 0) {
    const { data: credit } = await supabase
      .from("credit_accounts")
      .select("*")
      .eq("customer_account_id", customerAccountId)
      .single()
    if (credit) {
      const newBalance = Math.round((Number(credit.balance) + orderTotal) * 100) / 100
      await supabase
        .from("credit_accounts")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", credit.id)
      await supabase.from("credit_movements").insert({
        credit_account_id: credit.id,
        type: "charge",
        amount: orderTotal,
        order_id: order.id,
        notes: "Cargo por pedido",
      })
    }
  }

  for (const { item, finalPrice } of itemsWithPrice) {
    let productName = item.productName
    if (item.variantColor) productName += ` - ${item.variantColor}`
    if (item.variantSize) productName += ` - Talle ${item.variantSize}`
    const lineSubtotal = Math.round(finalPrice * item.quantity * 100) / 100

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.productId,
      product_name: productName,
      product_price: finalPrice,
      quantity: item.quantity,
      subtotal: lineSubtotal,
      variant_id: item.variantId || null,
      variant_color: item.variantColor || null,
      variant_size_id: item.variantSizeId || null,
      variant_size: item.variantSize || null,
    })

    if (item.variantSizeId) {
      const { data: variantSize } = await supabase
        .from("product_variant_sizes")
        .select("stock, variant_id")
        .eq("id", item.variantSizeId)
        .single()
      if (variantSize) {
        await supabase
          .from("product_variant_sizes")
          .update({ stock: variantSize.stock - item.quantity })
          .eq("id", item.variantSizeId)
        await syncVariantAndProductStock(supabase, variantSize.variant_id, item.productId)
      }
    } else if (item.variantId) {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variantId)
        .single()
      if (variant) {
        await supabase
          .from("product_variants")
          .update({ stock: variant.stock - item.quantity })
          .eq("id", item.variantId)
      }
    } else {
      const { data: product } = await supabase.from("products").select("stock").eq("id", item.productId).single()
      if (product) {
        await supabase
          .from("products")
          .update({ stock: product.stock - item.quantity })
          .eq("id", item.productId)
      }
    }
  }

  if (sessionId) {
    await supabase.from("cart_items").delete().eq("session_id", sessionId)
  }

  const emailItems = itemsWithPrice.map(({ item, finalPrice }) => {
    let name = item.productName as string
    if (item.variantColor) name += ` - ${item.variantColor}`
    if (item.variantSize) name += ` - Talle ${item.variantSize}`
    return {
      name,
      quantity: item.quantity as number,
      subtotal: Math.round(finalPrice * item.quantity * 100) / 100,
    }
  })

  const payable = Math.max(0, orderTotal)
  const ordersUrl = userId ? `${getSiteUrl()}/mi-cuenta/pedidos` : null
  const { subject, html } = orderCreatedEmail({
    customerName,
    orderId: order.id,
    totalAmount: Math.round((subtotal + shippingCost) * 100) / 100,
    items: emailItems,
    ordersUrl,
  })
  await sendEmail({ to: customerEmail, subject, html })

  const adminEmail = settings.admin_notify_email || process.env.ADMIN_NOTIFY_EMAIL
  if (adminEmail) {
    const adminMail = adminNewOrderEmail({
      orderId: order.id,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount: Math.round((subtotal + shippingCost) * 100) / 100,
      paymentMethod,
      paymentStatus,
    })
    await sendEmail({ to: adminEmail, subject: adminMail.subject, html: adminMail.html })
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    paymentMethod,
    paymentStatus,
    payableAmount: payable,
    shippingCost,
    giftCardAmount,
  })
}
