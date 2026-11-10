import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: row } = await supabase.from("admin_users").select("id").eq("id", user.id).maybeSingle()

  if (!row) return null
  return user
}

export async function requireAdmin() {
  const user = await getAdminUser()
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }
  return { user, response: null }
}
