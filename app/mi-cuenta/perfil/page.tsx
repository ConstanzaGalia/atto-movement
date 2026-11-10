"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
import {
  attoAuthFieldClass,
  attoAuthLabelClass,
  attoAuthPrimaryBtnClass,
  attoAuthSecondaryBtnClass,
} from "@/components/atto/atto-auth-shell"
import Link from "next/link"

type CustomerProfile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  shipping_address: string | null
  fromAuthOnly?: boolean
}

export default function PerfilPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState<CustomerProfile>({
    id: "",
    email: "",
    full_name: "",
    phone: "",
    shipping_address: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/customers/profile")
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/auth/customer-login")
            return
          }
          throw new Error("Error al cargar el perfil")
        }
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el perfil")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/customers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          shipping_address: profile.shipping_address,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al guardar el perfil")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el perfil")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-surface px-atto py-16">
        <p className="font-technical-data text-atto-secondary uppercase text-center">Cargando perfil…</p>
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-[50vh]">
      <div className="max-w-xl mx-auto px-atto py-10 md:py-14 space-y-6">
        <Link
          href="/mi-cuenta"
          className="inline-flex font-technical-micro text-atto-secondary uppercase border-b border-outline-variant hover:text-black hover:border-black"
        >
          ← Volver a mi cuenta
        </Link>

        <div className="space-y-2">
          <AttoEyebrow>
            <span className="size-1.5 bg-black" />
            <span>ACCOUNT // PROFILE</span>
          </AttoEyebrow>
          <h1 className="font-display text-headline-sm md:text-headline-md font-bold uppercase tracking-tight">
            Editar perfil
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-outline-variant bg-white p-5 md:p-6 space-y-4"
        >
          {error && (
            <div className="border border-destructive/40 bg-destructive/5 px-3 py-2 font-technical-data text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="border border-black bg-surface-container-low px-3 py-2 font-technical-data">
              Perfil actualizado
            </div>
          )}

          <div>
            <label htmlFor="email" className={attoAuthLabelClass}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className={`${attoAuthFieldClass} normal-case opacity-70`}
            />
            <p className="mt-1 font-technical-micro text-atto-secondary uppercase">No editable</p>
          </div>

          <div>
            <label htmlFor="full_name" className={attoAuthLabelClass}>
              Nombre completo *
            </label>
            <Input
              id="full_name"
              type="text"
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
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
              value={profile.phone || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+54 9 381 …"
              className={`${attoAuthFieldClass} normal-case`}
            />
          </div>

          <div>
            <label htmlFor="shipping_address" className={attoAuthLabelClass}>
              Dirección de despacho
            </label>
            <Textarea
              id="shipping_address"
              value={profile.shipping_address || ""}
              onChange={(e) => setProfile({ ...profile, shipping_address: e.target.value })}
              rows={3}
              placeholder="Calle, número, ciudad, CP…"
              className={`${attoAuthFieldClass} normal-case resize-none`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button type="submit" disabled={isSaving} className={attoAuthPrimaryBtnClass}>
              {isSaving ? "Guardando…" : "Guardar cambios"}
            </button>
            <Link href="/mi-cuenta" className={`${attoAuthSecondaryBtnClass} text-center`}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
