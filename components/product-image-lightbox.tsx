"use client"

import React from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

type ProductImageLightboxProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  alt: string
}

export function ProductImageLightbox({
  open,
  onOpenChange,
  imageUrl,
  alt,
}: ProductImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto border-none bg-transparent p-0 shadow-none overflow-visible"
        showCloseButton={true}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div
          className="relative flex items-center justify-center max-h-[90vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={imageUrl}
            alt={alt}
            width={1200}
            height={1200}
            className="object-contain max-h-[90vh] w-auto max-w-[90vw] rounded-lg"
            sizes="90vw"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
