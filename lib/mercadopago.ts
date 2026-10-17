const MP_API = "https://api.mercadopago.com"

export function getMercadoPagoAccessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN || ""
}

export function isMercadoPagoConfigured() {
  return Boolean(getMercadoPagoAccessToken())
}

export async function createMercadoPagoPreference(params: {
  orderId: string
  title: string
  amount: number
  payerEmail: string
  successUrl: string
  failureUrl: string
  pendingUrl: string
  notificationUrl: string
}) {
  const token = getMercadoPagoAccessToken()
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado")
  }

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_reference: params.orderId,
      items: [
        {
          id: params.orderId,
          title: params.title,
          quantity: 1,
          unit_price: params.amount,
          currency_id: "ARS",
        },
      ],
      payer: { email: params.payerEmail },
      back_urls: {
        success: params.successUrl,
        failure: params.failureUrl,
        pending: params.pendingUrl,
      },
      auto_return: "approved",
      notification_url: params.notificationUrl,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error creando preferencia MP")
  }
  return data as { id: string; init_point: string; sandbox_init_point?: string }
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const token = getMercadoPagoAccessToken()
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado")

  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || "Error leyendo pago MP")
  return data as {
    id: number
    status: string
    external_reference?: string
  }
}
