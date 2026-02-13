"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistButton from "@modules/common/components/wishlist-button"

type CarouselItem =
  | {
    id: string
    title: string
    href: string
    image: string
    price: string
  }
  | {
    title: string
    image: string
    price: string
  }

export default function ProductCarousel({ items, autoScroll = true }: { items: CarouselItem[]; autoScroll?: boolean }) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [paused, setPaused] = useState(false)

  const normalized = useMemo(() => {
    return items.map((item, idx) => {
      if ("id" in item) return item
      return {
        id: `placeholder-${idx}`,
        title: item.title,
        href: "/store",
        image: item.image,
        price: item.price,
      }
    })
  }, [items])

  const scrollByCards = useCallback((direction: "left" | "right") => {
    const viewport = viewportRef.current
    if (!viewport) return
    const width = viewport.clientWidth
    viewport.scrollBy({
      left: direction === "left" ? -width : width,
      behavior: "smooth",
    })
  }, [])

  // Auto-scroll: scroll right by one card width every 3s, loop back at end
  useEffect(() => {
    if (!autoScroll || paused) return
    const id = setInterval(() => {
      const vp = viewportRef.current
      if (!vp) return
      const atEnd = vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 4
      if (atEnd) {
        vp.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        vp.scrollBy({ left: 260, behavior: "smooth" })
      }
    }, 3000)
    return () => clearInterval(id)
  }, [autoScroll, paused])

  return (
    <div className="relative">
      <button
        type="button"
        className="hidden small:flex absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-brand text-white hover:bg-brand-dark transition duration-300 shadow-md z-10 items-center justify-center"
        aria-label="Previous"
        onClick={() => scrollByCards("left")}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        className="hidden small:flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-brand text-white hover:bg-brand-dark transition duration-300 shadow-md z-10 items-center justify-center"
        aria-label="Next"
        onClick={() => scrollByCards("right")}
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={viewportRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2"
      >
        {normalized.slice(0, 8).map((item) => (
          <LocalizedClientLink
            key={item.id}
            href={item.href}
            className="group snap-start shrink-0 w-[240px] small:w-[250px] bg-grey-10 rounded-[16px] p-4 transition duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 block"
          >
            <div className="relative bg-white rounded-[14px] overflow-hidden mb-4">
              <div className="absolute right-3 top-3 z-10">
                <WishlistButton
                  item={{
                    id: item.id,
                    handle: item.href.replace("/products/", ""),
                    title: item.title,
                    image: item.image,
                    price: item.price,
                  }}
                />
              </div>
              <div className="relative aspect-square w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="280px"
                  className="object-contain scale-[1.12]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-[15px] font-medium text-grey-90 line-clamp-2 min-h-[46px]">
                {item.title}
              </div>
              <div className="text-[18px] font-semibold text-grey-90">
                {item.price}
              </div>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
