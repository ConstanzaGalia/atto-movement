import { cn } from "@/lib/utils"

type AdminDataTableProps = {
  children: React.ReactNode
  className?: string
}

export function AdminDataTable({ children, className }: AdminDataTableProps) {
  return (
    <div className={cn("border border-outline-variant bg-white overflow-x-auto", className)}>
      <table className="w-full text-left border-collapse min-w-[640px]">{children}</table>
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
