import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

const PRIMARY_LOGO_SRC = "/static/logo.png"
const FALLBACK_LOGO_SRC = "/logo.png"

/**
 * Widget injected above the login form.
 * Replaces the default Medusa avatar-box with the Letscase logo.
 *
 * The default AvatarBox is hidden via DOM detection to avoid icon overlap.
 */
const LoginLogoWidget = () => {
  useEffect(() => {
    const hideDefaultLoginLogo = () => {
      const heading = Array.from(
        document.querySelectorAll<HTMLElement>("h1, h2, h3, p, span")
      ).find((node) => node.textContent?.trim().includes("Welcome to Medusa"))

      const avatarCandidate = heading?.parentElement?.previousElementSibling as
        | HTMLElement
        | null

      if (avatarCandidate?.querySelector("svg")) {
        avatarCandidate.style.display = "none"
      }
    }

    hideDefaultLoginLogo()

    const observer = new MutationObserver(() => hideDefaultLoginLogo())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "4px",
        marginTop: "-60px", // Offset above into the AvatarBox space (now hidden)
      }}
    >
      <img
        src={PRIMARY_LOGO_SRC}
        alt="Letscase"
        onError={(event) => {
          event.currentTarget.onerror = null
          event.currentTarget.src = FALLBACK_LOGO_SRC
        }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          objectFit: "contain",
          marginBottom: 8,
        }}
      />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginLogoWidget
