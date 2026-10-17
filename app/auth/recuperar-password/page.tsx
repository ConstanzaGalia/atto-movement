"use client"

import type React from "react"

import { requestPasswordReset } from "@/app/auth/actions"
import { Input } from "@/components/ui/input"
import {
  AttoAuthShell,
  attoAuthFieldClass,
  attoAuthLabelClass,
  attoAuthPrimaryBtnClass,
} from "@/components/atto/atto-auth-shell"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append("email", email)

    startTransition(async () => {
      const result = await requestPasswordReset(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result.redirectTo) {
        router.push(result.redirectTo)
      }
    })
  }

  return (
    <AttoAuthShell
      eyebrow="ACCOUNT // RESET"
      title="Recuperar contraseña"
      description="Te enviamos un código de 6 dígitos a tu email."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 font-technical-data text-destructive">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className={attoAuthLabelClass}>
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${attoAuthFieldClass} normal-case`}
          />
        </div>
        <button type="submit" disabled={isPending} className={attoAuthPrimaryBtnClass}>
          {isPending ? "Enviando…" : "Enviar código"}
        </button>
      </form>
      <p className="text-center font-technical-data text-atto-secondary">
        <Link href="/auth/customer-login" className="text-black border-b border-black">
          Volver al login
        </Link>
      </p>
    </AttoAuthShell>
  )
}
