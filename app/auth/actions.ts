"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAndSendOtp, verifyOtp } from "@/lib/email/otp"

type ActionResult = {
  error?: string
  success?: boolean
  redirectTo?: string
  emailNotConfirmed?: boolean
  email?: string
}

export async function loginAdmin(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase()
  const password = formData.get("password") as string

  // Validación básica
  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message === "Invalid login credentials") {
        return { error: "Email o contraseña incorrectos" }
      }
      return { error: error.message }
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle()

    if (!adminRow) {
      await supabase.auth.signOut()
      return { error: "No tienes permisos de administrador" }
    }

    // Revalidar las rutas para actualizar el estado de autenticación
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true, redirectTo: "/admin" }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error al iniciar sesión",
    }
  }
}

export async function logoutAdmin(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Revalidar las rutas
    revalidatePath("/")
    revalidatePath("/admin")

    return { success: true, redirectTo: "/" }
  } catch {
    // Si hay error, intentar redirigir de todas formas
    return { success: true, redirectTo: "/" }
  }
}

export async function registerCustomer(formData: FormData): Promise<ActionResult> {
  try {
    const email = (formData.get("email") as string).trim().toLowerCase()
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const phone = formData.get("phone") as string

    if (!email || !password || !fullName) {
      return { error: "Email, contraseña y nombre son requeridos" }
    }

    if (password.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres" }
    }

    const admin = await createClient({ role: "service_role" })

    const { data: existingCustomer } = await admin
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingCustomer) {
      const { data: existingUser } = await admin.auth.admin.getUserById(existingCustomer.id)
      if (existingUser.user?.email_confirmed_at) {
        return { error: "Ya existe una cuenta con este email. Iniciá sesión o recuperá tu contraseña." }
      }

      // Usuario sin confirmar: reenviar OTP
      const otpResult = await createAndSendOtp({
        email,
        purpose: "email_verify",
        userId: existingCustomer.id,
      })
      if (!otpResult.ok) {
        return { error: otpResult.error }
      }
      return {
        success: true,
        redirectTo: `/auth/verificar-email?email=${encodeURIComponent(email)}`,
        email,
      }
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
      },
    })

    if (error || !data.user) {
      return { error: error?.message || "Error al registrar usuario" }
    }

    if (phone) {
      await admin.from("customers").update({ phone, full_name: fullName }).eq("id", data.user.id)
    }

    const otpResult = await createAndSendOtp({
      email,
      purpose: "email_verify",
      userId: data.user.id,
    })

    if (!otpResult.ok) {
      return { error: otpResult.error }
    }

    return {
      success: true,
      redirectTo: `/auth/verificar-email?email=${encodeURIComponent(email)}`,
      email,
    }
  } catch (error) {
    console.error("Error en registerCustomer:", error)
    return {
      error: error instanceof Error ? error.message : "Error al registrar usuario",
    }
  }
}

export async function verifyCustomerEmail(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const code = (formData.get("code") as string)?.trim()

  if (!email || !code) {
    return { error: "Email y código son requeridos" }
  }

  const result = await verifyOtp({ email, purpose: "email_verify", code })
  if (!result.ok) {
    return { error: result.error }
  }

  const admin = await createClient({ role: "service_role" })
  let userId = result.userId

  if (!userId) {
    const { data: customer } = await admin.from("customers").select("id").eq("email", email).maybeSingle()
    userId = customer?.id ?? null
  }

  if (!userId) {
    return { error: "No encontramos tu cuenta. Registrate de nuevo." }
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  })

  if (error) {
    return { error: error.message || "No se pudo verificar el email" }
  }

  return {
    success: true,
    redirectTo: `/auth/customer-login?verified=1&email=${encodeURIComponent(email)}`,
  }
}

export async function resendEmailOtp(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const purpose = (formData.get("purpose") as string) || "email_verify"

  if (!email) {
    return { error: "Email requerido" }
  }

  if (purpose !== "email_verify" && purpose !== "password_reset") {
    return { error: "Propósito inválido" }
  }

  const admin = await createClient({ role: "service_role" })
  const { data: customer } = await admin.from("customers").select("id").eq("email", email).maybeSingle()

  if (purpose === "email_verify") {
    if (!customer) {
      return { error: "No hay una cuenta pendiente de verificación con ese email." }
    }
    const { data: userData } = await admin.auth.admin.getUserById(customer.id)
    if (userData.user?.email_confirmed_at) {
      return { error: "Este email ya está verificado. Podés iniciar sesión." }
    }
  }

  if (purpose === "password_reset" && !customer) {
    // No filtrar existencia del email
    return { success: true }
  }

  const otpResult = await createAndSendOtp({
    email,
    purpose,
    userId: customer?.id ?? null,
  })

  if (!otpResult.ok) {
    return { error: otpResult.error }
  }

  return { success: true }
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()

  if (!email) {
    return { error: "Email requerido" }
  }

  const admin = await createClient({ role: "service_role" })
  const { data: customer } = await admin.from("customers").select("id").eq("email", email).maybeSingle()

  // Respuesta genérica para no filtrar si el email existe
  const genericSuccess = {
    success: true as const,
    redirectTo: `/auth/nueva-password?email=${encodeURIComponent(email)}`,
  }

  if (!customer) {
    return genericSuccess
  }

  const { data: userData } = await admin.auth.admin.getUserById(customer.id)
  const { data: adminRow } = await admin.from("admin_users").select("id").eq("id", customer.id).maybeSingle()
  if (!userData.user || adminRow) {
    return genericSuccess
  }

  await createAndSendOtp({
    email,
    purpose: "password_reset",
    userId: customer.id,
  })

  return genericSuccess
}

export async function resetPasswordWithOtp(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const code = (formData.get("code") as string)?.trim()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !code || !password) {
    return { error: "Completá email, código y nueva contraseña" }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" }
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" }
  }

  const result = await verifyOtp({ email, purpose: "password_reset", code })
  if (!result.ok) {
    return { error: result.error }
  }

  const admin = await createClient({ role: "service_role" })
  let userId = result.userId

  if (!userId) {
    const { data: customer } = await admin.from("customers").select("id").eq("email", email).maybeSingle()
    userId = customer?.id ?? null
  }

  if (!userId) {
    return { error: "No encontramos tu cuenta." }
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  })

  if (error) {
    return { error: error.message || "No se pudo actualizar la contraseña" }
  }

  return {
    success: true,
    redirectTo: `/auth/customer-login?reset=1&email=${encodeURIComponent(email)}`,
  }
}

export async function loginCustomer(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string

  // Validación básica
  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const message = error.message.toLowerCase()
      if (
        message.includes("email not confirmed") ||
        message.includes("email_not_confirmed") ||
        message.includes("not confirmed")
      ) {
        const admin = await createClient({ role: "service_role" })
        const { data: customer } = await admin.from("customers").select("id").eq("email", email).maybeSingle()
        await createAndSendOtp({
          email,
          purpose: "email_verify",
          userId: customer?.id ?? null,
        })
        return {
          error: "Verificá tu email antes de iniciar sesión. Te enviamos un código.",
          emailNotConfirmed: true,
          email,
        }
      }
      return { error: error.message }
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle()
    if (adminRow) {
      await supabase.auth.signOut()
      return { error: "Por favor usa el login de administrador" }
    }

    // Revalidar las rutas para actualizar el estado de autenticación
    revalidatePath("/mi-cuenta")
    revalidatePath("/")

    return { success: true, redirectTo: "/mi-cuenta" }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error al iniciar sesión",
    }
  }
}

export async function logoutCustomer(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Revalidar las rutas
    revalidatePath("/")
    revalidatePath("/mi-cuenta")

    return { success: true, redirectTo: "/" }
  } catch {
    // Si hay error, intentar redirigir de todas formas
    return { success: true, redirectTo: "/" }
  }
}
