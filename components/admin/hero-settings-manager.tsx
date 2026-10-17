"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { DEFAULT_HERO_IMAGES, type HeroImage } from "@/lib/hero-images"
import { AlertCircle, ImageIcon, Monitor, Smartphone } from "lucide-react"

type HeroSlotState = HeroImage & { id: string }

function HeroPreview({ images, variant }: { images: HeroSlotState[]; variant: "desktop" | "mobile" }) {
  const visibleImages =
    variant === "desktop" ? images : images.filter((img) => img.visible_on_mobile)

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium flex items-center gap-2">
        {variant === "desktop" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
        Vista {variant === "desktop" ? "escritorio (6 fotos)" : "móvil"}
      </p>
      <div
        className={`grid gap-1 rounded-lg overflow-hidden border bg-muted aspect-video ${
          variant === "desktop" ? "grid-cols-3 grid-rows-2" : "grid-cols-2 grid-rows-2 max-w-xs"
        }`}
      >
        {variant === "desktop"
          ? images.map((img) => (
              <div key={img.slot_index} className="relative min-h-[60px]">
                <Image src={img.image_url} alt="" fill className="object-cover opacity-70" />
              </div>
            ))
          : visibleImages.length > 0
            ? visibleImages.map((img) => (
                <div key={img.slot_index} className="relative min-h-[60px]">
                  <Image src={img.image_url} alt="" fill className="object-cover opacity-70" />
                </div>
              ))
            : (
                <div className="col-span-2 row-span-2 flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
                  No hay fotos visibles en móvil
                </div>
              )}
      </div>
    </div>
  )
}

export function HeroSettingsManager() {
  const [slots, setSlots] = useState<HeroSlotState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)

  const supabase = createClient()

  const fetchHeroImages = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("hero_images").select("*").order("display_order", { ascending: true })

    if (error || !data || data.length === 0) {
      setSlots(
        DEFAULT_HERO_IMAGES.map((img) => ({
          ...img,
          id: `default-${img.slot_index}`,
        }))
      )
    } else {
      setSlots(data as HeroSlotState[])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchHeroImages()
  }, [])

  const mobileVisibleCount = slots.filter((s) => s.visible_on_mobile).length
  const mobileWarning =
    mobileVisibleCount !== 4
      ? mobileVisibleCount < 4
        ? `Recomendado: marcar 4 fotos para móvil (ahora hay ${mobileVisibleCount}).`
        : `Recomendado: marcar solo 4 fotos para móvil (ahora hay ${mobileVisibleCount}).`
      : null

  const updateSlot = (slotIndex: number, patch: Partial<HeroSlotState>) => {
    setSlots((prev) => prev.map((s) => (s.slot_index === slotIndex ? { ...s, ...patch } : s)))
  }

  const handleFileChange = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const slot = slots.find((s) => s.slot_index === slotIndex)
    if (!slot) return

    setUploadingSlot(slotIndex)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "hero")
      if (slot.image_url.startsWith("http")) {
        formData.append("oldImageUrl", slot.image_url)
      }

      const res = await fetch("/api/upload/image", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al subir")
      }

      const { url } = await res.json()
      updateSlot(slotIndex, { image_url: url })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setUploadingSlot(null)
      e.target.value = ""
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const slot of slots) {
        const payload = {
          slot_index: slot.slot_index,
          image_url: slot.image_url,
          alt_text: slot.alt_text || `Atto Outfit ${slot.slot_index}`,
          visible_on_mobile: slot.visible_on_mobile,
          display_order: slot.display_order,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase
          .from("hero_images")
          .upsert(payload, { onConflict: "slot_index" })

        if (error) throw error
      }
      await fetchHeroImages()
      alert("Configuración del hero guardada correctamente")
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Error al guardar. ¿Ejecutaste el script SQL de hero_images?")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Fotos del Hero</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configurá las imágenes de fondo de la página principal.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
        <p className="font-medium">Indicaciones para subir fotos</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Formato: JPG, PNG o WebP. Tamaño máximo: 5 MB.</li>
          <li>
            <strong>Tamaño recomendado:</strong> 800 × 1200 px (proporción 2:3 vertical).
          </li>
          <li>La imagen se recorta automáticamente para llenar cada casillero.</li>
          <li>
            <strong>Escritorio:</strong> se muestran las 6 fotos en grilla de 3 columnas × 2 filas.
          </li>
          <li>
            <strong>Móvil:</strong> solo las fotos marcadas como &quot;Visible en móvil&quot; (recomendado: 4) en grilla 2 × 2.
          </li>
          <li>Centrá el modelo en la foto; los bordes pueden recortarse.</li>
        </ul>
      </div>

      {mobileWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{mobileWarning}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <HeroPreview images={slots} variant="desktop" />
        <HeroPreview images={slots} variant="mobile" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {slots.map((slot) => (
          <div key={slot.slot_index} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Foto {slot.slot_index}
              </h3>
              {uploadingSlot === slot.slot_index && (
                <span className="text-xs text-muted-foreground">Subiendo...</span>
              )}
            </div>

            <div className="relative aspect-[2/3] w-full max-w-[200px] mx-auto rounded-lg overflow-hidden border bg-muted">
              <Image
                src={slot.image_url}
                alt={slot.alt_text || `Hero ${slot.slot_index}`}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <Label htmlFor={`hero-file-${slot.slot_index}`} className="mb-2 block text-sm">
                Reemplazar imagen
              </Label>
              <Input
                id={`hero-file-${slot.slot_index}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="cursor-pointer"
                disabled={uploadingSlot !== null}
                onChange={(e) => handleFileChange(slot.slot_index, e)}
              />
            </div>

            <div>
              <Label htmlFor={`hero-alt-${slot.slot_index}`} className="mb-2 block text-sm">
                Texto alternativo (opcional)
              </Label>
              <Input
                id={`hero-alt-${slot.slot_index}`}
                value={slot.alt_text || ""}
                onChange={(e) => updateSlot(slot.slot_index, { alt_text: e.target.value })}
                placeholder={`Atto Outfit ${slot.slot_index}`}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`hero-mobile-${slot.slot_index}`}
                checked={slot.visible_on_mobile}
                onCheckedChange={(checked) =>
                  updateSlot(slot.slot_index, { visible_on_mobile: checked === true })
                }
              />
              <Label htmlFor={`hero-mobile-${slot.slot_index}`} className="text-sm font-normal">
                Visible en móvil
              </Label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || uploadingSlot !== null}>
          {isSaving ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </div>
  )
}
