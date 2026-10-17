import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/admin-login")
  }

  // Check if user is admin
  if (!data.user.user_metadata?.is_admin) {
    redirect("/")
  }

  return <AdminDashboard user={data.user} />
}
