"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PaymentWhatsAppNotice } from "@/components/payment-whatsapp-notice"
import { usePromotions } from "@/contexts/promotions-context"
import { WHATSAPP_URL } from "@/lib/brand"
import { computeShippingCost } from "@/lib/site-settings"

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
  }
  product_variants?: {
    color: string
  } | null
  product_variant_sizes?: {
    size: string
  } | null
}

type CustomerProfile = {
  full_name: string | null
  email: string
  phone: string | null
  shipping_address: string | null
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="font-technical-micro text-atto-secondary block mb-1.5">
      {children}
    </label>
  )
}

const inputClass =
  "w-full bg-surface-container-low border-0 px-3 py-3 font-technical-data text-black placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-black uppercase"

export function CheckoutForm({
  cartItems,
  sessionId,
}: {
  cartItems: CartItem[]
  sessionId: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "mercadopago" | "account_credit">("transfer")
  const [giftCardCode, setGiftCardCode] = useState("")
  const [giftPreview, setGiftPreview] = useState<number | null>(null)
  const [shippingBase, setShippingBase] = useState(5000)
  const [freeThreshold, setFreeThreshold] = useState(50000)
  const [transferInstructions, setTransferInstructions] = useState(
    "Te enviamos los datos de transferencia por WhatsApp al confirmar el pedido."
  )
  const [creditAvailable, setCreditAvailable] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const promotions = usePromotions()

  const subtotal = cartItems.reduce((sum, item) => {
    const { finalPrice } = promotions?.getDiscountedPrice(item.products.id, item.products.price) ?? {
      finalPrice: item.products.price,
    }
    return sum + finalPrice * item.quantity
  }, 0)

  const shippingCost = computeShippingCost(subtotal, {
    shipping_base_cost: shippingBase,
    free_shipping_threshold: freeThreshold,
  })
  const giftApplied = Math.min(giftPreview || 0, subtotal + shippingCost)
  const payable = Math.max(0, Math.round((subtotal + shippingCost - giftApplied) * 100) / 100)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: settings } = await supabase.from("site_settings").select("key, value")
        for (const row of settings || []) {
          if (row.key === "shipping_base_cost") setShippingBase(Number(row.value) || 0)
          if (row.key === "free_shipping_threshold") setFreeThreshold(Number(row.value) || 50000)
          if (row.key === "transfer_instructions") setTransferInstructions(row.value)
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user && !user.user_metadata?.is_admin) {
          setUserId(user.id)
          const response = await fetch("/api/customers/profile")
          if (response.ok) {
            const data = await response.json()
            setProfile(data)
          }
          const creditRes = await fetch("/api/customers/credit-status")
          if (creditRes.ok) {
            const credit = await creditRes.json()
            setCreditAvailable(!!credit.enabled)
          }
        }
      } catch (err) {
        console.error("Error loading checkout:", err)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    load()
  }, [supabase])

  const previewGiftCard = async () => {
    setGiftPreview(null)
    if (!giftCardCode.trim()) return
    const res = await fetch("/api/gift-cards/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: giftCardCode }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Gift card inválida")
      return
    }
    setError(null)
    setGiftPreview(Number(data.balance) || 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const orderData = {
      customerName: formData.get("name"),
      customerEmail: formData.get("email"),
      customerPhone: formData.get("phone"),
      shippingAddress: formData.get("address"),
      notes: formData.get("notes"),
      sessionId,
      userId: userId || null,
      paymentMethod,
      useAccountCredit: paymentMethod === "account_credit",
      giftCardCode: giftCardCode.trim() || null,
      items: cartItems.map((item) => ({
        productId: item.products.id,
        productName: item.products.name,
        productPrice: item.products.price,
        quantity: item.quantity,
        variantId: item.variant_id || null,
        variantColor: item.product_variants?.color || null,
        variantSizeId: item.variant_size_id || null,
        variantSize: item.product_variant_sizes?.size || null,
      })),
      totalAmount: subtotal,
    }

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || data.details || "Error al procesar el pedido")
        return
      }

      localStorage.removeItem("cart_session_id")
      window.dispatchEvent(new Event("cart-updated"))

      if (paymentMethod === "mercadopago" && data.payableAmount > 0) {
        const mpRes = await fetch("/api/payments/mercadopago/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId }),
        })
        const mpData = await mpRes.json()
        if (mpRes.ok && mpData.initPoint) {
          window.location.href = mpData.initPoint
          return
        }
        setError(mpData.error || "No se pudo iniciar MercadoPago. El pedido quedó creado.")
        router.push(`/pedido-confirmado?orderId=${data.orderId}`)
        return
      }

      router.push(`/pedido-confirmado?orderId=${data.orderId}`)
    } catch (err) {
      setError("Error al procesar el pedido")
      console.error("[checkout] error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      <div className="lg:col-span-7 space-y-6">
        <section className="bg-surface-container-lowest border border-surface-container-high p-6">
          <div className="flex items-center justify-between mb-6 border-b border-surface-container-high pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold">01</span>
              <h2 className="font-headline-sm uppercase text-black tracking-tight">DATOS DEL CORREDOR</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="name">NOMBRE COMPLETO *</FieldLabel>
              <input id="name" name="name" required defaultValue={profile?.full_name || ""} disabled={isLoadingProfile} className={inputClass} />
            </div>
            <div>
              <FieldLabel htmlFor="email">EMAIL *</FieldLabel>
              <input id="email" name="email" type="email" required defaultValue={profile?.email || ""} disabled={isLoadingProfile} className={inputClass} />
            </div>
            <div>
              <FieldLabel htmlFor="phone">TELÉFONO / WHATSAPP</FieldLabel>
              <input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ""} disabled={isLoadingProfile} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest border border-surface-container-high p-6">
          <div className="flex items-center justify-between mb-6 border-b border-surface-container-high pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold">02</span>
              <h2 className="font-headline-sm uppercase text-black tracking-tight">PUNTO DE DESPACHO</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="address">DIRECCIÓN COMPLETA *</FieldLabel>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                defaultValue={profile?.shipping_address || ""}
                disabled={isLoadingProfile}
                className={`${inputClass} normal-case resize-none`}
              />
            </div>
            <div>
              <FieldLabel htmlFor="notes">NOTAS DEL PEDIDO (OPCIONAL)</FieldLabel>
              <textarea id="notes" name="notes" rows={2} placeholder="Instrucciones especiales de entrega..." className={`${inputClass} normal-case resize-none`} />
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest border border-surface-container-high p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
            <span className="font-mono text-2xl font-bold">03</span>
            <h2 className="font-headline-sm uppercase text-black tracking-tight">PAGO</h2>
          </div>

          <div className="space-y-2">
            {(
              [
                { id: "transfer", label: "Transferencia bancaria", desc: transferInstructions },
                { id: "mercadopago", label: "MercadoPago", desc: "Tarjeta o dinero en cuenta MP" },
                ...(creditAvailable
                  ? [{ id: "account_credit" as const, label: "Cuenta corriente", desc: "Cargo a tu cuenta habilitada" }]
                  : []),
              ] as const
            ).map((opt) => (
              <label
                key={opt.id}
                className={`flex gap-3 border p-3 cursor-pointer ${
                  paymentMethod === opt.id ? "border-black bg-white" : "border-surface-container-high"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === opt.id}
                  onChange={() => setPaymentMethod(opt.id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-label-caps block">{opt.label}</span>
                  <span className="font-technical-micro text-atto-secondary normal-case">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <FieldLabel htmlFor="gift">GIFT CARD (OPCIONAL)</FieldLabel>
              <input
                id="gift"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                className={inputClass}
                placeholder="ATTO-XXXX-XXXX"
              />
            </div>
            <button type="button" onClick={previewGiftCard} className="border border-black px-4 py-3 font-label-caps">
              Aplicar
            </button>
          </div>
          {giftPreview != null && (
            <p className="font-technical-data text-atto-secondary">
              Saldo gift card: $ {giftPreview.toLocaleString("es-AR")} (se aplica hasta el total)
            </p>
          )}
        </section>
      </div>

      <aside className="lg:col-span-5">
        <div className="bg-surface-container-lowest border border-surface-container-high p-6 sticky top-28 space-y-5">
          <h2 className="font-headline-sm uppercase font-bold tracking-tight border-b border-surface-container-high pb-4">
            RESUMEN DE ORDEN
          </h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {cartItems.map((item) => {
              const { finalPrice, label } = promotions?.getDiscountedPrice(item.products.id, item.products.price) ?? {
                finalPrice: item.products.price,
                label: null,
              }
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-16 relative bg-surface-container-low overflow-hidden flex-shrink-0">
                    <Image src={item.products.image_url || "/placeholder.svg"} alt={item.products.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-caps text-black truncate">{item.products.name}</p>
                    <p className="font-technical-data mt-1">
                      {item.quantity} × $ {finalPrice.toLocaleString("es-AR")}
                      {label && <span className="text-atto-secondary"> ({label})</span>}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t border-black pt-4 space-y-2">
            <div className="flex justify-between font-technical-data uppercase">
              <span className="text-atto-secondary">Subtotal</span>
              <span className="font-bold">$ {subtotal.toLocaleString("es-AR")} ARS</span>
            </div>
            <div className="flex justify-between font-technical-data uppercase">
              <span className="text-atto-secondary">Envío</span>
              <span className="font-bold">
                {shippingCost === 0 ? "Gratis" : `$ ${shippingCost.toLocaleString("es-AR")}`}
              </span>
            </div>
            {giftApplied > 0 && (
              <div className="flex justify-between font-technical-data uppercase text-atto-secondary">
                <span>Gift card</span>
                <span>- $ {giftApplied.toLocaleString("es-AR")}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline">
              <span className="font-label-caps">TOTAL A PAGAR</span>
              <span className="font-headline-md font-bold">$ {payable.toLocaleString("es-AR")}</span>
            </div>
          </div>
          {paymentMethod === "transfer" && <PaymentWhatsAppNotice />}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-label-caps text-black border-b border-black pb-0.5"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            CANAL DIRECTO WHATSAPP →
          </a>
          {error && <p className="font-technical-micro text-red-600 normal-case">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-black text-white font-label-caps py-4 hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? "PROCESANDO..."
              : paymentMethod === "mercadopago"
                ? "CONTINUAR A MERCADOPAGO"
                : "CONFIRMAR PEDIDO"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </form>
  )
}
