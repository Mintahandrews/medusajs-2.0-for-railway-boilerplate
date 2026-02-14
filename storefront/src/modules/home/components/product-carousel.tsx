"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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

const AUTO_SCROLL_SPEED = 0.5 // pixels per frame (~30px/s)

export default function ProductCarousel({ items, autoScroll = true }: { items: CarouselItem[]; autoScroll?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null)

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

  const rafRef = useRef<number | null>(null)
  const isVisible = useRef(true)

  // Pause rAF when carousel scrolls out of viewport
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const step = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    if (isVisible.current) {
      el.scrollLeft += AUTO_SCROLL_SPEED

      // If we've scrolled past the first set, jump back seamlessly
      const halfWidth = el.scrollWidth / 2
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth
      }
    }

    rafRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    if (!autoScroll) return

    const start = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(step)
    }
    const stop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    if (isUserInteracting) {
      stop()
    } else {
      start()
    }

    return stop
  }, [autoScroll, isUserInteracting, step])

  // Clean up interaction timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
    }
  }, [])

  // --- Pause auto-scroll on any user interaction, resume after 3s idle ---
  const pauseAutoScroll = useCallback(() => {
    setIsUserInteracting(true)
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
    interactionTimeout.current = setTimeout(() => {
      setIsUserInteracting(false)
    }, 3000)
  }, [])

  // --- Mouse drag to scroll ---
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const el = scrollRef.current
      if (!el) return
      setIsDragging(true)
      dragStartX.current = e.pageX - el.offsetLeft
      dragScrollLeft.current = el.scrollLeft
      pauseAutoScroll()
    },
    [pauseAutoScroll]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      const el = scrollRef.current
      if (!el) return
      const x = e.pageX - el.offsetLeft
      const walk = (x - dragStartX.current) * 1.2
      el.scrollLeft = dragScrollLeft.current - walk
    },
    [isDragging]
  )

  const handleMouseUpOrLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // --- Touch / wheel scrolling also pauses auto-scroll ---
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const el = scrollRef.current
      if (!el) return
      // Convert vertical wheel to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
      pauseAutoScroll()
    },
    [pauseAutoScroll]
  )

  const handleTouchStart = useCallback(() => {
    pauseAutoScroll()
  }, [pauseAutoScroll])

  // Duplicate items for seamless loop
  const loopItems = [...displayItems, ...displayItems]

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 pb-2 overflow-x-auto scrollbar-hide"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
      >
        {loopItems.map((item, idx) => (
          <LocalizedClientLink
            key={`${item.id}-${idx}`}
            href={item.href}
            draggable={false}
            onClick={(e?: React.MouseEvent<HTMLAnchorElement>) => {
              // Prevent navigation when finishing a drag
              if (isDragging) e?.preventDefault()
            }}
            className="group shrink-0 w-[240px] small:w-[250px] bg-grey-10 rounded-[16px] p-4 transition duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 block select-none"
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
                  loading="lazy"
                  className="object-contain scale-[1.12] pointer-events-none"
                  draggable={false}
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
