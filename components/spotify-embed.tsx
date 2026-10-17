"use client"

import Script from "next/script"
import { useContext, useEffect, useRef, useState } from "react"
import {
  SpotifyContext,
  type SpotifyContextValue,
  type SpotifyEmbedController as ContextSpotifyController,
} from "@/contexts/spotify-context"

const PLAYLIST_URI = "spotify:playlist:0xHgijmF1pw9h2EBBOfjQe"
const IFRAME_API_SCRIPT = "https://open.spotify.com/embed/iframe-api/v1"
const EMBED_CONTAINER_ID = "spotify-embed-container"

let embedCreated = false
let embedCompact = false

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIframeApi) => void
    __SpotifyIFrameAPI?: SpotifyIframeApi
  }
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: number; height?: number; theme?: string },
    callback: (controller: SpotifyEmbedController) => void
  ) => void
}

interface SpotifyEmbedController {
  addListener: (event: string, callback: (e?: { data?: { isPaused?: boolean } }) => void) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
}

function createSpotifyEmbed(
  IFrameAPI: SpotifyIframeApi,
  onControllerReady: (controller: SpotifyEmbedController) => void
) {
  if (embedCreated) return
  const container = document.getElementById(EMBED_CONTAINER_ID)
  if (!container || container.hasChildNodes()) return
  embedCreated = true
  const width = embedCompact ? 260 : 640
  const height = embedCompact ? 80 : 152
  IFrameAPI.createController(
    container,
    { uri: PLAYLIST_URI, width, height, theme: "dark" },
    (controller) => {
      // Registrar y dar play solo cuando el reproductor esté listo, para que no salte canciones
      controller.addListener("ready", () => {
        onControllerReady(controller)
      })
    }
  )
}

type SpotifyEmbedVariant = "inline" | "hidden"

interface SpotifyEmbedProps {
  variant?: SpotifyEmbedVariant
  /** Modo compacto: reproductor más chico; usa iframe directo para reproducción más estable */
  compact?: boolean
}

const EMBED_SRC =
  "https://open.spotify.com/embed/playlist/0xHgijmF1pw9h2EBBOfjQe?utm_source=generator&theme=0"

export function SpotifyEmbed({ variant = "inline", compact = false }: SpotifyEmbedProps) {
  const [useFallback, setUseFallback] = useState(false)
  const spotifyContext = useContext(SpotifyContext) as SpotifyContextValue | null
  const registerRef = useRef(spotifyContext?.registerController)
  registerRef.current = spotifyContext?.registerController

  const onControllerReady = (controller: SpotifyEmbedController) => {
    registerRef.current?.(controller as ContextSpotifyController)
  }

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      const container = document.getElementById(EMBED_CONTAINER_ID)
      if (container && !container.hasChildNodes()) {
        setUseFallback(true)
      }
    }, 2500)
    return () => clearTimeout(fallbackTimer)
  }, [])

  // Al montar: si la API ya estaba cargada (ej. volviste a la web), crear el embed
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.__SpotifyIFrameAPI) {
      createSpotifyEmbed(window.__SpotifyIFrameAPI, onControllerReady)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.onSpotifyIframeApiReady = (IFrameAPI: SpotifyIframeApi) => {
      window.__SpotifyIFrameAPI = IFrameAPI
      createSpotifyEmbed(IFrameAPI, onControllerReady)
    }
  }, [])

  const iframeHeight = compact ? 80 : 152
  const iframeWidth = compact ? "100%" : "50%"

  embedCompact = compact

  const embedContent = useFallback ? (
    <iframe
      data-testid="embed-iframe"
      style={{ borderRadius: "12px" }}
      src={EMBED_SRC}
      width={iframeWidth}
      height={iframeHeight}
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Spotify playlist"
    />
  ) : (
    <>
      <Script
        src={IFRAME_API_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => {
          if (window.__SpotifyIFrameAPI) {
            createSpotifyEmbed(window.__SpotifyIFrameAPI, onControllerReady)
          }
        }}
      />
      <div
        id={EMBED_CONTAINER_ID}
        className="w-full"
        style={{ borderRadius: "12px", overflow: "hidden", minHeight: compact ? 80 : 152 }}
        data-testid="embed-iframe"
      />
    </>
  )

  // Oculto: el reproductor sigue en el DOM para que el botón del header funcione, pero no se ve
  if (variant === "hidden") {
    return (
      <div
        className="fixed bottom-0 left-0 z-[-1] opacity-0 pointer-events-none overflow-hidden"
        style={{ width: 640, height: 152 }}
        aria-hidden
      >
        {embedContent}
      </div>
    )
  }

  return embedContent
}
