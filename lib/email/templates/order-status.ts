import { emailLayout, formatPrice, shortOrderId } from "./layout"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

const STATUS_MESSAGES: Record<string, string> = {
  preparing: "Tu pedido ya está en preparación. Pronto lo vas a recibir.",
  delivered: "¡Tu pedido fue entregado! Esperamos que lo disfrutes.",
  cancelled: "Tu pedido fue cancelado. Si tenés dudas, escribinos.",
}

export function orderStatusEmail(params: {
  customerName: string
  orderId: string
  status: string
  totalAmount?: number | null
  ordersUrl?: string | null
  message?: string | null
}) {
  const { customerName, orderId, status, totalAmount, ordersUrl } = params
  const orderRef = shortOrderId(orderId)
  const label = STATUS_LABELS[status] || status
  const message =
    params.message || STATUS_MESSAGES[status] || `El estado de tu pedido cambió a: ${label}.`

  const body = `
    <p style="margin:0 0 16px;">Hola ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 16px;">Actualización de tu pedido <strong>#${orderRef}</strong>.</p>
    <p style="margin:0 0 16px;padding:14px 16px;background:#f7f7f7;border-left:3px solid #1a1a1a;">
      <strong>Nuevo estado: ${escapeHtml(label)}</strong><br />
      <span style="color:#555;">${escapeHtml(message)}</span>
    </p>
    ${
      typeof totalAmount === "number"
        ? `<p style="margin:0 0 16px;">Total del pedido: <strong>${formatPrice(totalAmount)}</strong></p>`
        : ""
    }
    ${
      ordersUrl
        ? `<p style="margin:24px 0 0;"><a href="${ordersUrl}" style="display:inline-block;padding:12px 20px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:14px;">Ver pedido</a></p>`
        : ""
    }
  `

  return {
    subject: `Pedido #${orderRef}: ${label} — Atto`,
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
