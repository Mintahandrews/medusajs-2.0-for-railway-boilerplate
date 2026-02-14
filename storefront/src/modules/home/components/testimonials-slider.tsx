"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Quote,
  Star,
} from "lucide-react"

type Testimonial = {
  name: string
  rating: number
  text: string
  timeAgo: string
  verified?: boolean
}

/**
 * px per rAF frame at ~60 fps -> ~30 px/s.
 * Matches the best-seller product carousel speed.
 */
const AUTO_SCROLL_SPEED = 0.5
/** ms before auto-scroll resumes after user interaction */
const RESUME_DELAY = 4000

export default function TestimonialsSlider() {
  const items = useMemo<Testimonial[]>(
    () => [
      {
        name: "RAC LUXURY PERFUMES",
        rating: 5,
        text: "All kinds of quality phone accessories, can be found here. Great customer service.",
        timeAgo: "6 weeks ago",
        verified: true,
      },
      {
        name: "Samuel Kumi Mensah",
        rating: 5,
        text: "Great experience shopping at LetsCase Gh. Excellent products and reliable service. Highly recommended!",
        timeAgo: "35 weeks ago",
        verified: true,
      },
      {
        name: "Baba Karim Abdulai",
        rating: 5,
        text: "I had a faulty mouse and needed to get new one asap. I reached out to LetsCase Gh and in no time, I was sorted out. Customer Service was a topnotch, quick response and fast in delivery.",
        timeAgo: "43 weeks ago",
        verified: true,
      },
    ],
    []
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* -- active dot tracking -- */
  const [activeIdx, setActiveIdx] = useState(0)

  const updateActiveCard = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const cardWidth = card ? card.offsetWidth + 20 : 340
    const idx = Math.round(el.scrollLeft / cardWidth)
    setActiveIdx(idx % items.length)
  }, [items.length])

  /* -- auto-scroll with rAF (matches product carousel) -- */
  const isVisible = useRef(true)

  // Pause rAF when slider scrolls out of viewport
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

      // seamless loop: once past the duplicated set, jump back
      const half = el.scrollWidth / 2
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half
      }

      updateActiveCard()
    }

    rafRef.current = requestAnimationFrame(step)
  }, [updateActiveCard])

  useEffect(() => {
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
  }, [isUserInteracting, step])

  // Clean up interaction timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
    }
  }, [])

  /* -- pause / resume helpers -- */
  const pauseAutoScroll = useCallback(() => {
    setIsUserInteracting(true)
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current)
    interactionTimeout.current = setTimeout(() => {
      setIsUserInteracting(false)
    }, RESUME_DELAY)
  }, [])

  /* -- mouse drag to scroll (matches product carousel) -- */
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

  /* -- wheel to horizontal scroll (matches product carousel) -- */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const el = scrollRef.current
      if (!el) return
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

  /* -- arrow navigation -- */
  const scrollBy = useCallback(
    (dir: 1 | -1) => {
      const el = scrollRef.current
      if (!el) return
      const card = el.firstElementChild as HTMLElement | null
      const cardWidth = card ? card.offsetWidth + 20 : 340
      pauseAutoScroll()
      el.scrollBy({ left: dir * cardWidth, behavior: "smooth" })
    },
    [pauseAutoScroll]
  )

  /* -- dot navigation -- */
  const scrollToCard = useCallback(
    (idx: number) => {
      const el = scrollRef.current
      if (!el) return
      const card = el.firstElementChild as HTMLElement | null
      const cardWidth = card ? card.offsetWidth + 20 : 340
      pauseAutoScroll()
      el.scrollTo({ left: idx * cardWidth, behavior: "smooth" })
    },
    [pauseAutoScroll]
  )

  // Duplicate items for seamless infinite auto-scroll
  const loopItems = [...items, ...items]

  return (
    <section className="py-12 small:py-20 border-t border-grey-20">
      <div className="mx-auto max-w-[1440px] px-4 small:px-10">
        {/* -- Header -- */}
        <div className="flex flex-col small:flex-row items-start justify-between gap-4 small:gap-8 mb-8 small:mb-12">
          <div>
            <span className="inline-block px-3 py-1 small:px-4 small:py-1.5 rounded-full bg-brand/10 text-brand text-[11px] small:text-[12px] font-semibold uppercase tracking-wider mb-3 small:mb-4">
              Customer Reviews
            </span>
            <h2 className="text-[22px] small:text-[32px] font-bold text-grey-90 leading-tight max-w-[520px]">
              What Our Customers Are Saying
            </h2>
          </div>

          <div className="flex flex-col items-start small:items-end gap-2 small:gap-3">
            <p className="hidden small:block text-[13px] text-grey-50 max-w-[260px] leading-relaxed text-right">
              Real and heartfelt experiences from our cherished customers who
              trust and rely on us
            </p>
            <a
              href="https://g.page/r/CYX94oQecG8MEAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 small:px-4 small:py-2 rounded-full bg-white border border-grey-20 text-[12px] small:text-[13px] font-medium text-grey-90 hover:border-brand hover:text-brand transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 small:h-4 small:w-4"
                fill="currentColor"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="hidden xsmall:inline">
                See All Reviews on Google
              </span>
              <span className="xsmall:hidden">Google Reviews</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* -- Cards slider -- */}
        <div className="relative group">
          {/* Left / Right arrows visible on desktop hover */}
          <button
            type="button"
            aria-label="Previous review"
            onClick={() => scrollBy(-1)}
            className="hidden small:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-grey-20 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:border-brand hover:text-brand"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next review"
            onClick={() => scrollBy(1)}
            className="hidden small:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-grey-20 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:border-brand hover:text-brand"
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 small:gap-6 overflow-x-auto no-scrollbar"
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
            onScroll={updateActiveCard}
          >
            {loopItems.map((item, idx) => (
              <div
                key={idx}
                className="w-[85vw] max-w-[340px] small:w-[420px] small:max-w-none shrink-0 select-none"
              >
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* -- Dot indicators -- */}
        <div className="flex items-center justify-center gap-2 mt-6 small:mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to review ${i + 1}`}
              onClick={() => scrollToCard(i)}
              className={`rounded-full transition-all duration-300 ${
                activeIdx === i
                  ? "w-6 h-2 bg-brand"
                  : "w-2 h-2 bg-grey-30 hover:bg-grey-50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ item }: { item: Testimonial }) {
  const initials = item.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative rounded-2xl border border-grey-20 bg-grey-5 p-5 small:p-8 h-full transition duration-300 hover:shadow-md select-none">
      <div className="absolute right-5 small:right-8 top-5 small:top-8 flex items-center gap-1 text-grey-30">
        <Quote size={18} className="small:hidden" />
        <Quote size={18} className="small:hidden" />
        <Quote size={20} className="hidden small:block" />
        <Quote size={20} className="hidden small:block" />
      </div>

      <div className="flex items-center gap-3 small:gap-4 mb-4 small:mb-6">
        <div className="h-10 w-10 small:h-12 small:w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[14px] small:text-[16px] font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-[14px] small:text-[16px] font-semibold text-grey-90 truncate">
              {item.name}
            </div>
            {item.verified && (
              <BadgeCheck size={15} className="text-brand shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] small:text-[12px] text-grey-50">
              {item.timeAgo}
            </span>
            <span className="text-[9px] small:text-[10px] text-grey-30">
              via Google
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 mb-3 small:mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < item.rating ? "currentColor" : "none"}
            className={
              i < item.rating ? "text-yellow-400" : "text-grey-20"
            }
          />
        ))}
      </div>

      <p className="text-[13px] small:text-[15px] leading-[1.7] text-grey-60">
        {item.text}
      </p>
    </div>
  )
}