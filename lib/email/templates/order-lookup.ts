import { emailLayout, shortOrderId } from "./layout"

export function orderLookupEmail(params: {
  links: { orderId: string; url: string }[]
}) {
  const items = params.links
    .map((link) => {
      const ref = shortOrderId(link.orderId)
      return `<li style="margin:0 0 12px;"><a href="${link.url}" style="color:#1a1a1a;">Pedido #${ref}</a></li>`
    })
    .join("")

  const body = `
    <p style="margin:0 0 16px;">Pediste el enlace para ver tus pedidos de Atto.</p>
    <ul style="margin:0 0 16px;padding-left:18px;font-size:14px;">
      ${items}
    </ul>
    <p style="margin:0;font-size:13px;color:#666;">Si no fuiste vos, podés ignorar este mensaje.</p>
  `

  return {
    subject: "Tus pedidos — Atto",
    html: emailLayout("Tus pedidos", body),
  }
}
