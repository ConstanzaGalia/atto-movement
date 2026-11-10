import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.user) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { creditAccountId, amount, notes } = await request.json()
  const value = Number(amount)
  if (!creditAccountId || !value || value <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const { data: credit, error: fetchError } = await supabase
    .from("credit_accounts")
    .select("*")
    .eq("id", creditAccountId)
    .single()

  if (fetchError || !credit) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
  }

  const newBalance = Math.max(0, Math.round((Number(credit.balance) - value) * 100) / 100)

  await supabase.from("credit_movements").insert({
    credit_account_id: creditAccountId,
    type: "payment",
    amount: value,
    notes: notes || "Pago a cuenta",
    created_by: auth.user.id,
  })

  await supabase
    .from("credit_accounts")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", creditAccountId)

  // Mark oldest on_account orders as paid while amount covers them
  let remaining = value
  const { data: openOrders } = await supabase
    .from("orders")
    .select("id, total_amount, gift_card_amount")
    .eq("customer_account_id", credit.customer_account_id)
    .eq("payment_status", "on_account")
    .order("created_at", { ascending: true })

  for (const order of openOrders || []) {
    if (remaining <= 0) break
    const due =
      Math.round((Number(order.total_amount) - Number(order.gift_card_amount || 0)) * 100) / 100
    if (remaining + 0.001 >= due) {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          stock_held_until: null,
          payment_notes: notes || "Cobrado vía cuenta corriente",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
      remaining = Math.round((remaining - due) * 100) / 100
    }
  }

  return NextResponse.json({ success: true, balance: newBalance })
}
