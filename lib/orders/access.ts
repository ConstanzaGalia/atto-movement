import { getSiteUrl } from "@/lib/email/client"

export function orderAccessPath(orderId: string, viewToken?: string | null) {
  const params = new URLSearchParams({ orderId })
  if (viewToken) params.set("t", viewToken)
  return `/pedido-confirmado?${params.toString()}`
}

export function orderAccessUrl(orderId: string, viewToken?: string | null) {
  return `${getSiteUrl()}${orderAccessPath(orderId, viewToken)}`
}
