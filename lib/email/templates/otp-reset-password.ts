import { emailLayout } from "./layout"

export function otpResetPasswordEmail(params: { code: string }) {
  const { code } = params

  const body = `
    <p style="margin:0 0 16px;">Hola,</p>
    <p style="margin:0 0 16px;">Recibimos un pedido para restablecer tu contraseña. Usá este código:</p>
    <p style="margin:24px 0;text-align:center;font-size:32px;letter-spacing:0.35em;font-weight:700;font-family:ui-monospace,monospace;">${code}</p>
    <p style="margin:0;color:#666;font-size:13px;">El código vence en 10 minutos. Si no pediste restablecer la contraseña, ignorá este mensaje.</p>
  `

  return {
    subject: "Código para restablecer contraseña — Atto",
    html: emailLayout("Restablecer contraseña", body),
  }
}
