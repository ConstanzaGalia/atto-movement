"use client"

import {
  createContext,
  useCallback,
  useRef,
  useContext,
  useState,
  type ReactNode,
} from "react"

export interface SpotifyEmbedController {
  addListener: (event: string, callback: (e?: { data?: { isPaused?: boolean } }) => void) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
}

export interface SpotifyContextValue {
  isPlaying: boolean
  isReady: boolean
  registerController: (controller: SpotifyEmbedController) => void
  togglePlay: () => void
}

export const SpotifyContext = createContext<SpotifyContextValue | null>(null)

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [controller, setController] = useState<SpotifyEmbedController | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const registeredRef = useRef(false)

  const registerController = useCallback((c: SpotifyEmbedController) => {
    if (registeredRef.current) return
    registeredRef.current = true
    setController(c)
    c.addListener("playback_update", (e) => {
      setIsPlaying(!e.data?.isPaused)
    })
    c.play()
  }, [])

  const togglePlay = useCallback(() => {
    if (controller) controller.togglePlay()
  }, [controller])

  const value: SpotifyContextValue = {
    isPlaying,
    isReady: !!controller,
    registerController,
    togglePlay,
  }

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  )
}

export function useSpotify() {
  const ctx = useContext(SpotifyContext)
  if (!ctx) throw new Error("useSpotify must be used within SpotifyProvider")
  return ctx
}
