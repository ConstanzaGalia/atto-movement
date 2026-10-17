import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { code } = await request.json()
  if (!code || !String(code).trim()) {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 })
  }

  const supabase = await createClient({ role: "service_role" })
  const { data: card } = await supabase
    .from("gift_cards")
    .select("code, balance, status, expires_at")
    .eq("code", String(code).trim().toUpperCase())
    .maybeSingle()

  if (!card || card.status !== "active") {
    return NextResponse.json({ error: "Gift card inválida o inactiva" }, { status: 404 })
  }
  if (card.expires_at && new Date(card.expires_at) < new Date()) {
    return NextResponse.json({ error: "Gift card vencida" }, { status: 400 })
  }

  return NextResponse.json({ balance: Number(card.balance), code: card.code })
}
