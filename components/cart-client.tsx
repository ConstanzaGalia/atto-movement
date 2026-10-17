"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, Trash2, Truck, ArrowLeft, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PaymentWhatsAppNotice } from "@/components/payment-whatsapp-notice"
import { usePromotions } from "@/contexts/promotions-context"
import { AttoTelemetryBar } from "@/components/atto/atto-telemetry-bar"
import { DEFAULT_SHIPPING_BASE_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/brand"

type CartItem = {
  id: string
  quantity: number
  variant_id: string | null
  variant_size_id: string | null
  products: {
    id: string
    name: string
    price: number
    image_url: string | null
    stock: number
  }
  product_variants?: {
    color: string
    stock?: number
  } | null
  product_variant_sizes?: {
    size: string
    stock?: number
  } | null
}

export function CartClient({ initialItems }: { initialItems: CartItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()
  const promotions = usePromotions()

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    setIsUpdating(cartItemId)
    try {
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      })

      if (response.ok) {
        if (newQuantity === 0) {
          setItems(items.filter((item) => item.id !== cartItemId))
        } else {
          setItems(
            items.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
          )
        }
        window.dispatchEvent(new Event("cart-updated"))
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating cart:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const removeItem = async (cartItemId: string) => {
    setIsUpdating(cartItemId)
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId }),
      })

      if (response.ok) {
        setItems(items.filter((item) => item.id !== cartItemId))
        window.dispatchEvent(new Event("cart-updated"))
        router.refresh()
      }
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const total = items.reduce((sum, item) => {
    const { finalPrice } = promotions?.getDiscountedPrice(item.products.id, item.products.price) ?? {
      finalPrice: item.products.price,
    }
    return sum + finalPrice * item.quantity
  }, 0)

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const freeShippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)
  const freeShippingReached = total >= FREE_SHIPPING_THRESHOLD

  if (items.length === 0) {
    return (
      <div className="text-center py-16 border border-surface-container-high bg-surface-container-lowest px-6">
        <p className="font-headline-sm uppercase mb-2">Bolsa vacía</p>
        <p className="font-technical-data text-atto-secondary mb-6 uppercase">
          No hay ítems en el registro de salida
        </p>
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 bg-black text-white font-label-caps px-6 py-3 hover:bg-neutral-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          CONTINUAR EXPLORANDO
        </Link>
      </div>
    )
  }

  return (
    <>
      <AttoTelemetryBar
        left={`CART TERMINAL // SESIÓN ACTIVA: #AT-${items[0]?.id.slice(0, 4).toUpperCase()}-TX`}
        right={
          <>
            <span className="hidden sm:inline">ORIGEN: TUCUMÁN [AR]</span>
            <span>DESPACHO EXPRESS 24-48H</span>
            <span className="text-black font-bold">GARANTÍA DE PRUEBA 30 DÍAS</span>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-atto py-8 lg:py-12">
        <header className="mb-8 lg:mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black pb-6">
            <div>
              <div className="flex items-center gap-2 font-technical-data uppercase text-atto-secondary mb-2">
                <span>REGISTRO DE SALIDA</span>
                <span>//</span>
                <span className="text-black font-bold">BOLSA DE DESPACHO</span>
              </div>
              <h1 className="font-headline-lg uppercase tracking-tighter text-black">
                TUS SELECCIONES{" "}
                <span className="text-atto-secondary font-light">
                  [{String(itemCount).padStart(2, "0")} ÍTEMS]
                </span>
              </h1>
            </div>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 font-label-caps px-4 py-2 border border-black text-black hover:bg-surface-container-low transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              CONTINUAR EXPLORANDO
            </Link>
          </div>

          <div className="mt-6 bg-surface-container-lowest border border-surface-container-high p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 font-technical-data uppercase">
              <div className="flex items-center gap-2 text-black font-semibold">
                <Truck className="h-4 w-4" />
                <span>
                  {freeShippingReached
                    ? "¡TENÉS ENVÍO GRATIS ASEGURADO A TODO EL PAÍS!"
                    : `FALTAN $ ${(FREE_SHIPPING_THRESHOLD - total).toLocaleString("es-AR")} PARA ENVÍO GRATIS`}
                </span>
              </div>
              <span className="font-technical-micro text-atto-secondary">
                UMBRAL: $ {FREE_SHIPPING_THRESHOLD.toLocaleString("es-AR")}+ ARS
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-700 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-2 border-b border-surface-container font-technical-micro text-atto-secondary uppercase">
              <div className="col-span-7">PRODUCTO & ATRIBUTOS TÉCNICOS</div>
              <div className="col-span-2 text-center">CANTIDAD</div>
              <div className="col-span-3 text-right">SUBTOTAL</div>
            </div>

            {items.map((item) => {
              const { finalPrice, label } = promotions?.getDiscountedPrice(
                item.products.id,
                item.products.price
              ) ?? { finalPrice: item.products.price, label: null }
              const hasDiscount = finalPrice < item.products.price
              const lineTotal = finalPrice * item.quantity
              const maxStock = item.variant_size_id
                ? (item.product_variant_sizes?.stock ?? 0)
                : item.variant_id
                  ? (item.product_variants?.stock ?? 0)
                  : item.products.stock

              return (
                <article
                  key={item.id}
                  className="bg-surface-container-lowest border border-surface-container-high p-4 sm:p-5 transition-colors hover:border-outline"
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="relative w-full sm:w-28 sm:h-36 bg-surface-container-low overflow-hidden flex-shrink-0">
                      <Image
                        src={item.products.image_url || "/placeholder.svg"}
                        alt={item.products.name}
                        fill
                        className="object-cover grayscale contrast-125"
                      />
                      <span className="absolute top-1 left-1 bg-black text-white font-technical-micro text-[9px] px-1.5 py-0.5 font-bold">
                        RUN // SPEC
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-technical-micro text-atto-secondary block mb-1">
                              REF: {item.products.id.slice(0, 8).toUpperCase()} // ATTO LABS
                            </span>
                            <h3 className="font-headline-sm uppercase text-black tracking-tight">
                              {item.products.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={isUpdating === item.id}
                            className="p-1.5 hover:bg-surface-container-low transition-colors"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {item.product_variants?.color && (
                            <div className="bg-surface-container-low px-2 py-1.5">
                              <span className="font-technical-micro text-outline block">COLOR</span>
                              <span className="font-technical-data font-bold uppercase">
                                {item.product_variants.color}
                              </span>
                            </div>
                          )}
                          {item.product_variant_sizes?.size && (
                            <div className="bg-surface-container-low px-2 py-1.5">
                              <span className="font-technical-micro text-outline block">TALLE</span>
                              <span className="font-technical-data font-bold uppercase">
                                {item.product_variant_sizes.size}
                              </span>
                            </div>
                          )}
                          <div className="bg-surface-container-low px-2 py-1.5">
                            <span className="font-technical-micro text-outline block">PRECIO</span>
                            <span className="font-technical-data font-bold">
                              $ {finalPrice.toLocaleString("es-AR")}
                              {hasDiscount && label && (
                                <span className="text-atto-secondary ml-1">({label})</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="inline-flex items-center border border-surface-container-high">
                          <button
                            type="button"
                            className="h-9 w-9 flex items-center justify-center hover:bg-surface-container-low"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating === item.id}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center font-technical-data font-bold">
                            {String(item.quantity).padStart(2, "0")}
                          </span>
                          <button
                            type="button"
                            className="h-9 w-9 flex items-center justify-center hover:bg-surface-container-low"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating === item.id || item.quantity >= maxStock}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="font-headline-sm font-bold">
                          $ {lineTotal.toLocaleString("es-AR")} ARS
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="bg-surface-container-lowest border border-surface-container-high p-6 sticky top-28 space-y-5">
              <h2 className="font-headline-sm uppercase text-black font-bold tracking-tight border-b border-surface-container-high pb-4">
                RESUMEN DE ORDEN
              </h2>
              <div className="space-y-3 font-technical-data">
                <div className="flex justify-between uppercase">
                  <span className="text-atto-secondary">Subtotal</span>
                  <span className="font-bold">$ {total.toLocaleString("es-AR")} ARS</span>
                </div>
                <div className="flex justify-between uppercase">
                  <span className="text-atto-secondary">Envío</span>
                  <span className="font-bold">
                    {freeShippingReached
                      ? "GRATIS"
                      : `$ ${DEFAULT_SHIPPING_BASE_COST.toLocaleString("es-AR")}`}
                  </span>
                </div>
              </div>
              <div className="border-t border-black pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-label-caps">TOTAL FINAL</span>
                  <span className="font-headline-md font-bold">
                    ${" "}
                    {(
                      total + (freeShippingReached ? 0 : DEFAULT_SHIPPING_BASE_COST)
                    ).toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
              <PaymentWhatsAppNotice />
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 bg-black text-white font-label-caps py-3.5 hover:bg-neutral-800 transition-colors"
              >
                <Lock className="h-4 w-4" />
                INICIAR CHECKOUT SEGURO
              </Link>
              <Link
                href="/tienda"
                className="w-full inline-flex items-center justify-center border border-black font-label-caps py-3 hover:bg-surface-container-low transition-colors"
              >
                CONTINUAR EXPLORANDO
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
