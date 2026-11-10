"use client"

import type React from "react"

import { loginAdmin } from "@/app/auth/actions"
import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    startTransition(async () => {
      const result = await loginAdmin(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result.redirectTo) {
        router.push(result.redirectTo)
      }
    })
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-surface p-6 md:p-10">
      <div className="w-full max-w-md border border-outline-variant bg-white p-6 md:p-8 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/icon-atto.png" alt="Atto" width={64} height={64} className="object-contain" />
          <AttoEyebrow>
            <span className="size-1.5 bg-black" />
            <span>OPS // ADMIN ACCESS</span>
          </AttoEyebrow>
          <h1 className="font-display text-headline-sm font-bold uppercase tracking-tight">Ingreso Atto</h1>
          <p className="font-technical-data text-atto-secondary">Acceso exclusivo operadores</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="rounded-none border-outline-variant bg-surface-container-low font-technical-data lowercase"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="font-technical-micro text-atto-secondary uppercase block">
              Contraseña
            </label>
            <PasswordInput
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-none border-outline-variant bg-surface-container-low font-technical-data"
            />
          </div>
          {error && <p className="font-technical-data text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full border border-black bg-black px-4 py-3 font-label-caps text-white hover:bg-transparent hover:text-black transition-colors disabled:opacity-50"
          >
            {isPending ? "Autenticando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  )
}
