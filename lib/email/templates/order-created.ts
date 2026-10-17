import { emailLayout, formatPrice, shortOrderId } from "./layout"

export type OrderCreatedItem = {
  name: string
  quantity: number
  subtotal: number
}

export function orderCreatedEmail(params: {
  customerName: string
  orderId: string
  totalAmount: number
  items: OrderCreatedItem[]
  ordersUrl?: string | null
}) {
  const { customerName, orderId, totalAmount, items, ordersUrl } = params
  const orderRef = shortOrderId(orderId)

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatPrice(item.subtotal)}</td>
        </tr>`,
    )
    .join("")

  const body = `
    <p style="margin:0 0 16px;">Hola ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 16px;">Recibimos tu pedido <strong>#${orderRef}</strong>. Te vamos a avisar por email cuando cambie de estado.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;font-size:14px;">
      <tr>
        <th align="left" style="padding:8px 0;border-bottom:2px solid #ddd;font-weight:600;">Producto</th>
        <th align="center" style="padding:8px 0;border-bottom:2px solid #ddd;font-weight:600;">Cant.</th>
        <th align="right" style="padding:8px 0;border-bottom:2px solid #ddd;font-weight:600;">Subtotal</th>
      </tr>
      ${itemsHtml}
    </table>
    <p style="margin:16px 0;font-size:16px;"><strong>Total: ${formatPrice(totalAmount)}</strong></p>
    <p style="margin:0 0 8px;">Estado actual: <strong>Pendiente</strong></p>
    ${
      ordersUrl
        ? `<p style="margin:24px 0 0;"><a href="${ordersUrl}" style="display:inline-block;padding:12px 20px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:14px;">Ver mis pedidos</a></p>`
        : ""
    }
  `

  return {
    subject: `Pedido #${orderRef} recibido — Atto`,
    html: emailLayout(`Pedido #${orderRef}`, body),
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
