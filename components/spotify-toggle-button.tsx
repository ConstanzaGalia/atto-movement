"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useSpotify } from "@/contexts/spotify-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SpotifyToggleButtonProps {
  className?: string
}

export function SpotifyToggleButton({ className }: SpotifyToggleButtonProps) {
  const { isPlaying, isReady, togglePlay } = useSpotify()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
      title={isPlaying ? "Pausar música" : "Reproducir música"}
      onClick={togglePlay}
      disabled={!isReady}
      className={cn(
        "rounded-full bg-white/20 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm border border-white/30 size-12",
        !isReady && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {isPlaying ? (
        <Volume2 className="size-6" aria-hidden />
      ) : (
        <VolumeX className="size-6" aria-hidden />
      )}
    </Button>
  )
}
