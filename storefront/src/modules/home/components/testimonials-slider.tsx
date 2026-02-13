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

/** Auto-scroll interval in ms */
const AUTO_SCROLL_INTERVAL = 6000
const CARD_WIDTH = 464 // 440px card + 24px gap (desktop)

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  /* ---- scroll state tracking ---- */
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  /* ---- auto-scroll logic ---- */
  const startAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: CARD_WIDTH, behavior: "smooth" })
      }
    }, AUTO_SCROLL_INTERVAL)
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseAutoScroll = useCallback(() => {
    stopAutoScroll()
    if (pauseRef.current) clearTimeout(pauseRef.current)
    pauseRef.current = setTimeout(() => startAutoScroll(), 10000)
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
    <div className="py-16 small:py-20 border-t border-grey-20">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="flex flex-col small:flex-row items-start justify-between gap-8 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[12px] font-semibold uppercase tracking-wider mb-4">
              Customer Reviews
            </span>
            <h2 className="text-[28px] small:text-[32px] font-bold text-grey-90 max-w-[520px]">
              What Our Customers
              <br />
              Are Saying
            </h2>
          </div>
          <div className="flex flex-col items-start small:items-end gap-3">
            <p className="hidden small:block text-[13px] text-grey-50 max-w-[260px] leading-relaxed text-right">
              Real and heartfelt experiences from our cherished customers who trust
              and rely on us
            </p>
            {/* Google Business Reviews Link */}
            <a
              href="https://g.page/r/CYX94oQecG8MEAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-grey-20 text-[13px] font-medium text-grey-90 hover:border-brand hover:text-brand transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>See All Reviews on Google</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div
          className="relative group max-w-[1200px] mx-auto"
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

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            onTouchStart={pauseAutoScroll}
            className="flex gap-6 small:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {items.map((item, idx) => (
              <div key={idx} className="snap-start w-[340px] small:w-[440px] shrink-0">
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
    <div className="relative rounded-[16px] border border-grey-20 bg-grey-5 p-8 h-full transition duration-300 hover:shadow-md">
      <div className="absolute right-8 top-8 flex items-center gap-1 text-grey-30">
        <Quote size={20} />
        <Quote size={20} />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[16px] font-bold shrink-0">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <div className="text-[16px] font-semibold text-grey-90">
              {item.name}
            </div>
            {item.verified ? (
              <BadgeCheck size={16} className="text-brand" />
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[12px] text-grey-50">{item.timeAgo}</div>
            <span className="text-[10px] text-grey-30">via Google</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-yellow-400 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < item.rating ? "currentColor" : "none"}
            className={i < item.rating ? "text-yellow-400" : "text-grey-20"}
          />
        ))}
      </div>
      <p className="text-[15px] leading-[1.7] text-grey-60">
        {item.text}
      </p>
    </div>
  )
}
