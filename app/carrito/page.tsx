import { createClient } from "@/lib/supabase/server"
import { CartClient } from "@/components/cart-client"
import { cookies } from "next/headers"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CONTINUE_ON_TRAIL, KIT_EMPTY_TITLE, KIT_LABEL } from "@/lib/brand"

export default async function CarritoPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("cart_session_id")?.value

  if (!sessionId) {
    return (
      <div className="min-h-screen px-atto py-16">
        <div className="max-w-7xl mx-auto text-center border border-surface-container-high bg-surface-container-lowest py-16 px-6">
          <p className="font-technical-data text-atto-secondary uppercase mb-2">
            REGISTRO DE SALIDA // {KIT_LABEL}
          </p>
          <h1 className="font-headline-md uppercase mb-4">{KIT_EMPTY_TITLE}</h1>
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 bg-black text-white font-label-caps px-6 py-3 hover:bg-neutral-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {CONTINUE_ON_TRAIL}
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("*, products(*), product_variants(color), product_variant_sizes(size)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen">
      <CartClient initialItems={cartItems || []} />
    </div>
  )
}
