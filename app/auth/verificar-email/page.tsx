"use client"

import type React from "react"

import { resendEmailOtp, verifyCustomerEmail } from "@/app/auth/actions"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import {
  AttoAuthShell,
  attoAuthPrimaryBtnClass,
} from "@/components/atto/atto-auth-shell"
import { Suspense, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""
  const [email] = useState(initialEmail)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isResending, startResend] = useTransition()
  const router = useRouter()

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!email) {
      setError("Falta el email. Volvé a registrarte.")
      return
    }

    const formData = new FormData()
    formData.append("email", email)
    formData.append("code", code)

    startTransition(async () => {
      const result = await verifyCustomerEmail(formData)
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
      setError("Falta el email. Volvé a registrarte.")
      return
    }

    const formData = new FormData()
    formData.append("email", email)
    formData.append("purpose", "email_verify")

    startResend(async () => {
      const result = await resendEmailOtp(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setInfo("Te enviamos un nuevo código.")
        setCode("")
      }
    })
  }

  return (
    <AttoAuthShell
      eyebrow="ACCOUNT // VERIFY"
      title="Verificar email"
      description={`Código enviado a ${email || "tu email"}`}
    >
      <form onSubmit={handleVerify} className="space-y-5">
        {error && (
          <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 font-technical-data text-destructive">
            {error}
          </div>
        )}
        {info && (
          <div className="border border-black bg-surface-container-low px-3 py-2 font-technical-data">{info}</div>
        )}

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

        <button
          type="submit"
          disabled={isPending || code.length !== 6}
          className={attoAuthPrimaryBtnClass}
        >
          {isPending ? "Verificando…" : "Verificar"}
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full justify-center bg-surface py-16">
          <p className="font-technical-data text-atto-secondary uppercase">Cargando…</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  )
}
