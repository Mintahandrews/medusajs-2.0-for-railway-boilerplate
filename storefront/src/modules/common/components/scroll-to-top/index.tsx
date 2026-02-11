"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * Scrolls the window to the top whenever the pathname changes.
 * Placed in the root layout so every page navigation starts at the top.
 */
export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  return null
}
