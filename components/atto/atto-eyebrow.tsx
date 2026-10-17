import { cn } from "@/lib/utils"

type AttoEyebrowProps = {
  children: React.ReactNode
  className?: string
}

export function AttoEyebrow({ children, className }: AttoEyebrowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-technical-data uppercase text-atto-secondary",
        className
      )}
    >
      {children}
    </div>
  )
}
