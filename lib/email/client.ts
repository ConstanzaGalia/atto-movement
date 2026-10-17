import { Resend } from "resend"

type SendEmailParams = {
  to: string
  subject: string
  html: string
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "Atto Labs <onboarding@resend.dev>"
}

/**
 * Sends an email via Resend. Failures are logged and do not throw,
 * so callers can keep the main flow (order/auth) working.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const resend = getResendClient()
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada; email no enviado:", subject, "→", to)
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
    })

    if (error) {
      console.error("[email] Error al enviar:", error)
      return false
    }

    return true
  } catch (err) {
    console.error("[email] Excepción al enviar:", err)
    return false
  }
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}
