import { cn } from "@/lib/utils"

type AttoTelemetryBarProps = {
  left: React.ReactNode
  right?: React.ReactNode
  className?: string
  pulse?: boolean
}

export function AttoTelemetryBar({
  left,
  right,
  className,
  pulse = true,
}: AttoTelemetryBarProps) {
  return (
    <section
      className={cn(
        "w-full bg-surface-container-low border-b border-surface-container-high py-2.5 px-atto",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-atto-secondary font-technical-micro">
        <div className="flex items-center gap-2">
          {pulse && <span className="inline-block w-2 h-2 bg-black animate-pulse" />}
          <span className="tracking-widest font-semibold text-black">{left}</span>
        </div>
        {right && <div className="flex items-center gap-6">{right}</div>}
      </div>
    </section>
  )
}
