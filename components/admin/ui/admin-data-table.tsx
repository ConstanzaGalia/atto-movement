import { cn } from "@/lib/utils"

type AdminDataTableProps = {
  children: React.ReactNode
  className?: string
  /** Sin ancho mínimo forzado — útil para tablas de pocas columnas en mobile */
  compact?: boolean
  /** Oculta la tabla en mobile (usar junto a un listado en cards) */
  desktopOnly?: boolean
}

export function AdminDataTable({
  children,
  className,
  compact = false,
  desktopOnly = false,
}: AdminDataTableProps) {
  return (
    <div
      className={cn(
        "border border-outline-variant bg-white overflow-x-auto",
        desktopOnly && "hidden md:block",
        className
      )}
    >
      <table
        className={cn(
          "w-full text-left border-collapse",
          compact ? "min-w-0" : "min-w-[560px]"
        )}
      >
        {children}
      </table>
    </div>
  )
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-surface-container-low border-b border-outline-variant">
      <tr>{children}</tr>
    </thead>
  )
}

export function AdminTh({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-3 py-2.5 font-technical-micro text-outline uppercase tracking-wider font-normal", className)}>
      {children}
    </th>
  )
}

export function AdminTd({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-3 py-3 font-technical-data text-black border-t border-outline-variant/60 align-middle", className)}>
      {children}
    </td>
  )
}
