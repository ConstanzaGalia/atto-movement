import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { upsertCustomerAccount } from "@/lib/customer-accounts"

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.user) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const fullName = String(body?.fullName || "").trim()
  const email = String(body?.email || "").trim().toLowerCase()
  const phone = String(body?.phone || "").trim() || null
  const shippingAddress = String(body?.shippingAddress || "").trim() || null
  const notes = String(body?.notes || "").trim() || null
  const enableCredit = body?.enableCredit === true
  const creditLimit = Number(body?.creditLimit) || 0

  if (!fullName || !email) {
    return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const customerAccountId = await upsertCustomerAccount(supabase, {
    email,
    fullName,
    phone,
    shippingAddress,
  })

  if (!customerAccountId) {
    return NextResponse.json({ error: "No se pudo crear el cliente" }, { status: 500 })
  }

  if (notes) {
    await supabase
      .from("customer_accounts")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", customerAccountId)
  }

  if (enableCredit) {
    const { data: existing } = await supabase
      .from("credit_accounts")
      .select("id")
      .eq("customer_account_id", customerAccountId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("credit_accounts")
        .update({
          credit_limit: creditLimit,
          enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      await supabase.from("credit_accounts").insert({
        customer_account_id: customerAccountId,
        credit_limit: creditLimit,
        balance: 0,
        enabled: true,
      })
    }
  }

  const { data: customer } = await supabase
    .from("customer_accounts")
    .select("*")
    .eq("id", customerAccountId)
    .single()

  return NextResponse.json({ success: true, customer })
}
