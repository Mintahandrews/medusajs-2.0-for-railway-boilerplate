"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoomActive, setZoomActive] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const mainRef = useRef<HTMLDivElement>(null)

  const selected = safeImages[Math.min(selectedIndex, safeImages.length - 1)]

  const goNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % safeImages.length)
  }, [safeImages.length])

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }, [safeImages.length])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return
    const rect = mainRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxOpen, goNext, goPrev])

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image with hover zoom */}
        <Container
          ref={mainRef}
          className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle rounded-lg cursor-zoom-in group"
          onMouseEnter={() => setZoomActive(true)}
          onMouseLeave={() => setZoomActive(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={(selected as any)?.url}
            priority
            className="absolute inset-0 transition-transform duration-200"
            alt="Product image"
            fill
            sizes="(max-width: 576px) 92vw, (max-width: 1024px) 48vw, 640px"
            style={{
              objectFit: "contain",
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transform: zoomActive ? "scale(1.8)" : "scale(1)",
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxOpen(true)
            }}
            className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-grey-20 text-grey-60 opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand"
            aria-label="Open fullscreen"
          >
            <ZoomIn size={16} />
          </button>
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

      {/* Lightbox modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div
            className="relative max-h-[85vh] max-w-[85vw] aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={(selected as any)?.url}
              alt="Product image fullscreen"
              fill
              sizes="85vw"
              className="object-contain"
              priority
            />
          </div>

          {safeImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {safeImages.map((_: any, index: number) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(index) }}
                  className={`h-2 rounded-full transition-all ${
                    index === selectedIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ImageGallery
