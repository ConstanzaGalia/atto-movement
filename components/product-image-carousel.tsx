"use client"

import React, { useEffect, useCallback } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { ProductImageLightbox } from "@/components/product-image-lightbox"
import { ZoomIn } from "lucide-react"

type Variant = {
  id: string
  color: string
  stock: number
  image_url: string | null
}

type Product = {
  id: string
  name: string
  image_url: string | null
}

type ExtraImage = {
  id: string
  image_url: string
  display_order: number
}

export function ProductImageCarousel({
  product,
  variants,
  extraImages = [],
  selectedVariantId,
  onVariantChange,
}: {
  product: Product
  variants: Variant[]
  extraImages?: ExtraImage[]
  selectedVariantId: string | null
  onVariantChange?: (variantId: string | null) => void
}) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)
  const [lightboxImage, setLightboxImage] = React.useState<{ url: string; alt: string } | null>(null)

  // Prepare images array: main image + extra images (product_images) + variant images
  const images = React.useMemo(() => {
    const imageList: Array<{ url: string; color?: string; variantId?: string }> = []

    if (product.image_url) {
      imageList.push({ url: product.image_url })
    }

    const sortedExtra = [...extraImages].sort((a, b) => a.display_order - b.display_order)
    for (const img of sortedExtra) {
      if (img.image_url && !imageList.some((i) => i.url === img.image_url)) {
        imageList.push({ url: img.image_url })
      }
    }

    variants.forEach((variant) => {
      if (variant.image_url && !imageList.some((img) => img.url === variant.image_url)) {
        imageList.push({
          url: variant.image_url,
          color: variant.color,
          variantId: variant.id,
        })
      }
    })

    return imageList
  }, [product.image_url, extraImages, variants])

  // Sync carousel with selected variant
  useEffect(() => {
    if (!api || !selectedVariantId) return

    const variantIndex = images.findIndex((img) => img.variantId === selectedVariantId)
    if (variantIndex !== -1) {
      const currentIndex = api.selectedScrollSnap()
      if (variantIndex !== currentIndex) {
        api.scrollTo(variantIndex)
      }
    }
  }, [selectedVariantId, api, images])

  // Update current index when carousel changes
  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return
    const selectedIndex = api.selectedScrollSnap()
    setCurrent(selectedIndex)

    // If the selected image has a variantId, notify parent
    const selectedImage = images[selectedIndex]
    if (selectedImage?.variantId && onVariantChange) {
      onVariantChange(selectedImage.variantId)
    } else if (!selectedImage?.variantId && onVariantChange) {
      // If we're on the base product image and there are variants, don't clear selection
      // Only clear if user explicitly navigates to base image when no variants match
      // For now, keep the current selection
    }
  }, [images, onVariantChange])

  useEffect(() => {
    if (!api) return

    onSelect(api)
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  const openLightbox = (url: string, alt: string) => {
    setLightboxImage({ url, alt })
    setLightboxOpen(true)
  }

  // If no variants with images, show single image
  if (images.length <= 1) {
    const src = images[0]?.url || product.image_url || "/placeholder.svg"
    return (
      <>
        <button
          type="button"
          className="group aspect-square relative bg-muted rounded-lg overflow-hidden w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => openLightbox(src, product.name)}
          aria-label="Ver imagen completa"
        >
          <Image
            src={src}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="flex flex-col items-center gap-1 text-white">
              <ZoomIn className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
              <span className="text-xs font-medium md:text-sm">Ver imagen completa</span>
            </span>
          </span>
        </button>
        {lightboxImage && (
          <ProductImageLightbox
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            imageUrl={lightboxImage.url}
            alt={lightboxImage.alt}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="w-full">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {images.map((image, index) => {
              const src = image.url || "/placeholder.svg"
              const altText = image.color ? `${product.name} - ${image.color}` : product.name
              return (
                <CarouselItem key={index}>
                  <button
                    type="button"
                    className="group aspect-square relative bg-muted rounded-lg overflow-hidden w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => openLightbox(src, altText)}
                    aria-label="Ver imagen completa"
                  >
                    <Image
                      src={src}
                      alt={altText}
                      fill
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="flex flex-col items-center gap-1 text-white">
                        <ZoomIn className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
                        <span className="text-xs font-medium md:text-sm">Ver imagen completa</span>
                      </span>
                    </span>
                  </button>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious className="left-2 md:left-4" />
          <CarouselNext className="right-2 md:right-4" />
        </Carousel>
      </div>
      {lightboxImage && (
        <ProductImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          imageUrl={lightboxImage.url}
          alt={lightboxImage.alt}
        />
      )}
    </>
  )
}

