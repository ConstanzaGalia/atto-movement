import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabaseAuth = await createClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()
  if (!user?.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { customerAccountId, creditLimit, enabled } = await request.json()
  if (!customerAccountId) {
    return NextResponse.json({ error: "Missing customerAccountId" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const { data: existing } = await supabase
    .from("credit_accounts")
    .select("id")
    .eq("customer_account_id", customerAccountId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("credit_accounts")
      .update({
        credit_limit: Number(creditLimit) || 0,
        enabled: !!enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase.from("credit_accounts").insert({
      customer_account_id: customerAccountId,
      credit_limit: Number(creditLimit) || 0,
      balance: 0,
      enabled: !!enabled,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
