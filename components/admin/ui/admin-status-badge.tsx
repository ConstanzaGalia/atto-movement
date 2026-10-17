import { cn } from "@/lib/utils"

const VARIANTS: Record<string, string> = {
  pending: "border-black text-black bg-surface-container-low",
  preparing: "border-black text-black bg-white",
  delivered: "border-black text-white bg-black",
  cancelled: "border-outline text-atto-secondary bg-surface-container-low",
  unpaid: "border-outline text-atto-secondary bg-surface-container-low",
  awaiting_transfer: "border-black text-black bg-surface-container-low",
  paid: "border-black text-white bg-black",
  refunded: "border-outline text-atto-secondary bg-white",
  on_account: "border-black text-black bg-white",
  active: "border-black text-white bg-black",
  inactive: "border-outline text-atto-secondary bg-surface-container-low",
  default: "border-outline-variant text-black bg-white",
}

type AdminStatusBadgeProps = {
  status: string
  label?: string
  className?: string
}

export function AdminStatusBadge({ status, label, className }: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-technical-micro uppercase tracking-wider",
        VARIANTS[status] ?? VARIANTS.default,
        className
      )}
    >
      {label ?? status.replaceAll("_", " ")}
    </span>
  )
}
