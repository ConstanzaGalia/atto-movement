import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  try {
  let supabaseResponse = NextResponse.next({
    request,
  })

    // Skip API routes
    if (request.nextUrl.pathname.startsWith("/api")) {
      return supabaseResponse
    }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/admin-login"
      return NextResponse.redirect(url)
    }
    const { data: adminRow } = await supabase.from("admin_users").select("id").eq("id", user.id).maybeSingle()
    if (!adminRow) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  // Protect customer account routes
  if (request.nextUrl.pathname.startsWith("/mi-cuenta") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/customer-login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
  } catch (error) {
    console.error("Error en middleware:", error)
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/admin-login"
      return NextResponse.redirect(url)
    }
    return NextResponse.next({
      request,
    })
  }
}
