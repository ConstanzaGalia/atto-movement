"use client"

import { ChevronDown } from "lucide-react"

export function ScrollArrow({ targetId }: { targetId: string }) {
  const handleScroll = () => {
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <button
      onClick={handleScroll}
      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 text-white hover:text-white/80 transition-colors animate-bounce"
      aria-label="Scroll to next section"
    >
      <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
    </button>
  )
}
