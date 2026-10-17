"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  getDiscountedPrice as getDiscountedPriceFn,
  type ActivePromotionsResponse,
} from "@/lib/promotions-client"

type PromotionsContextValue = {
  data: ActivePromotionsResponse | null
  loading: boolean
  getDiscountedPrice: (productId: string, basePrice: number) => {
    finalPrice: number
    label: string | null
  }
}

const PromotionsContext = createContext<PromotionsContextValue | null>(null)

export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ActivePromotionsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/promotions/active?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) return { siteWide: null, byProduct: {} }
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        const hasValidShape =
          json &&
          typeof json === "object" &&
          (json.siteWide === null || (typeof json.siteWide === "object" && json.siteWide?.name)) &&
          typeof json.byProduct === "object"
        setData(hasValidShape ? json : { siteWide: null, byProduct: {} })
      })
      .catch(() => {
        if (!cancelled) setData({ siteWide: null, byProduct: {} })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const getDiscountedPrice = useCallback(
    (productId: string, basePrice: number) => {
      if (!data) return { finalPrice: basePrice, label: null }
      return getDiscountedPriceFn(data, productId, basePrice)
    },
    [data]
  )

  return (
    <PromotionsContext.Provider value={{ data, loading, getDiscountedPrice }}>
      {children}
    </PromotionsContext.Provider>
  )
}

export function usePromotions() {
  const ctx = useContext(PromotionsContext)
  return ctx
}
