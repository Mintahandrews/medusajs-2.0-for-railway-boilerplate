import { defineWidgetConfig } from "@medusajs/admin-sdk"

/**
 * Widget injected above the login form.
 * Replaces the default Medusa avatar-box with the Letscase logo.
 *
 * The default AvatarBox is hidden via CSS injected in admin-global.css.
 */
const LoginLogoWidget = () => {
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
        src="/logo.png"
        alt="Letscase"
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
