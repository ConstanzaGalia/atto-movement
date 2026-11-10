import { emailLayout, shortOrderId } from "./layout"

export function orderTrackingEmail(params: {
  customerName: string
  orderId: string
  carrier?: string | null
  trackingNumber: string
}) {
  const ref = shortOrderId(params.orderId)
  const body = `
    <p style="margin:0 0 16px;">Hola ${escapeHtml(params.customerName)},</p>
    <p style="margin:0 0 16px;">Tu pedido <strong>#${ref}</strong> ya tiene seguimiento de envío.</p>
    <p style="margin:0 0 8px;font-size:14px;"><strong>Carrier:</strong> ${escapeHtml(params.carrier || "—")}</p>
    <p style="margin:0 0 16px;font-size:14px;"><strong>Tracking:</strong> ${escapeHtml(params.trackingNumber)}</p>
  `
  return {
    subject: `Atto // Despacho #${ref}`,
    html: emailLayout(`Tracking #${ref}`, body),
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
