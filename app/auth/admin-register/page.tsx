"use client"

import type React from "react"

import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, fullName }),
        })

        const text = await response.text()
        const contentType = response.headers.get("content-type")

        if (!contentType || !contentType.includes("application/json")) {
          setError("Error del servidor. Por favor intenta nuevamente.")
          return
        }

        let result
        try {
          result = JSON.parse(text)
        } catch {
          setError("Error al procesar la respuesta del servidor.")
          return
        }

        if (!response.ok || result.error) {
          setError(result.error || "Error al registrar usuario")
        } else if (result.success && result.redirectTo) {
          router.push(result.redirectTo)
        }
      } catch {
        setError("Error al procesar la solicitud. Por favor intenta nuevamente.")
      }
    })
  }

  const fieldClass =
    "rounded-none border-outline-variant bg-surface-container-low font-technical-data"

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-surface p-6 md:p-10">
      <div className="w-full max-w-md border border-outline-variant bg-white p-6 md:p-8 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/icon-atto.png" alt="Atto" width={64} height={64} className="object-contain" />
          <AttoEyebrow>
            <span className="size-1.5 bg-black" />
            <span>OPS // ADMIN SETUP</span>
          </AttoEyebrow>
          <h1 className="font-display text-headline-sm font-bold uppercase tracking-tight">Alta operador</h1>
          <p className="font-technical-data text-atto-secondary">Crear cuenta de administración</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="font-technical-micro text-atto-secondary uppercase block">
              Nombre completo
            </label>
            <Input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${fieldClass} uppercase`}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="font-technical-micro text-atto-secondary uppercase block">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@atto.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              className={`${fieldClass} lowercase`}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="font-technical-micro text-atto-secondary uppercase block">
              Contraseña
            </label>
            <PasswordInput
              id="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
          {error && <p className="font-technical-data text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full border border-black bg-black px-4 py-3 font-label-caps text-white hover:bg-transparent hover:text-black transition-colors disabled:opacity-50"
          >
            {isPending ? "Registrando…" : "Crear cuenta"}
          </button>
          <p className="text-center font-technical-data text-atto-secondary">
            ¿Ya tenés acceso?{" "}
            <Link href="/auth/admin-login" className="text-black border-b border-black">
              Ingresar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
