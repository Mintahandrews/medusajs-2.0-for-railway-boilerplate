import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

/**
 * Invisible widget that injects global CSS to replace the Medusa sidebar
 * logo (SquareTwoStack icon) with the Letscase logo.
 *
 * Injected into several high-traffic zones so the style is applied on
 * whichever page the admin visits first. The <style> tag is idempotent —
 * duplicates are harmless.
 */

const LOGO_URL = "/static/logo.png"

const SIDEBAR_CSS = `
/* ── Replace sidebar Medusa icon with Letscase logo ── */

/* The sidebar logo is an SVG SquareTwoStack icon rendered inside a <span>.
   We hide the SVG and use the span as a container for our logo. */
span:has(> svg.text-ui-contrast-fg-secondary) {
  position: relative;
}
span:has(> svg.text-ui-contrast-fg-secondary) > svg {
  visibility: hidden;
}
span:has(> svg.text-ui-contrast-fg-secondary)::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("${LOGO_URL}") center / contain no-repeat;
  border-radius: 6px;
}
`

const STYLE_ID = "letscase-sidebar-logo"

const SidebarLogoWidget = () => {
  useEffect(() => {
    // Only inject once
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = SIDEBAR_CSS
    document.head.appendChild(style)
  }, [])

  // Renders nothing — purely a CSS injector
  return null
}

export const config = defineWidgetConfig({
  zone: [
    "order.list.before",
    "product.list.before",
    "customer.list.before",
  ],
})

export default SidebarLogoWidget
