"use client"

import { useState } from "react"
import Link from "next/link"

export default function ConsultarPedidoPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      setMessage(data.message || "Si hay un pedido con ese email, te enviamos el enlace.")
    } catch {
      setMessage("Si hay un pedido con ese email, te enviamos el enlace.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-atto py-16">
      <div className="max-w-md w-full border border-surface-container-high bg-surface-container-lowest p-8 space-y-6">
        <div className="space-y-2">
          <p className="font-technical-micro text-atto-secondary">PEDIDO // CONSULTA</p>
          <h1 className="font-headline-md uppercase">Ver un pedido</h1>
          <p className="font-technical-data text-atto-secondary normal-case">
            Te enviamos de nuevo el enlace para ver el pedido. No hace falta tener cuenta.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label htmlFor="email" className="font-technical-micro text-atto-secondary block">
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full bg-surface-container-low px-3 py-3 font-technical-data text-black focus:outline-none focus:ring-2 focus:ring-black normal-case"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white font-label-caps py-3 disabled:opacity-50"
          >
            {isSubmitting ? "ENVIANDO..." : "ENVIAR ENLACE"}
          </button>
        </form>
        {message && <p className="font-technical-data text-atto-secondary normal-case">{message}</p>}
        <Link href="/tienda" className="inline-flex font-label-caps border-b border-black">
          VOLVER A LA TIENDA
        </Link>
      </div>
    </div>
  )
}
