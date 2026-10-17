"use client"

import { usePromotions } from "@/contexts/promotions-context"

const MARQUEE_REPEAT = 8

export function PromoBanner() {
  const promotions = usePromotions()
  const promoName =
    promotions?.data?.siteWide?.name ||
    (promotions?.data?.byProduct && Object.keys(promotions.data.byProduct).length > 0
      ? "¡Ofertas especiales en productos seleccionados!"
      : null)

  if (!promoName || promotions?.loading) return null

  const items = Array.from({ length: MARQUEE_REPEAT }, () => promoName)

  return (
    <div className="w-full bg-black text-white overflow-hidden py-1.5" role="region" aria-label="Promoción vigente">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {items.map((text, i) => (
          <span key={i} className="mx-6 text-sm font-medium tracking-wide">
            ★ {text} ★
          </span>
        ))}
        {items.map((text, i) => (
          <span key={`dup-${i}`} className="mx-6 text-sm font-medium tracking-wide">
            ★ {text} ★
          </span>
        ))}
      </div>
    </div>
  )
}
