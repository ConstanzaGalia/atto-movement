export function emailLayout(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'IBM Plex Mono',Consolas,monospace;color:#191c1d;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f9fa;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e7e8e9;">
          <tr>
            <td style="padding:28px 28px 12px;text-align:center;border-bottom:1px solid #e7e8e9;">
              <p style="margin:0;font-size:28px;letter-spacing:0.08em;font-weight:800;font-family:Montserrat,Arial,sans-serif;text-transform:uppercase;">ATTO</p>
              <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.12em;color:#5f5e5e;text-transform:uppercase;">Labs // Trail Running</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.55;color:#333;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 28px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#5f5e5e;border-top:1px solid #e7e8e9;letter-spacing:0.06em;text-transform:uppercase;">
              Atto Labs · Tucumán, Argentina
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase()
}
