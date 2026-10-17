"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  ShoppingBag,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  LogIn,
  ArrowRight,
} from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { usePromotions } from "@/contexts/promotions-context"
import { AttoLogo } from "@/components/atto/atto-logo"
import { MARQUEE_DEFAULT, NAV_LINKS } from "@/lib/brand"

export function AttoSiteHeader() {
  const [cartCount, setCartCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [adminDisplayName, setAdminDisplayName] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const promotions = usePromotions()

  const promoName =
    promotions?.data?.siteWide?.name ||
    (promotions?.data?.byProduct && Object.keys(promotions.data.byProduct).length > 0
      ? "¡Ofertas especiales en productos seleccionados!"
      : null)

  const tickerText =
    promoName && !promotions?.loading ? `PROMO // ${promoName}` : MARQUEE_DEFAULT

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let isMounted = true

    const checkAuth = async () => {
      setIsCheckingAuth(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!isMounted) return

        if (user) {
          setIsLoggedIn(true)
          const isAdminUser = user.user_metadata?.is_admin === true
          setIsAdmin(isAdminUser)

          if (isAdminUser) {
            setAdminDisplayName(
              user.user_metadata?.full_name || user.email?.split("@")[0] || user.email || "Admin"
            )
            setCustomerName(null)
          } else {
            setAdminDisplayName(null)
            try {
              const response = await fetch("/api/customers/profile")
              if (response.ok && isMounted) {
                const profile = await response.json()
                setCustomerName(profile.full_name || user.email?.split("@")[0] || "Usuario")
              } else if (isMounted) {
                setCustomerName(user.email?.split("@")[0] || "Usuario")
              }
            } catch {
              if (isMounted) {
                setCustomerName(user.email?.split("@")[0] || "Usuario")
              }
            }
          }
        } else {
          setIsLoggedIn(false)
          setIsAdmin(false)
          setCustomerName(null)
          setAdminDisplayName(null)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        if (isMounted) {
          setIsLoggedIn(false)
          setIsAdmin(false)
          setCustomerName(null)
          setAdminDisplayName(null)
        }
      } finally {
        if (isMounted) setIsCheckingAuth(false)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (isMounted) checkAuth()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [mounted, supabase.auth])

  useEffect(() => {
    if (!mounted) return

    const updateCartCount = async () => {
      let sessionId = localStorage.getItem("cart_session_id")

      if (!sessionId) {
        sessionId = crypto.randomUUID()
        localStorage.setItem("cart_session_id", sessionId)
        document.cookie = `cart_session_id=${sessionId}; path=/; max-age=2592000; SameSite=Lax`
        setCartCount(0)
        return
      }

      try {
        const response = await fetch(`/api/cart?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          const total = data.items.reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0
          )
          setCartCount(total)
        }
      } catch (error) {
        console.error("Error fetching cart:", error)
      }
    }

    updateCartCount()
    window.addEventListener("cart-updated", updateCartCount)
    return () => window.removeEventListener("cart-updated", updateCartCount)
  }, [mounted])

  const cartLabel = String(cartCount).padStart(2, "0")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-container-high">
      <div className="w-full bg-surface-container-low border-b border-surface-container py-1.5 px-atto overflow-hidden">
        <div className="flex items-center justify-between font-technical-micro text-atto-secondary">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-1.5 h-1.5 bg-black shrink-0" />
            <span className="font-medium tracking-tight sm:tracking-widest truncate">
              {tickerText}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <span className="text-black font-semibold">■ LIVE MATRIX</span>
            <span>AR // UTC-3</span>
          </div>
        </div>
      </div>

      <div className="h-20 w-full px-atto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <AttoLogo />
          <nav className="hidden xl:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-label-caps text-atto-secondary hover:text-black transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {mounted && !isCheckingAuth && (
            <>
              {isLoggedIn && !isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="inline-flex items-center gap-2 border border-black bg-black px-2.5 py-1.5 font-technical-micro text-white hover:bg-transparent hover:text-black transition-colors"
                      title="Sesión activa"
                    >
                      <span className="size-1.5 bg-white shrink-0" />
                      <span className="hidden sm:inline uppercase tracking-wider">Online</span>
                      <span className="max-w-[90px] sm:max-w-[110px] truncate uppercase font-bold">
                        {(customerName || "Cuenta").split(" ")[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-none">
                    <div className="px-2 py-2 font-technical-micro border-b space-y-0.5">
                      <p className="text-atto-secondary uppercase text-[10px]">Sesión activa</p>
                      <p className="font-bold uppercase truncate">{customerName}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/mi-cuenta">Mi cuenta</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mi-cuenta/pedidos">Mis pedidos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mi-cuenta/perfil">Editar perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await supabase.auth.signOut()
                        setCustomerName(null)
                        router.push("/")
                        router.refresh()
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isLoggedIn && isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-2 border border-black bg-black px-2.5 py-1.5 font-technical-micro text-white hover:bg-transparent hover:text-black transition-colors">
                      <span className="size-1.5 bg-white shrink-0" />
                      <span className="hidden sm:inline uppercase tracking-wider">Ops</span>
                      <span className="max-w-[90px] truncate uppercase font-bold">
                        {(adminDisplayName || "Admin").split(" ")[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-none">
                    <div className="px-2 py-2 font-technical-micro border-b">
                      <p className="text-atto-secondary uppercase text-[10px]">Admin online</p>
                      <p className="font-bold uppercase truncate">{adminDisplayName}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Panel Admin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await supabase.auth.signOut()
                        setAdminDisplayName(null)
                        router.push("/")
                        router.refresh()
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/auth/customer-login"
                  className="inline-flex items-center gap-1.5 border border-surface-container-highest px-2.5 py-1.5 font-technical-micro text-atto-secondary hover:border-black hover:text-black transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">MI CUENTA</span>
                </Link>
              )}
            </>
          )}

          <Link
            href="/carrito"
            className="inline-flex items-center gap-2 bg-black text-white font-label-caps px-3 sm:px-4 py-2 hover:bg-neutral-800 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">CARRITO</span>
            <span className="bg-white text-black font-technical-micro px-1.5 py-0.5 font-bold">
              [{cartLabel}]
            </span>
          </Link>

          <Link
            href="/checkout"
            className="hidden sm:inline-flex items-center gap-1 border border-black px-3 py-2 font-label-caps text-black hover:bg-black hover:text-white transition-colors"
          >
            CHECKOUT
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {mounted ? (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <button
                  className="p-2 border border-surface-container-highest hover:border-black transition-colors"
                  aria-label="Menú"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[calc(100%-1.5rem)] sm:max-w-sm rounded-none border-l border-surface-container-high bg-white"
              >
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <div className="pl-6 pr-2 pt-12 pb-6">
                  <p className="font-technical-micro text-atto-secondary mb-5">MENÚ // MATRIX</p>
                  <nav className="flex flex-col gap-0.5">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="font-label-caps px-3 py-3 hover:bg-surface-container-low transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="my-4 h-px bg-surface-container-high" />
                  {!isCheckingAuth &&
                    (isLoggedIn && !isAdmin ? (
                      <>
                        <p className="px-3 py-2 font-technical-micro text-atto-secondary uppercase">
                          Online // {(customerName || "Cuenta").split(" ")[0]}
                        </p>
                        <Link
                          href="/mi-cuenta"
                          className="flex items-center gap-3 px-3 py-3 font-label-caps"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Mi cuenta
                        </Link>
                        <Link
                          href="/mi-cuenta/pedidos"
                          className="flex items-center gap-3 px-3 py-3 font-label-caps"
                          onClick={() => setIsOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Mis pedidos
                        </Link>
                      </>
                    ) : isLoggedIn && isAdmin ? (
                      <>
                        <p className="px-3 py-2 font-technical-micro text-atto-secondary uppercase">
                          Ops // {(adminDisplayName || "Admin").split(" ")[0]}
                        </p>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-3 py-3 font-label-caps"
                          onClick={() => setIsOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Panel Admin
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/auth/customer-login"
                        className="flex items-center gap-3 px-3 py-3 font-label-caps"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn className="h-4 w-4" />
                        Iniciar Sesión
                      </Link>
                    ))}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <button className="xl:hidden p-2 border border-surface-container-highest" aria-hidden>
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
