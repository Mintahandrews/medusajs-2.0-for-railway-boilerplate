"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

const WHATSAPP_NUMBER = "233540451001"
const WHATSAPP_MESSAGE = "Hi Letscase! I have a question about your products."

type FloatingPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left"

const POSITION_CLASSES: Record<FloatingPosition, string> = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
}

const POSITION_PRIORITY: FloatingPosition[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
]

const isElementVisible = (node: HTMLElement) => {
  const style = window.getComputedStyle(node)
  if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) {
    return false
  }
  const rect = node.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

const parsePositions = (value?: string | null): FloatingPosition[] => {
  if (!value) return []
  return value
    .split(",")
    .map((token) => token.trim())
    .filter((token): token is FloatingPosition => (POSITION_PRIORITY as string[]).includes(token))
}

export default function WhatsAppWidget() {
  const pathname = usePathname()
  const [position, setPosition] = useState<FloatingPosition>("bottom-right")
  const rafRef = useRef<number | null>(null)

  // Hide on checkout, customizer, account, admin, and cart pages
  const excludedPaths = [
    "/checkout",
    "/customizer", 
    "/account",
    "/admin",
    "/cart",
    "/order",
    "/reset-password",
    "/login",
    "/register"
  ]
  
  const shouldHide = excludedPaths.some(path => pathname?.includes(path))
  if (shouldHide) return null

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  const evaluatePosition = useCallback(() => {
    if (typeof window === "undefined") return

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = window.requestAnimationFrame(() => {
      const blockers = Array.from(
        document.querySelectorAll<HTMLElement>("[data-whatsapp-obstruction]")
      )

      const occupied = new Set<FloatingPosition>()

      blockers.forEach((node) => {
        if (!isElementVisible(node)) return
        parsePositions(node.dataset.whatsappObstruction).forEach((pos) => {
          occupied.add(pos)
        })
      })

      const nextPosition = POSITION_PRIORITY.find((candidate) => !occupied.has(candidate))
        || "bottom-right"

      setPosition((prev) => (prev === nextPosition ? prev : nextPosition))
    })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    evaluatePosition()

    const handleResize = () => evaluatePosition()
    window.addEventListener("resize", handleResize)

    const observer = new MutationObserver(() => evaluatePosition())
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [evaluatePosition, pathname])

  const tooltipOnLeftSide = position.includes("left")
  const tooltipBaseClass = tooltipOnLeftSide
    ? "left-[calc(100%+12px)]"
    : "right-[calc(100%+12px)]"
  const tooltipArrowClass = tooltipOnLeftSide
    ? "left-[-4px] border-r-grey-90"
    : "right-[-4px] border-l-grey-90"

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`fixed ${POSITION_CLASSES[position]} z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:shadow-xl animate-bounce-once group`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M16.004 2.667A13.26 13.26 0 0 0 2.76 15.893a13.16 13.16 0 0 0 1.795 6.63L2.667 29.333l7.04-1.846a13.3 13.3 0 0 0 6.28 1.6h.006A13.27 13.27 0 0 0 16.004 2.667Zm0 24.266a11.01 11.01 0 0 1-5.612-1.536l-.403-.239-4.176 1.095 1.115-4.074-.263-.418a10.97 10.97 0 0 1-1.685-5.854 11.01 11.01 0 0 1 22.02-.013 11.02 11.02 0 0 1-10.996 11.04Zm6.035-8.242c-.331-.166-1.96-.967-2.264-1.078-.304-.11-.525-.166-.746.166s-.856 1.078-1.05 1.3c-.193.22-.386.248-.717.083a9.04 9.04 0 0 1-2.66-1.64 9.98 9.98 0 0 1-1.84-2.29c-.193-.332-.02-.51.145-.675.148-.149.331-.387.497-.58.166-.194.221-.332.331-.553.111-.222.056-.415-.028-.58-.083-.166-.745-1.798-1.022-2.462-.269-.646-.542-.559-.745-.569l-.636-.01a1.22 1.22 0 0 0-.883.414 3.71 3.71 0 0 0-1.16 2.764c0 1.628 1.188 3.201 1.354 3.422.166.221 2.338 3.57 5.665 5.006.791.342 1.41.546 1.89.699.795.253 1.518.217 2.09.132.638-.095 1.96-.801 2.236-1.575.277-.773.277-1.436.194-1.575-.083-.138-.304-.221-.636-.387Z" />
      </svg>

      {/* Tooltip */}
      <span
        className={`pointer-events-none absolute ${tooltipBaseClass} top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-grey-90 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100`}
      >
        Chat with us
        <span
          className={`absolute ${tooltipArrowClass} top-1/2 -translate-y-1/2 border-4 border-transparent`}
        />
      </span>
    </a>
  )
}
