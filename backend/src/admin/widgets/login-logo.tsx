import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import { LETSCASE_LOGO_DATA_URL } from "./logo-data"

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
        [class*="AvatarBox"] {
          display: none !important;
        }
        /* Hide the default Medusa round icon above the form */
        form div:first-child span[class*="Avatar"],
        form div:first-child div[class*="avatar"],
        form div:first-child > div:first-child > span:first-child:has(svg) {
          display: none !important;
        }
      `
      document.head.appendChild(style)
    }

    // Replace "Welcome to Medusa" text with "Welcome to Letscase"
    const replaceWelcomeText = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      )
      let node: Text | null
      while ((node = walker.nextNode() as Text | null)) {
        if (node.nodeValue?.includes("Welcome to Medusa")) {
          node.nodeValue = node.nodeValue.replace("Welcome to Medusa", "Welcome to Letscase")
        }
      }
    }

    replaceWelcomeText()
    // Run again after delays in case the DOM renders late
    const t1 = setTimeout(replaceWelcomeText, 200)
    const t2 = setTimeout(replaceWelcomeText, 600)
    const t3 = setTimeout(replaceWelcomeText, 1200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
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
        src={LETSCASE_LOGO_DATA_URL}
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
