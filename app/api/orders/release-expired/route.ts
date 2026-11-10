import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { releaseExpiredOrders } from "@/lib/orders/release-expired"

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get("authorization")
  return header === `Bearer ${secret}`
}

async function run() {
  const supabase = await createClient({ role: "service_role" })
  const released = await releaseExpiredOrders(supabase)
  return NextResponse.json({ ok: true, released })
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    return await run()
  } catch (err) {
    console.error("[orders/release-expired]", err)
    return NextResponse.json({ error: "No se pudo liberar el stock" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
