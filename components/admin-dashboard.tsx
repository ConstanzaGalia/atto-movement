"use client"

import { useTransition, useState, useEffect } from "react"
import { ProductsManager } from "@/components/admin/products-manager"
import { CategoriesManager } from "@/components/admin/categories-manager"
import { OrdersManager } from "@/components/admin/orders-manager"
import { SalesStats } from "@/components/admin/sales-stats"
import { SuppliersManager } from "@/components/admin/suppliers-manager"
import { ExpensesManager } from "@/components/admin/expenses-manager"
import { PromotionsManager } from "@/components/admin/promotions-manager"
import { SiteSettingsManager } from "@/components/admin/site-settings-manager"
import { CustomersManager } from "@/components/admin/customers-manager"
import { GiftCardsManager } from "@/components/admin/gift-cards-manager"
import { ReportsPanel } from "@/components/admin/reports-panel"
import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
import { logoutAdmin } from "@/app/auth/actions"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

type User = {
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

type NavItem = {
  id: string
  label: string
}

const NAV: NavItem[] = [
  { id: "stats", label: "Ops" },
  { id: "orders", label: "Pedidos" },
  { id: "customers", label: "Clientes" },
  { id: "products", label: "Colección" },
  { id: "categories", label: "Categorías" },
  { id: "giftcards", label: "Gift cards" },
  { id: "suppliers", label: "Proveedores" },
  { id: "expenses", label: "Gastos" },
  { id: "promotions", label: "Promos" },
  { id: "reports", label: "Reportes" },
  { id: "settings", label: "Config" },
]

export function AdminDashboard({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState("stats")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAdmin()
      if (result?.success && result.redirectTo) {
        router.push(result.redirectTo)
      } else {
        router.push("/")
      }
    })
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-outline-variant bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon-atto.png"
              alt="Atto"
              width={44}
              height={44}
              className="border border-outline-variant object-contain"
            />
            <div>
              <AttoEyebrow>
                <span className="size-1.5 bg-black" />
                <span>OPS // ADMIN</span>
              </AttoEyebrow>
              <h1 className="font-display text-headline-sm font-bold uppercase tracking-tight text-black">Atto Labs</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-technical-micro text-atto-secondary hidden sm:inline uppercase">{user.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="border border-black bg-black px-3 py-2 font-label-caps text-white hover:bg-transparent hover:text-black transition-colors disabled:opacity-50"
            >
              {isPending ? "Salida…" : "Salir"}
            </button>
          </div>
        </div>
        <nav className="border-t border-outline-variant overflow-x-auto">
          <div className="mx-auto max-w-7xl px-2 flex gap-0 min-w-max">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "px-3 py-3 font-technical-micro uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
                  active === item.id
                    ? "border-black text-black"
                    : "border-transparent text-atto-secondary hover:text-black"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        {!mounted ? (
          <p className="font-technical-data text-atto-secondary uppercase">Cargando panel…</p>
        ) : (
          <>
            {active === "stats" && <SalesStats />}
            {active === "orders" && <OrdersManager />}
            {active === "customers" && <CustomersManager />}
            {active === "products" && <ProductsManager />}
            {active === "categories" && <CategoriesManager />}
            {active === "giftcards" && <GiftCardsManager />}
            {active === "suppliers" && <SuppliersManager />}
            {active === "expenses" && <ExpensesManager />}
            {active === "promotions" && <PromotionsManager />}
            {active === "reports" && <ReportsPanel />}
            {active === "settings" && <SiteSettingsManager />}
          </>
        )}
      </main>
    </div>
  )
}
