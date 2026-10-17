import { emailLayout, formatPrice, shortOrderId } from "./layout"

export function adminNewOrderEmail(params: {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
}) {
  const ref = shortOrderId(params.orderId)
  const body = `
    <p style="margin:0 0 16px;">Nuevo pedido <strong>#${ref}</strong></p>
    <ul style="margin:0 0 16px;padding-left:18px;font-size:14px;">
      <li>Cliente: ${escapeHtml(params.customerName)}</li>
      <li>Email: ${escapeHtml(params.customerEmail)}</li>
      <li>Tel: ${escapeHtml(params.customerPhone || "—")}</li>
      <li>Total: ${formatPrice(params.totalAmount)}</li>
      <li>Pago: ${escapeHtml(params.paymentMethod)} / ${escapeHtml(params.paymentStatus)}</li>
    </ul>
    <p style="margin:0;font-size:13px;color:#666;">Revisá el panel admin → Pedidos.</p>
  `
  return {
    subject: `Atto // Nuevo pedido #${ref}`,
    html: emailLayout(`Pedido #${ref}`, body),
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
