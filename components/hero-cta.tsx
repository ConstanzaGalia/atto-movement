"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { usePromotions } from "@/contexts/promotions-context"

export function HeroCTA() {
  const promotions = usePromotions()
  const promoName =
    promotions?.data?.siteWide?.name ||
    (promotions?.data?.byProduct && Object.keys(promotions.data.byProduct).length > 0
      ? "Ofertas especiales"
      : null)

  if (promoName && !promotions?.loading) {
    return (
      <Button asChild size="lg" className="rounded-xl bg-amber-400 text-black font-bold hover:bg-amber-300 shadow-xl border-0">
        <Link href="/tienda">
          ★ {promoName} — Ver ofertas ★
        </Link>
      </Button>
    )
  }

  return (
    <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 shadow-xl">
      <Link href="/tienda">
        <ShoppingBag className="mr-2 h-5 w-5" />
        Ver Colección
      </Link>
    </Button>
  )
}
