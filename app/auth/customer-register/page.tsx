"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import {
  AttoAuthShell,
  attoAuthFieldClass,
  attoAuthLabelClass,
  attoAuthPrimaryBtnClass,
} from "@/components/atto/atto-auth-shell"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerCustomer } from "@/app/auth/actions"

export default function CustomerRegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    formData.append("fullName", fullName)
    if (phone) {
      formData.append("phone", phone)
    }

    startTransition(async () => {
      const result = await registerCustomer(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result.redirectTo) {
        router.push(result.redirectTo)
      }
    })
  }

  return (
    <AttoAuthShell
      eyebrow="ACCOUNT // JOIN"
      title="Crear cuenta"
      description="Seguí tus pedidos y guardá tus datos de envío."
    >
      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 font-technical-data text-destructive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className={attoAuthLabelClass}>
            Nombre completo *
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder="Tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className={`${attoAuthFieldClass} normal-case`}
          />
        </div>

        <div>
          <label htmlFor="email" className={attoAuthLabelClass}>
            Email *
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

        <div>
          <label htmlFor="phone" className={attoAuthLabelClass}>
            Teléfono / WhatsApp
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+54 9 381 …"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${attoAuthFieldClass} normal-case`}
          />
        </div>

        <div>
          <label htmlFor="password" className={attoAuthLabelClass}>
            Contraseña *
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={attoAuthFieldClass}
          />
          <p className="mt-1.5 font-technical-micro text-atto-secondary uppercase">Mínimo 6 caracteres</p>
        </div>

        <button type="submit" disabled={isPending} className={attoAuthPrimaryBtnClass}>
          {isPending ? "Registrando…" : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center font-technical-data text-atto-secondary">
        ¿Ya tenés cuenta?{" "}
        <Link href="/auth/customer-login" className="text-black border-b border-black">
          Iniciá sesión
        </Link>
      </p>
    </AttoAuthShell>
  )
}
