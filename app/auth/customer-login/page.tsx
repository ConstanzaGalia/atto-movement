"use client"

import type React from "react"

import { loginCustomer } from "@/app/auth/actions"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import {
  AttoAuthShell,
  attoAuthFieldClass,
  attoAuthLabelClass,
  attoAuthPrimaryBtnClass,
  attoAuthSecondaryBtnClass,
} from "@/components/atto/atto-auth-shell"
import { Suspense, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

function CustomerLoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [verifyLinkEmail, setVerifyLinkEmail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isGooglePending, setIsGooglePending] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const callbackError = searchParams.get("error")
  const verified = searchParams.get("verified") === "1"
  const reset = searchParams.get("reset") === "1"

  const displayError =
    error ||
    (callbackError === "auth_callback_error" ? "Error al iniciar sesión. Intentá de nuevo." : null)

  const handleGoogleLogin = async () => {
    setIsGooglePending(true)
    setError(null)
    setVerifyLinkEmail(null)
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(searchParams.get("redirect") || "/mi-cuenta")}`
          : undefined
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })
      if (oauthError) {
        setError(oauthError.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con Google")
    } finally {
      setIsGooglePending(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setVerifyLinkEmail(null)

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    startTransition(async () => {
      const result = await loginCustomer(formData)
      if (result?.error) {
        setError(result.error)
        if (result.emailNotConfirmed && result.email) {
          setVerifyLinkEmail(result.email)
        }
      } else if (result?.success) {
        const redirectTo = searchParams.get("redirect") || result.redirectTo || "/mi-cuenta"
        router.push(redirectTo)
      }
    })
  }

  return (
    <AttoAuthShell
      eyebrow="ACCOUNT // ACCESS"
      title="Iniciar sesión"
      description="Pedidos, perfil y seguimiento de envíos."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {verified && (
          <div className="border border-black bg-surface-container-low px-3 py-2 font-technical-data">
            Email verificado. Ya podés iniciar sesión.
          </div>
        )}
        {reset && (
          <div className="border border-black bg-surface-container-low px-3 py-2 font-technical-data">
            Contraseña actualizada. Iniciá sesión con tu nueva clave.
          </div>
        )}
        {displayError && (
          <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 font-technical-data text-destructive space-y-2">
            <p>{displayError}</p>
            {verifyLinkEmail && (
              <Link
                href={`/auth/verificar-email?email=${encodeURIComponent(verifyLinkEmail)}`}
                className="inline-block text-black border-b border-black"
              >
                Ir a verificar email
              </Link>
            )}
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

        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label htmlFor="password" className="font-technical-micro text-atto-secondary uppercase">
              Contraseña
            </label>
            <Link
              href="/auth/recuperar-password"
              className="font-technical-micro text-atto-secondary uppercase border-b border-outline-variant hover:text-black hover:border-black"
            >
              ¿Olvidaste?
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={attoAuthFieldClass}
          />
        </div>

        <button type="submit" disabled={isPending} className={attoAuthPrimaryBtnClass}>
          {isPending ? "Ingresando…" : "Iniciar sesión"}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGooglePending}
          className={attoAuthSecondaryBtnClass}
        >
          {isGooglePending ? "Conectando…" : "Continuar con Google"}
        </button>
      </form>

      <p className="text-center font-technical-data text-atto-secondary">
        ¿No tenés cuenta?{" "}
        <Link href="/auth/customer-register" className="text-black border-b border-black">
          Registrate
        </Link>
      </p>
    </AttoAuthShell>
  )
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full justify-center bg-surface py-16">
          <p className="font-technical-data text-atto-secondary uppercase">Cargando…</p>
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  )
}
