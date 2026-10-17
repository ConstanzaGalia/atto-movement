"use client"

import { usePathname } from "next/navigation"
import { AttoSiteHeader } from "@/components/atto/atto-site-header"
import { AttoSiteFooter } from "@/components/atto/atto-site-footer"
import { WhatsAppFloatingButton } from "@/components/whatsapp-floating-button"
import { PromotionsProvider } from "@/contexts/promotions-context"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideClientNav =
    pathname?.startsWith("/admin") || pathname?.startsWith("/auth/admin-")

  if (hideClientNav) {
    return <>{children}</>
  }

  return (
    <PromotionsProvider>
      <AttoSiteHeader />
      <main className="pt-atto-header min-h-screen bg-gradient-to-b from-white via-surface-bright to-surface">
        {children}
      </main>
      <AttoSiteFooter />
      <WhatsAppFloatingButton />
    </PromotionsProvider>
  )
}
