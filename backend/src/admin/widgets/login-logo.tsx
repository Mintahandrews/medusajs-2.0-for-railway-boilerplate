import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import { LETSCASE_LOGO_DATA_URL } from "./logo-data"

/**
 * Widget injected into "login.before" zone.
 * Renders nothing visible — uses useEffect to:
 *   1. Replace the default Medusa AvatarBox SVG with our logo (same position)
 *   2. Replace "Welcome to Medusa" text with "Welcome to Letscase"
 *
 * The AvatarBox is an IconAvatar containing an SVG with viewBox="0 0 400 400".
 * We locate it by that SVG and swap it for an <img>.
 */
const LoginLogoWidget = () => {
  useEffect(() => {
    const replaceAll = () => {
      // 1. Find the Medusa AvatarBox SVG (viewBox="0 0 400 400") and replace it
      const svgs = document.querySelectorAll('svg[viewBox="0 0 400 400"]')
      svgs.forEach((svg) => {
        // Only replace if not already done
        if (svg.getAttribute("data-replaced")) return

        const parent = svg.parentElement
        if (!parent) return

        // Create our logo image to replace the SVG
        const img = document.createElement("img")
        img.src = LETSCASE_LOGO_DATA_URL
        img.alt = "Letscase"
        img.style.cssText =
          "width:100%;height:100%;object-fit:contain;border-radius:10px;"

        // Mark and hide original SVG, insert our image
        svg.setAttribute("data-replaced", "true")
        ;(svg as HTMLElement).style.display = "none"
        parent.insertBefore(img, svg)
      })

      // 2. Replace "Welcome to Medusa" text nodes with "Welcome to Letscase"
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      )
      let node: Text | null
      while ((node = walker.nextNode() as Text | null)) {
        if (node.nodeValue?.includes("Welcome to Medusa")) {
          node.nodeValue = node.nodeValue.replace(
            "Welcome to Medusa",
            "Welcome to Letscase"
          )
        }
      }
    }

    replaceAll()
    const t1 = setTimeout(replaceAll, 150)
    const t2 = setTimeout(replaceAll, 500)
    const t3 = setTimeout(replaceAll, 1200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  // Render nothing — all work is done via DOM manipulation
  return null
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginLogoWidget
