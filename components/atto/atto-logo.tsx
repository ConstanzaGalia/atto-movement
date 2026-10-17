import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

type AttoLogoProps = {
  className?: string
  showBadge?: boolean
  href?: string
  /** "dark" = wordmark negro (header claro). "mark" = icono blanco sobre negro. */
  variant?: "dark" | "mark"
}

export function AttoLogo({
  className,
  showBadge = true,
  href = "/",
  variant = "dark",
}: AttoLogoProps) {
  const src = variant === "mark" ? "/icon-atto.png" : "/logo-atto.png"

  const content = (
    <span className={cn("flex items-center gap-3 group", className)}>
      <Image
        src={src}
        alt="Atto"
        width={variant === "mark" ? 48 : 584}
        height={variant === "mark" ? 48 : 236}
        className={cn(
          "object-contain object-left transition-transform group-hover:scale-105",
          variant === "mark" ? "h-7 w-7" : "h-7 sm:h-8 w-auto"
        )}
        priority
      />
      {showBadge && (
        <span className="hidden sm:inline-block font-technical-micro px-2 py-0.5 border border-outline-variant text-atto-secondary">
          LABS 24
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
