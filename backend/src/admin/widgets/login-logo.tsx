import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import { LETSCASE_LOGO_DATA_URL } from "./logo-data"

const OBSERVER_FLAG = "__letscase_logo_observer"
const STYLE_ID = "letscase-auth-fixes"

/**
 * Widget injected into "login.before" zone.
 * Renders nothing visible — installs a persistent MutationObserver on
 * document.body that replaces ALL Medusa logo SVGs across every admin page
 * (login, invite, reset-password) with the Letscase logo.
 *
 * Targeted SVGs:
 *   - AvatarBox:  viewBox="0 0 400 400"  (login + invite pages)
 *   - LogoBox:    viewBox="0 0 36 38"    (reset-password page)
 *
 * The observer persists across SPA navigation so pages without widget
 * zones (invite, reset-password) are still branded.
 */
const LoginLogoWidget = () => {
  useEffect(() => {
    // Guard: only install once globally
    if ((window as any)[OBSERVER_FLAG]) return
    ;(window as any)[OBSERVER_FLAG] = true

    // ── Auth page CSS fixes: icon spacing in input fields ────────
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style")
      style.id = STYLE_ID
      style.textContent = `
        /* Fix icon + input field spacing on auth pages */
        form [class*="relative"] > svg,
        form [class*="relative"] > span > svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          z-index: 1;
        }
        form [class*="relative"] > input {
          padding-left: 40px !important;
        }
        /* Ensure input containers have relative positioning */
        form [class*="relative"] {
          position: relative;
        }
        /* Fix vertical spacing between form fields */
        form > div + div,
        form > fieldset + div,
        form > div + fieldset {
          margin-top: 16px;
        }
        /* Fix invite page form spacing */
        [role="dialog"] form > div + div {
          margin-top: 12px;
        }
      `
      document.head.appendChild(style)
    }

    const replaceMedusaLogos = () => {
      // Target both AvatarBox (400×400) and LogoBox (36×38) SVGs
      const selectors = [
        'svg[viewBox="0 0 400 400"]',
        'svg[viewBox="0 0 36 38"]',
      ]

      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((svg) => {
          if (svg.getAttribute("data-lc-replaced")) return

          const parent = svg.parentElement
          if (!parent) return

          const img = document.createElement("img")
          img.src = LETSCASE_LOGO_DATA_URL
          img.alt = "Letscase"
          img.style.cssText =
            "width:100%;height:100%;object-fit:contain;border-radius:10px;"

          svg.setAttribute("data-lc-replaced", "true")
          ;(svg as HTMLElement).style.display = "none"
          parent.insertBefore(img, svg)
        })
      })

      // Replace "Welcome to Medusa" → "Welcome to Letscase"
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

    // Run immediately + delayed for initial render
    replaceMedusaLogos()
    setTimeout(replaceMedusaLogos, 200)
    setTimeout(replaceMedusaLogos, 800)

    // Install persistent MutationObserver to catch SPA navigation
    // (reset-password, invite pages render after route change)
    const observer = new MutationObserver(() => {
      replaceMedusaLogos()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Never disconnect — observer must persist across the entire SPA lifecycle
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginLogoWidget
