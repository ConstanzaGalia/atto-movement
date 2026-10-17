import { emailLayout } from "./layout"

export function otpVerifyEmail(params: { code: string }) {
  const { code } = params

  const body = `
    <p style="margin:0 0 16px;">Hola,</p>
    <p style="margin:0 0 16px;">Usá este código para verificar tu email en Atto:</p>
    <p style="margin:24px 0;text-align:center;font-size:32px;letter-spacing:0.35em;font-weight:700;font-family:ui-monospace,monospace;">${code}</p>
    <p style="margin:0;color:#666;font-size:13px;">El código vence en 10 minutos. Si no pediste crear una cuenta, ignorá este mensaje.</p>
  `

  return {
    subject: "Tu código de verificación — Atto",
    html: emailLayout("Verificar email", body),
  }
}
