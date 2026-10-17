import Image from "next/image"
import { AttoEyebrow } from "@/components/atto/atto-eyebrow"
import { cn } from "@/lib/utils"

type AttoAuthShellProps = {
  eyebrow: string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  wide?: boolean
}

export function AttoAuthShell({
  eyebrow,
  title,
  description,
  children,
  className,
  wide,
}: AttoAuthShellProps) {
  return (
    <div className="flex w-full justify-center bg-surface px-4 py-10 md:py-14">
      <div
        className={cn(
          "w-full border border-outline-variant bg-white p-6 md:p-8 space-y-6",
          wide ? "max-w-md" : "max-w-md",
          className
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/icon-atto.png" alt="Atto" width={56} height={56} className="object-contain" />
          <AttoEyebrow>
            <span className="size-1.5 bg-black" />
            <span>{eyebrow}</span>
          </AttoEyebrow>
          <h1 className="font-display text-headline-sm font-bold uppercase tracking-tight text-black">
            {title}
          </h1>
          {description ? (
            <p className="font-technical-data text-atto-secondary max-w-sm">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  )
}

export const attoAuthFieldClass =
  "rounded-none border-outline-variant bg-surface-container-low font-technical-data"

export const attoAuthLabelClass =
  "font-technical-micro text-atto-secondary uppercase block mb-1.5"

export const attoAuthPrimaryBtnClass =
  "w-full border border-black bg-black px-4 py-3 font-label-caps text-white hover:bg-transparent hover:text-black transition-colors disabled:opacity-50"

export const attoAuthSecondaryBtnClass =
  "w-full border border-black bg-white px-4 py-3 font-label-caps text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
