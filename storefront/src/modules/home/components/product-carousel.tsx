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

/** Auto-scroll interval in ms — comfortable reading pace */
const AUTO_SCROLL_INTERVAL = 5000
/** How many pixels to scroll per auto-tick */
const CARD_WIDTH = 268 // 250px card + 16px gap + 2px buffer

export default function ProductCarousel({ items, autoScroll = true }: { items: CarouselItem[]; autoScroll?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  const displayItems = normalized.slice(0, 8)

  /* ---- scroll state tracking ---- */
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  /* ---- auto-scroll logic ---- */
  const startAutoScroll = useCallback(() => {
    if (!autoScroll) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      // If we've reached the end, loop back to start
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: CARD_WIDTH, behavior: "smooth" })
      }
    }, AUTO_SCROLL_INTERVAL)
  }, [autoScroll])

  const stopAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /* Restart auto-scroll after user interaction pause */
  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseAutoScroll = useCallback(() => {
    stopAutoScroll()
    if (pauseRef.current) clearTimeout(pauseRef.current)
    pauseRef.current = setTimeout(() => startAutoScroll(), 8000)
  }, [stopAutoScroll, startAutoScroll])

  useEffect(() => {
    startAutoScroll()
    return () => {
      stopAutoScroll()
      if (pauseRef.current) clearTimeout(pauseRef.current)
    }
  }, [startAutoScroll, stopAutoScroll])

  /* ---- manual navigation ---- */
  const scrollPrev = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -CARD_WIDTH, behavior: "smooth" })
    pauseAutoScroll()
  }, [pauseAutoScroll])

  const scrollNext = useCallback(() => {
    scrollRef.current?.scrollBy({ left: CARD_WIDTH, behavior: "smooth" })
    pauseAutoScroll()
  }, [pauseAutoScroll])

  return (
    <div
      className="relative group"
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                     bg-white/90 shadow-lg border border-gray-200 flex items-center justify-center
                     text-gray-700 hover:bg-white hover:scale-105 transition-all
                     opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-2"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                     bg-white/90 shadow-lg border border-gray-200 flex items-center justify-center
                     text-gray-700 hover:bg-white hover:scale-105 transition-all
                     opacity-0 group-hover:opacity-100 translate-x-1 group-hover:-translate-x-2"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onTouchStart={pauseAutoScroll}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {displayItems.map((item, idx) => (
          <LocalizedClientLink
            key={`${item.id}-${idx}`}
            href={item.href}
            className="group/card snap-start shrink-0 w-[240px] small:w-[250px] bg-grey-10 rounded-[16px] p-4 transition duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 block"
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
