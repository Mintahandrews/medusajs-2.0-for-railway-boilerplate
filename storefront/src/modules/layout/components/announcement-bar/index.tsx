"use client"

import { useEffect, useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const MESSAGES = [
  "Free delivery on orders over GH\u20B5200",
  "Pay with MTN MoMo & Vodafone Cash",
  "WhatsApp support: +233 540 451 001",
  "100% Authentic Products \u2022 Fast Delivery Across Ghana",
]

const CYCLE_MS = 4000

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, CYCLE_MS)
    return () => clearInterval(id)
  }, [dismissed])

  if (dismissed) return null

  return (
    <div className="relative z-[60] bg-brand text-white text-[13px] font-medium select-none">
      <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center px-10">
        <button
          type="button"
          onClick={() =>
            setIndex((prev) => (prev - 1 + MESSAGES.length) % MESSAGES.length)
          }
          className="absolute left-3 small:left-5 p-1 text-white/70 hover:text-white transition"
          aria-label="Previous message"
        >
          <ChevronLeft size={14} />
        </button>

        <span
          key={index}
          className="animate-fade-in-top text-center leading-tight px-8 truncate"
        >
          {MESSAGES[index]}
        </span>

        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % MESSAGES.length)}
          className="absolute right-10 small:right-14 p-1 text-white/70 hover:text-white transition"
          aria-label="Next message"
        >
          <ChevronRight size={14} />
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-3 small:right-5 p-1 text-white/70 hover:text-white transition"
          aria-label="Dismiss announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
