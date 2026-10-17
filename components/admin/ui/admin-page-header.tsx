import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
import { cn } from "@/lib/utils"

type AdminPageHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function AdminPageHeader({ eyebrow, title, description, action, className }: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-outline-variant pb-4", className)}>
      <div className="space-y-2">
        <AttoEyebrow>
          <span className="size-1.5 bg-black" />
          <span>{eyebrow}</span>
        </AttoEyebrow>
        <h2 className="font-display text-headline-sm md:text-headline-md font-bold uppercase tracking-tight text-black">
          {title}
        </h2>
        {description ? (
          <p className="font-technical-data text-atto-secondary max-w-xl">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  )
}
