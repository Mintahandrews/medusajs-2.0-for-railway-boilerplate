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

const PRIMARY_LOGO_SRC = "/static/logo.png"
const FALLBACK_LOGO_SRC = "/logo.png"

const resolveLogoSrc = () => {
  return new Promise<string>((resolve) => {
    const image = new Image()
    image.onload = () => resolve(PRIMARY_LOGO_SRC)
    image.onerror = () => resolve(FALLBACK_LOGO_SRC)
    image.src = PRIMARY_LOGO_SRC
  })
}

const applySidebarLogo = (logoSrc: string) => {
  const iconCandidates = Array.from(
    document.querySelectorAll<SVGElement>("svg.text-ui-contrast-fg-secondary")
  )

  iconCandidates.forEach((icon) => {
    const appHomeLink = icon.closest<HTMLAnchorElement>('a[href="/app"], a[href$="/app"]')
    if (!appHomeLink) {
      return
    }

    const iconContainer = icon.parentElement as HTMLElement | null
    if (!iconContainer) {
      return
    }

    iconContainer.dataset.letscaseSidebarLogo = "true"
    iconContainer.style.position = "relative"
    iconContainer.style.backgroundImage = `url("${logoSrc}")`
    iconContainer.style.backgroundPosition = "center"
    iconContainer.style.backgroundRepeat = "no-repeat"
    iconContainer.style.backgroundSize = "contain"
    iconContainer.style.borderRadius = "6px"

    icon.style.visibility = "hidden"
  })
}

const SidebarLogoWidget = () => {
  useEffect(() => {
    let mounted = true
    let logoSrc = PRIMARY_LOGO_SRC

    const apply = () => {
      applySidebarLogo(logoSrc)
    }

    resolveLogoSrc().then((resolvedSrc) => {
      if (!mounted) return
      logoSrc = resolvedSrc
      applySidebarLogo(logoSrc)
    })

    apply()

    const observer = new MutationObserver(() => apply())
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      mounted = false
      observer.disconnect()
    }
  }, [])

  // Renders nothing — purely a CSS injector
  return null
}

export const config = defineWidgetConfig({
  zone: [
    "login.before",
    "order.list.before",
    "product.list.before",
    "customer.list.before",
    "order.details.after",
    "product.details.after",
  ],
})

export default SidebarLogoWidget
