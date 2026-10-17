"use client"

import type React from "react"

import { resendEmailOtp, resetPasswordWithOtp } from "@/app/auth/actions"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import {
  AttoAuthShell,
  attoAuthFieldClass,
  attoAuthLabelClass,
  attoAuthPrimaryBtnClass,
} from "@/components/atto/atto-auth-shell"
import { Suspense, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function NuevaPasswordForm() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(
    initialEmail ? "Si ese email tiene una cuenta, te enviamos un código." : null
  )
  const [isPending, startTransition] = useTransition()
  const [isResending, startResend] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    const formData = new FormData()
    formData.append("email", email)
    formData.append("code", code)
    formData.append("password", password)
    formData.append("confirmPassword", confirmPassword)

    startTransition(async () => {
      const result = await resetPasswordWithOtp(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result.redirectTo) {
        router.push(result.redirectTo)
      }
    })
  }

  const handleResend = () => {
    setError(null)
    setInfo(null)
    if (!email) {
      setError("Ingresá tu email para reenviar el código.")
      return
    }

    const formData = new FormData()
    formData.append("email", email)
    formData.append("purpose", "password_reset")

    startResend(async () => {
      const result = await resendEmailOtp(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setInfo("Si ese email tiene una cuenta, te enviamos un nuevo código.")
        setCode("")
      }
    })
  }

  return (
    <AttoAuthShell
      eyebrow="ACCOUNT // NEW KEY"
      title="Nueva contraseña"
      description="Código de 6 dígitos + tu nueva clave."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 font-technical-data text-destructive">
            {error}
          </div>
        )}
        {info && (
          <div className="border border-black bg-surface-container-low px-3 py-2 font-technical-data">{info}</div>
        )}

        <div>
          <label htmlFor="email" className={attoAuthLabelClass}>
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${attoAuthFieldClass} normal-case`}
          />
        </div>

        <div>
          <label className={attoAuthLabelClass}>Código</label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="rounded-none" />
                <InputOTPSlot index={1} className="rounded-none" />
                <InputOTPSlot index={2} className="rounded-none" />
                <InputOTPSlot index={3} className="rounded-none" />
                <InputOTPSlot index={4} className="rounded-none" />
                <InputOTPSlot index={5} className="rounded-none" />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <div>
          <label htmlFor="password" className={attoAuthLabelClass}>
            Nueva contraseña
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={attoAuthFieldClass}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={attoAuthLabelClass}>
            Confirmar contraseña
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className={attoAuthFieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || code.length !== 6}
          className={attoAuthPrimaryBtnClass}
        >
          {isPending ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>

      <div className="flex flex-col gap-2 text-center font-technical-data text-atto-secondary">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-black border-b border-black self-center disabled:opacity-50"
        >
          {isResending ? "Reenviando…" : "Reenviar código"}
        </button>
        <Link href="/auth/customer-login" className="hover:text-black">
          Volver al login
        </Link>
      </div>
    </AttoAuthShell>
  )
}

export default function NuevaPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full justify-center bg-surface py-16">
          <p className="font-technical-data text-atto-secondary uppercase">Cargando…</p>
        </div>
      }
    >
      <NuevaPasswordForm />
    </Suspense>
  )
}
