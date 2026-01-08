"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useMemo, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const safeImages = useMemo(() => {
    const filtered = (images || []).filter((img) => !!img?.url)
    return filtered.length
      ? filtered
      : ([{ id: "placeholder", url: "/product-placeholder.svg" }] as any)
  }, [images])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = safeImages[Math.min(selectedIndex, safeImages.length - 1)]

  return (
    <div className="flex flex-col gap-4">
      <Container className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle rounded-lg">
        <Image
          src={(selected as any)?.url}
          priority
          className="absolute inset-0"
          alt="Product image"
          fill
          sizes="(max-width: 576px) 92vw, (max-width: 1024px) 48vw, 640px"
          style={{ objectFit: "contain" }}
        />
      </Container>

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {safeImages.map((image: any, index: number) => {
            const active = index === selectedIndex
            return (
              <button
                key={image.id ?? index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={
                  "relative h-14 w-14 small:h-16 small:w-16 shrink-0 overflow-hidden rounded-md border-2 transition " +
                  (active
                    ? "border-ui-border-interactive ring-2 ring-ui-border-interactive ring-offset-1"
                    : "border-ui-border-base hover:border-ui-border-interactive")
                }
                aria-label={`Select image ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={`Product thumbnail ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
