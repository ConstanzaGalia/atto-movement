import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parsear el body de manera segura
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parseando JSON:", parseError)
      return NextResponse.json({ error: "Formato de datos inválido" }, { status: 400 })
    }

    const email = String(body?.email || "")
      .trim()
      .toLowerCase()
    const password = body?.password
    const fullName = body?.fullName

    // Validación básica
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Variables de entorno faltantes:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
        url: supabaseUrl || "undefined",
      })
      return NextResponse.json(
        { error: "Configuración del servidor incorrecta. Service Role Key requerida para registro desde servidor." },
        { status: 500 }
      )
    }

    // Local Docker usa http://; producción debe ser https://
    const isLocalHttp =
      supabaseUrl.startsWith("http://127.0.0.1") ||
      supabaseUrl.startsWith("http://localhost")
    if (!supabaseUrl.startsWith("https://") && !isLocalHttp) {
      console.error("URL de Supabase inválida:", supabaseUrl)
      return NextResponse.json(
        { error: "Configuración del servidor incorrecta. URL inválida." },
        { status: 500 }
      )
    }

    // Usar Admin API con Service Role Key para crear usuarios directamente
    // Esto evita problemas con Cloudflare que bloquea requests de auth desde servidor
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Creando usuario con Admin API...")
    
    // Usar admin.auth.admin.createUser() para crear el usuario directamente
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: String(email).trim(),
      password: String(password),
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        is_admin: true,
        full_name: String(fullName).trim(),
      },
    })

    if (error) {
      console.error("Error de Supabase Admin API:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Verificar si el registro fue exitoso
    if (data?.user) {
      return NextResponse.json({
        success: true,
        redirectTo: "/auth/admin-register-success",
      })
    }

    return NextResponse.json({ error: "Error inesperado al registrar" }, { status: 500 })
  } catch (error) {
    console.error("Error en register:", error)
    const errorMessage = error instanceof Error ? error.message : "Error al registrar administrador"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

