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
    <div className="flex flex-col small:flex-row gap-4 small:gap-6">
      <div className="order-2 small:order-1 flex small:flex-col gap-3 overflow-x-auto small:overflow-visible no-scrollbar">
        {safeImages.map((image: any, index: number) => {
          const active = index === selectedIndex
          return (
            <button
              key={image.id ?? index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-rounded border transition " +
                (active
                  ? "border-ui-border-interactive"
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

      <Container className="order-1 small:order-2 relative aspect-square w-full overflow-hidden bg-ui-bg-subtle">
        <Image
          src={(selected as any)?.url}
          priority
          className="absolute inset-0 z-0"
          alt="Product image"
          fill
          sizes="(max-width: 576px) 92vw, (max-width: 1024px) 48vw, 640px"
          style={{ objectFit: "contain" }}
        />
      </Container>
    </div>
  )
}

export default ImageGallery
