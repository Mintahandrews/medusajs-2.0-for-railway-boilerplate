"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * Wraps the <header> to make it transparent on the homepage and solid on scroll
 * or on any other page. Uses CSS classes so server-rendered children stay intact.
 */
export default function TransparentNavWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  // Only the homepage root (with optional country code prefix) gets transparent treatment
  const isHome = (() => {
    const parts = (pathname || "/").split("/").filter(Boolean)
    // "/" or "/gh" (just country code)
    if (parts.length === 0) return true
    if (parts.length === 1 && parts[0].length === 2) return true
    return false
  })()

  useEffect(() => {
    if (!isHome) {
      setScrolled(true)
      return
    }

    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll() // initial check
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome])

  const transparent = isHome && !scrolled

  return (
    <div
      className={`group fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent border-transparent"
          : "bg-white/95 backdrop-blur-md border-b border-ui-border-base shadow-sm"
      }`}
      data-transparent={transparent ? "true" : "false"}
    >
      {children}
    </div>
  )
}
