"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
  stock: number
}

export function AddToCartButton({ product }: { product: Product }) {
  const [isAdding, setIsAdding] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let id = localStorage.getItem("cart_session_id")
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem("cart_session_id", id)
    }
    setSessionId(id)
    document.cookie = `cart_session_id=${id}; path=/; max-age=2592000; SameSite=Lax`
  }, [])

  const addToCart = async () => {
    if (!sessionId) return

    setIsAdding(true)
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        window.dispatchEvent(new Event("cart-updated"))
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button onClick={addToCart} disabled={isAdding || product.stock === 0} size="lg" className="w-full md:w-auto">
      <ShoppingCart className="mr-2 h-5 w-5" />
      {isAdding ? "Agregando..." : "Agregar al Carrito"}
    </Button>
  )
}
