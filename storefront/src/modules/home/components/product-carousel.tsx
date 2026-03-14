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

/** Pixels-per-second for the continuous auto-glide */
const AUTO_SPEED = 30
/** Duration (ms) for arrow-button animated scroll */
const ARROW_DURATION = 500
/** Idle time (ms) before auto-scroll resumes after interaction */
const RESUME_DELAY = 3000

export default function ProductCarousel({ items, autoScroll = true }: { items: CarouselItem[]; autoScroll?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartPos = useRef(0)
  const interactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Animation state (refs to avoid re-renders in rAF loop)
  const pos = useRef(0)
  const raf = useRef<number | null>(null)
  const lastT = useRef<number | null>(null)
  const visible = useRef(true)
  const paused = useRef(false)
  const half = useRef(0)

  // Arrow animation
  const arrowAnim = useRef<{ from: number; to: number; start: number } | null>(null)

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

  // Duplicate items for seamless loop
  const loopItems = useMemo(() => [...displayItems, ...displayItems], [displayItems])

  // Measure track half-width for seamless loop reset
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) half.current = trackRef.current.scrollWidth / 2
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [loopItems.length])

  // Pause rAF when carousel scrolls out of viewport
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { visible.current = entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Apply GPU-accelerated transform (sub-pixel smooth)
  const apply = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-pos.current}px,0,0)`
    }
  }, [])

  // Ease-out cubic for arrow animations
  const ease = (t: number) => 1 - Math.pow(1 - t, 3)

  // Seamless loop wrap
  const wrap = useCallback(() => {
    const h = half.current
    if (h > 0) {
      if (pos.current >= h) pos.current -= h
      else if (pos.current < 0) pos.current += h
    }
  }, [])

  // Core animation frame — runs continuously
  const tick = useCallback(
    (now: number) => {
      if (lastT.current === null) lastT.current = now
      const dt = Math.min((now - lastT.current) / 1000, 0.1)
      lastT.current = now

      // Arrow animation takes priority
      if (arrowAnim.current) {
        const a = arrowAnim.current
        const p = Math.min((now - a.start) / ARROW_DURATION, 1)
        pos.current = a.from + (a.to - a.from) * ease(p)
        if (p >= 1) arrowAnim.current = null
      }
      // Auto-scroll when visible and not paused
      else if (visible.current && !paused.current && autoScroll) {
        pos.current += AUTO_SPEED * dt
      }

      wrap()
      apply()
      raf.current = requestAnimationFrame(tick)
    },
    [autoScroll, apply, wrap]
  )

  // Start / cleanup rAF
  useEffect(() => {
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [tick])

  // Clean up interaction timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimer.current) clearTimeout(interactionTimer.current)
    }
  }, [])

  // --- Pause auto-scroll on any user interaction, resume after idle ---
  const pauseAutoScroll = useCallback(() => {
    paused.current = true
    arrowAnim.current = null
    if (interactionTimer.current) clearTimeout(interactionTimer.current)
    interactionTimer.current = setTimeout(() => { paused.current = false }, RESUME_DELAY)
  }, [])

  // --- Mouse drag to scroll ---
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      dragStartX.current = e.clientX
      dragStartPos.current = pos.current
      pauseAutoScroll()
    },
    [pauseAutoScroll]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      pos.current = dragStartPos.current - (e.clientX - dragStartX.current)
    },
    [isDragging]
  )

  const handleMouseUpOrLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // --- Touch / wheel scrolling also pauses auto-scroll ---
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Convert vertical wheel to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        pos.current += e.deltaY
      }
      pauseAutoScroll()
    },
    [pauseAutoScroll]
  )

  const handleTouchStart = useCallback(() => {
    pauseAutoScroll()
  }, [pauseAutoScroll])

  // --- Arrow buttons ---
  const scrollByPx = useCallback(
    (px: number) => {
      pauseAutoScroll()
      arrowAnim.current = {
        from: pos.current,
        to: pos.current + px,
        start: performance.now(),
      }
    },
    [pauseAutoScroll]
  )

  const viewW = () => viewportRef.current?.clientWidth ?? 600

  return (
    <div className="relative">
      {/* Prev / Next buttons */}
      <button
        aria-label="Previous"
        onClick={() => scrollByPx(-(viewW() * 0.6))}
        className="flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-md text-grey-90 hover:bg-grey-50"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        aria-label="Next"
        onClick={() => scrollByPx(viewW() * 0.6)}
        className="flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-md text-grey-90 hover:bg-grey-50"
      >
        <ChevronRight size={18} />
      </button>
      <div
        ref={viewportRef}
        className="overflow-hidden"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
      >
        <div
          ref={trackRef}
          className="flex gap-4 pb-2"
          style={{ willChange: "transform" }}
        >
          {loopItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="group relative shrink-0 w-[240px] small:w-[250px] select-none"
            >
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
              <LocalizedClientLink
                href={item.href}
                draggable={false}
                onClick={(e?: React.MouseEvent<HTMLAnchorElement>) => {
                  // Prevent navigation when finishing a drag
                  if (isDragging) e?.preventDefault()
                }}
                className="block"
              >
                <div className="relative w-full overflow-hidden p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 aspect-[3/4]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="280px"
                    loading="lazy"
                    className="absolute inset-0 object-cover object-center pointer-events-none"
                    draggable={false}
                  />
                </div>

                <div className="flex items-center txt-compact-medium mt-4 justify-between gap-x-2">
                  <span className="text-ui-fg-subtle truncate min-w-0">
                    {item.title}
                  </span>
                  <span className="text-ui-fg-base font-semibold whitespace-nowrap shrink-0">
                    {item.price}
                  </span>
                </div>
              </LocalizedClientLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
