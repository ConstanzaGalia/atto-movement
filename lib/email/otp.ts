import { createHash, randomInt } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/client"
import { otpVerifyEmail } from "@/lib/email/templates/otp-verify"
import { otpResetPasswordEmail } from "@/lib/email/templates/otp-reset-password"

export type OtpPurpose = "email_verify" | "password_reset"

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex")
}

function generateCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0")
}

export async function createAndSendOtp(params: {
  email: string
  purpose: OtpPurpose
  userId?: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = params.email.trim().toLowerCase()
  const supabase = await createClient({ role: "service_role" })

  // Invalidate previous unused codes for this email+purpose
  await supabase.from("email_otps").delete().eq("email", email).eq("purpose", params.purpose)

  const code = generateCode()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString()

  const { error: insertError } = await supabase.from("email_otps").insert({
    email,
    purpose: params.purpose,
    code_hash: hashCode(code),
    user_id: params.userId || null,
    expires_at: expiresAt,
    attempts: 0,
  })

  if (insertError) {
    console.error("[otp] insert error:", insertError)
    return { ok: false, error: "No se pudo generar el código. Intentá de nuevo." }
  }

  const template =
    params.purpose === "email_verify" ? otpVerifyEmail({ code }) : otpResetPasswordEmail({ code })

  const sent = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  })

  if (!sent) {
    return {
      ok: false,
      error: "No se pudo enviar el email. Verificá la configuración de Resend o intentá más tarde.",
    }
  }

  return { ok: true }
}

export async function verifyOtp(params: {
  email: string
  purpose: OtpPurpose
  code: string
}): Promise<{ ok: true; userId: string | null } | { ok: false; error: string }> {
  const email = params.email.trim().toLowerCase()
  const code = params.code.trim()

  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Ingresá el código de 6 dígitos." }
  }

  const supabase = await createClient({ role: "service_role" })

  const { data: rows, error } = await supabase
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("purpose", params.purpose)
    .order("created_at", { ascending: false })
    .limit(1)

  if (error || !rows?.length) {
    return { ok: false, error: "No hay un código activo. Pedí uno nuevo." }
  }

  const row = rows[0]

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabase.from("email_otps").delete().eq("id", row.id)
    return { ok: false, error: "El código expiró. Pedí uno nuevo." }
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    await supabase.from("email_otps").delete().eq("id", row.id)
    return { ok: false, error: "Demasiados intentos. Pedí un código nuevo." }
  }

  if (row.code_hash !== hashCode(code)) {
    await supabase
      .from("email_otps")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id)
    return { ok: false, error: "Código incorrecto." }
  }

  await supabase.from("email_otps").delete().eq("id", row.id)

  return { ok: true, userId: row.user_id ?? null }
}
