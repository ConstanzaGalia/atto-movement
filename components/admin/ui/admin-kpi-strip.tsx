import { SpecCell } from "@/components/atto/spec-cell"
import { cn } from "@/lib/utils"

export type AdminKpi = {
  label: string
  value: string
  hint?: string
}

type AdminKpiStripProps = {
  items: AdminKpi[]
  className?: string
}

export function AdminKpiStrip({ items, className }: AdminKpiStripProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant", className)}>
      {items.map((item) => (
        <SpecCell key={item.label} label={item.label} value={item.value} hint={item.hint} className="bg-surface" />
      ))}
    </div>
  )
}
