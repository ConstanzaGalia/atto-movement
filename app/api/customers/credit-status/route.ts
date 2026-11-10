import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ enabled: false })
  }

  const { data: adminRow } = await supabase.from("admin_users").select("id").eq("id", user.id).maybeSingle()
  if (adminRow) {
    return NextResponse.json({ enabled: false })
  }

  const service = await createClient({ role: "service_role" })
  const email = user.email?.toLowerCase()
  if (!email) return NextResponse.json({ enabled: false })

  const { data: account } = await service
    .from("customer_accounts")
    .select("id")
    .ilike("email", email)
    .maybeSingle()

  if (!account) return NextResponse.json({ enabled: false })

  const { data: credit } = await service
    .from("credit_accounts")
    .select("enabled, balance, credit_limit")
    .eq("customer_account_id", account.id)
    .eq("enabled", true)
    .maybeSingle()

  if (!credit) return NextResponse.json({ enabled: false })

  return NextResponse.json({
    enabled: true,
    balance: Number(credit.balance),
    creditLimit: Number(credit.credit_limit),
  })
}
