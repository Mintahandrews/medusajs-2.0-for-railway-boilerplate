import { defineWidgetConfig } from "@medusajs/admin-sdk"

/**
 * Widget injected above the login form on the Medusa admin dashboard.
 *
 * Hides the default Medusa AvatarBox (the dark square icon) via an injected
 * <style> tag and renders the Letscase logo in its place.
 *
 * The logo URL comes from the backend's own origin (/static/logo.png)
 * which is served by the local-file provider's static directory.
 */
const LOGO_URL = "/static/logo.png"

const LoginLogoWidget = () => {
  return (
    <>
      {/* Hide the default Medusa AvatarBox icon above the login form */}
      <style>{`
        /* AvatarBox: the 50×50 rounded-xl icon above the login title */
        .flex.min-h-dvh .flex.w-full.max-w-\\[280px\\] > div:first-child:has(svg[viewBox="0 0 400 400"]) {
          display: none !important;
        }
        /* Fallback: hide by size signature */
        .h-\\[50px\\].w-\\[50px\\].rounded-xl.mb-4 {
          display: none !important;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 12,
          marginTop: -8,
        }}
      >
        <img
          src={LOGO_URL}
          alt="Letscase"
          width={56}
          height={56}
          style={{
            borderRadius: 14,
            objectFit: "contain",
          }}
        />
      </div>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginLogoWidget
