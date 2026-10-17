import { createClient } from "@/lib/supabase/server"
import { CheckoutForm } from "@/components/checkout-form"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AttoTelemetryBar } from "@/components/atto/atto-telemetry-bar"

export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("cart_session_id")?.value

  if (!sessionId) {
    redirect("/carrito")
  }

  const supabase = await createClient()

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, products(*), product_variants(color), product_variant_sizes(size)")
    .eq("session_id", sessionId)

  if (!cartItems || cartItems.length === 0) {
    redirect("/carrito")
  }

  return (
    <div className="min-h-screen">
      <AttoTelemetryBar
        left="CHECKOUT SEGURO // ENCRYPTED SESSION"
        right={
          <>
            <span className="hidden sm:inline">ATTO LABS PAY</span>
            <span className="text-black font-bold">STEP 01–03</span>
          </>
        }
      />
      <div className="px-atto py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 border-b border-black pb-6">
            <p className="font-technical-data text-atto-secondary uppercase mb-2">
              REGISTRO DE SALIDA // CHECKOUT
            </p>
            <h1 className="font-headline-lg uppercase tracking-tighter text-black">
              Pago y despacho seguro
            </h1>
          </div>
          <CheckoutForm cartItems={cartItems} sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
}
