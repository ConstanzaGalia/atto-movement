import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/admin-login")
  }

  const { data: adminRow } = await supabase.from("admin_users").select("id").eq("id", data.user.id).maybeSingle()
  if (!adminRow) {
    redirect("/")
  }

  return <AdminDashboard user={data.user} />
}
