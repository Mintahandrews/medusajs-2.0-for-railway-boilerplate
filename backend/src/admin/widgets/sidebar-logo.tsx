import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useRef } from "react"

const LOGO_URL = "/static/logo.png"
const STYLE_ID = "letscase-sidebar-logo"

/**
 * Invisible widget that replaces the Medusa sidebar logo and branding
 * with the Letscase logo. Uses both CSS injection and DOM manipulation
 * for maximum reliability across Medusa admin versions.
 *
 * Injected into several high-traffic zones so the style is applied on
 * whichever page the admin visits first.
 */

const BRANDING_CSS = `
/* ── Replace sidebar Medusa icon with Letscase logo ── */

/* Target the sidebar logo SVG icon and replace with our logo */
aside nav > div:first-child a[href="/app"] svg,
aside nav > div:first-child > a svg,
aside header a[href="/app"] svg,
[class*="SquareTwoStack"],
span:has(> svg.text-ui-contrast-fg-secondary) > svg,
aside svg[class*="contrast-fg"] {
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  position: absolute !important;
}

aside nav > div:first-child a[href="/app"],
aside nav > div:first-child > a:first-child,
aside header a[href="/app"] {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

aside nav > div:first-child a[href="/app"]::before,
aside nav > div:first-child > a:first-child::before,
aside header a[href="/app"]::before {
  content: "";
  display: inline-block;
  width: 28px;
  height: 28px;
  background: url("${LOGO_URL}") center / contain no-repeat;
  border-radius: 6px;
  flex-shrink: 0;
}

/* Also replace any "Medusa" text in the sidebar header area */
aside nav > div:first-child a[href="/app"] span:has(> svg) {
  position: relative;
}
aside nav > div:first-child a[href="/app"] span:has(> svg)::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("${LOGO_URL}") center / contain no-repeat;
  border-radius: 6px;
}

/* Fallback: generic :has() approach for SquareTwoStack SVG */
span:has(> svg.text-ui-contrast-fg-secondary) {
  position: relative;
}
span:has(> svg.text-ui-contrast-fg-secondary)::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("${LOGO_URL}") center / contain no-repeat;
  border-radius: 6px;
}

/* Global: replace any remaining "Medusa" heading in dashboard chrome */
`

const SidebarLogoWidget = () => {
  const hasRun = useRef(false)

  useEffect(() => {
    // Inject CSS once
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style")
      style.id = STYLE_ID
      style.textContent = BRANDING_CSS
      document.head.appendChild(style)
    }

    // DOM manipulation fallback — replace sidebar logo via direct DOM access
    const replaceSidebarLogo = () => {
      // Find sidebar logo link (typically the first link in <aside>)
      const sidebar = document.querySelector("aside")
      if (!sidebar) return

      // Look for SVG icons in the sidebar header area
      const svgs = sidebar.querySelectorAll("svg")
      svgs.forEach((svg) => {
        const parent = svg.parentElement
        if (!parent) return

        // Check if this is a top-level sidebar icon (logo area)
        const link = parent.closest("a")
        if (link && (link.getAttribute("href") === "/app" || link.closest("nav > div:first-child"))) {
          // Check if we already replaced this
          if (parent.querySelector(".letscase-sidebar-img")) return

          svg.style.display = "none"
          const img = document.createElement("img")
          img.src = LOGO_URL
          img.alt = "Letscase"
          img.className = "letscase-sidebar-img"
          img.style.cssText = "width:28px;height:28px;border-radius:6px;object-fit:contain;"
          parent.insertBefore(img, svg)
        }
      })
    }

    replaceSidebarLogo()
    const t1 = setTimeout(replaceSidebarLogo, 500)
    const t2 = setTimeout(replaceSidebarLogo, 1500)

    // Observe for SPA navigation — sidebar may re-render
    const observer = new MutationObserver(() => {
      if (!hasRun.current) {
        hasRun.current = true
        requestAnimationFrame(() => {
          replaceSidebarLogo()
          hasRun.current = false
        })
      }
    })

    const aside = document.querySelector("aside")
    if (aside) {
      observer.observe(aside, { childList: true, subtree: true })
    }

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      observer.disconnect()
    }
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: [
    "order.list.before",
    "product.list.before",
    "customer.list.before",
    "customer.details.before",
    "order.details.before",
    "product.details.before",
  ],
})

export default SidebarLogoWidget
