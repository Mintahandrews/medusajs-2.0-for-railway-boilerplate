import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useRef } from "react"
import { LETSCASE_LOGO_DATA_URL } from "./logo-data"

const STYLE_ID = "letscase-sidebar-branding"
const OBSERVER_FLAG = "__letscase_sidebar_observer"

/**
 * Invisible widget that replaces the store Avatar in the sidebar header
 * with the Letscase logo. Also installs a global MutationObserver so
 * the replacement persists across SPA navigation.
 *
 * The sidebar store header is a DropdownMenu.Trigger containing:
 *   <span> (Avatar — squared, xsmall, with store-initial fallback)
 *   <Text>  (store name)
 *   <EllipsisHorizontal />
 *
 * We find the Avatar <span> inside the sidebar and replace it with our logo.
 */
const SidebarLogoWidget = () => {
  const throttle = useRef(false)

  useEffect(() => {
    // Guard: only install once globally
    if ((window as any)[OBSERVER_FLAG]) return
    ;(window as any)[OBSERVER_FLAG] = true

    const replaceSidebarAvatar = () => {
      // The sidebar is inside an <aside> element
      const sidebar = document.querySelector("aside")
      if (!sidebar) return

      // Find all Avatar spans in the sidebar (squared avatars with fallback text)
      // The store avatar is typically the first Avatar in the sidebar
      const avatars = sidebar.querySelectorAll('span[class*="rounded"]')
      avatars.forEach((avatar) => {
        // Skip if already replaced
        if (avatar.getAttribute("data-lc-replaced")) return

        // The store Avatar is squared (rounded-md or similar), has a single-char fallback text
        // It's inside a button or trigger element at the top of the sidebar
        const el = avatar as HTMLElement
        const text = el.textContent?.trim() || ""
        const isSmallAvatar =
          el.offsetWidth > 0 &&
          el.offsetWidth <= 40 &&
          el.offsetHeight > 0 &&
          el.offsetHeight <= 40

        // Must be a small squared element with 1-2 char fallback (store initials)
        if (!isSmallAvatar || text.length > 2 || text.length === 0) return

        // Must be near the top of the sidebar (store header area)
        const trigger = el.closest("button, [data-state]")
        if (!trigger) return

        // Verify this is inside the first section of the sidebar
        const nav = el.closest("nav")
        if (!nav) return

        // Replace avatar content with logo image
        avatar.setAttribute("data-lc-replaced", "true")
        el.style.cssText += "display:flex;align-items:center;justify-content:center;overflow:hidden;"
        el.innerHTML = ""
        const img = document.createElement("img")
        img.src = LETSCASE_LOGO_DATA_URL
        img.alt = "Letscase"
        img.style.cssText = "width:100%;height:100%;object-fit:contain;border-radius:inherit;"
        el.appendChild(img)
      })
    }

    replaceSidebarAvatar()
    setTimeout(replaceSidebarAvatar, 300)
    setTimeout(replaceSidebarAvatar, 1000)

    // Persistent observer for SPA navigation
    const observer = new MutationObserver(() => {
      if (!throttle.current) {
        throttle.current = true
        requestAnimationFrame(() => {
          replaceSidebarAvatar()
          throttle.current = false
        })
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
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
