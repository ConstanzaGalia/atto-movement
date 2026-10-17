"use client"

import { useState } from "react"
import { Music2, X } from "lucide-react"
import { SpotifyEmbed } from "@/components/spotify-embed"
import { cn } from "@/lib/utils"

export function SpotifyFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="flex flex-col items-start relative"
      style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", zIndex: 9999 }}
    >
      {/* Panel: queda abierto al hacer clic hasta que cierres con X o clic en el botón */}
      <div
        className={cn(
          "absolute left-0 mb-2 w-[275px] rounded-lg border border-border bg-background shadow-lg transition-all duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{ bottom: "100%" }}
      >
        <div className="flex items-center justify-between gap-1 border-b border-border px-2 py-1.5">
          <span className="text-xs font-medium">Playlist</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Cerrar reproductor"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="p-1.5 min-h-[80px]">
          <SpotifyEmbed variant="inline" compact />
        </div>
      </div>

      {/* Botón flotante: clic abre/cierra el panel y lo deja abierto */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-0"
        style={{ flexShrink: 0 }}
        aria-label={isOpen ? "Cerrar reproductor" : "Abrir reproductor de música"}
      >
        <Music2 className="w-8 h-8" />
      </button>
    </div>
  )
}
