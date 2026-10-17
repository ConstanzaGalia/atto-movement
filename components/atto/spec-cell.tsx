import { cn } from "@/lib/utils"

type SpecCellProps = {
  label: string
  value: string
  hint?: string
  className?: string
}

export function SpecCell({ label, value, hint, className }: SpecCellProps) {
  return (
    <div className={cn("bg-surface-container-low p-3", className)}>
      <span className="font-technical-micro text-outline block">{label}</span>
      <span className="font-technical-data font-bold text-black block mt-1 uppercase">{value}</span>
      {hint && <span className="font-technical-micro text-atto-secondary">{hint}</span>}
    </div>
  )
}
