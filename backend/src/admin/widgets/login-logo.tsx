import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

const STYLE_ID = "letscase-login-branding"

/**
 * Widget injected above the login form.
 * Hides the default Medusa AvatarBox + "Welcome to Medusa" heading via CSS,
 * then renders the Letscase logo and custom welcome text.
 */
const LoginLogoWidget = () => {
  useEffect(() => {
    // Inject CSS to hide default Medusa branding on login/reset pages
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style")
      style.id = STYLE_ID
      style.textContent = `
        /* Hide the default Medusa AvatarBox icon on login */
        [class*="AvatarBox"],
        form > div:first-child > div:first-child > span:first-child {
          display: none !important;
        }
      `
      document.head.appendChild(style)
    }

    // Replace "Welcome to Medusa" text with "Welcome to Letscase"
    const replaceWelcomeText = () => {
      document.querySelectorAll("h1, h2, h3, p, span").forEach((el) => {
        if (el.textContent?.includes("Welcome to Medusa")) {
          el.textContent = el.textContent.replace("Welcome to Medusa", "Welcome to Letscase")
        }
        if (el.textContent?.includes("Medusa") && el.closest("form")) {
          el.textContent = el.textContent.replace("Medusa", "Letscase")
        }
      })
    }

    replaceWelcomeText()
    // Run again after a short delay in case the DOM renders late
    const timer = setTimeout(replaceWelcomeText, 300)
    const timer2 = setTimeout(replaceWelcomeText, 800)

    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "12px",
      }}
    >
      <img
        src="/static/logo.png"
        alt="Letscase"
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          objectFit: "contain",
          marginBottom: 4,
        }}
      />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginLogoWidget
