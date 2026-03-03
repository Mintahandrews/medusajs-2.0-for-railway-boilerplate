import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

const OBSERVER_FLAG = "__letscase_invite_role_observer"
const FETCH_FLAG = "__letscase_fetch_patched"

/**
 * Invisible widget that:
 * 1. Injects a POS Role selector into Medusa Admin's native invite dialog
 * 2. Intercepts POST /admin/invites to pre-store the selected role
 *    via /admin/pos/invite/role before the invite is created
 *
 * The invite.created subscriber then picks up the stored role and
 * includes it in the invite email.
 */
const InviteRoleWidget = () => {
  useEffect(() => {
    if ((window as any)[OBSERVER_FLAG]) return
    ;(window as any)[OBSERVER_FLAG] = true

    // ── Monkey-patch fetch to intercept invite creation ──────────────
    if (!(window as any)[FETCH_FLAG]) {
      ;(window as any)[FETCH_FLAG] = true
      const originalFetch = window.fetch.bind(window)

      window.fetch = (async (...args: any[]) => {
        const [url, options] = args

        // Intercept POST to /admin/invites (Medusa's native invite endpoint)
        if (
          typeof url === "string" &&
          /\/admin\/invites\/?$/.test(url) &&
          options?.method?.toUpperCase() === "POST"
        ) {
          try {
            const body =
              typeof options.body === "string"
                ? JSON.parse(options.body)
                : options.body
            const email = body?.email

            // Read role from our injected dropdown
            const roleSelect = document.getElementById(
              "lc-invite-role"
            ) as HTMLSelectElement | null
            const selectedRole = roleSelect?.value || "cashier"

            if (email) {
              await originalFetch("/admin/pos/invite/role", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, pos_role: selectedRole }),
              })
            }
          } catch (e) {
            console.warn("[invite-role-widget] Failed to pre-store role:", e)
          }
        }

        return originalFetch(...args)
      }) as typeof fetch
    }

    // ── Inject role selector into invite dialogs ────────────────────
    const injectRoleSelector = () => {
      // Medusa Admin uses Radix dialogs — look for open dialogs
      const dialogs = document.querySelectorAll(
        '[role="dialog"], [data-state="open"][data-radix-focus-guard]'
      )

      // Also check for portaled overlays (Radix portals)
      const portals = document.querySelectorAll("[data-radix-portal]")
      const targets = [...Array.from(dialogs), ...Array.from(portals)]

      targets.forEach((container) => {
        // Skip if already injected
        if (container.querySelector("#lc-invite-role")) return

        // Must have an email-like input (invite form)
        const emailInput = container.querySelector(
          'input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Email"]'
        ) as HTMLInputElement | null
        if (!emailInput) return

        // Must also have a submit button (avoid injecting into search fields etc.)
        const buttons = container.querySelectorAll("button")
        const hasSubmitBtn = Array.from(buttons).some((btn) => {
          const text = btn.textContent?.toLowerCase() || ""
          return (
            text.includes("invite") ||
            text.includes("send") ||
            text.includes("submit") ||
            btn.type === "submit"
          )
        })
        if (!hasSubmitBtn) return

        // Find the input's parent container to inject after
        const inputWrapper =
          emailInput.closest('[class*="flex"][class*="flex-col"]') ||
          emailInput.closest('[class*="space-y"]') ||
          emailInput.parentElement?.parentElement ||
          emailInput.parentElement
        if (!inputWrapper) return

        // Create role selector
        const wrapper = document.createElement("div")
        wrapper.style.cssText = "margin-top: 16px;"

        const label = document.createElement("label")
        label.htmlFor = "lc-invite-role"
        label.textContent = "POS Role"
        label.style.cssText =
          "display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--fg-subtle, #71717a);"

        const select = document.createElement("select")
        select.id = "lc-invite-role"
        select.style.cssText = [
          "width: 100%",
          "border: 1px solid var(--border-base, #e4e4e7)",
          "border-radius: 8px",
          "padding: 8px 12px",
          "font-size: 13px",
          "background: var(--bg-field, #fff)",
          "color: var(--fg-base, #09090b)",
          "appearance: auto",
          "cursor: pointer",
          "outline: none",
          "transition: border-color 150ms, box-shadow 150ms",
        ].join(";")

        // Focus styling via event listeners
        select.addEventListener("focus", () => {
          select.style.borderColor = "var(--border-interactive, #7c3aed)"
          select.style.boxShadow =
            "0 0 0 3px color-mix(in srgb, var(--border-interactive, #7c3aed) 20%, transparent)"
        })
        select.addEventListener("blur", () => {
          select.style.borderColor = "var(--border-base, #e4e4e7)"
          select.style.boxShadow = "none"
        })

        const roles = [
          { value: "cashier", label: "Cashier — POS sales only" },
          { value: "manager", label: "Manager — Orders, products, reports" },
          { value: "admin", label: "Admin — Full access" },
        ]

        roles.forEach((r) => {
          const opt = document.createElement("option")
          opt.value = r.value
          opt.textContent = r.label
          select.appendChild(opt)
        })

        const hint = document.createElement("p")
        hint.textContent =
          "This role controls access in both the POS system and admin dashboard."
        hint.style.cssText =
          "margin-top: 6px; font-size: 12px; color: var(--fg-muted, #a1a1aa);"

        wrapper.appendChild(label)
        wrapper.appendChild(select)
        wrapper.appendChild(hint)

        // Insert after the email field group
        inputWrapper.after(wrapper)
      })
    }

    // Run on DOM changes via MutationObserver
    const observer = new MutationObserver(() => {
      injectRoleSelector()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // Also run periodically for the first 30s to catch late renders
    injectRoleSelector()
    const interval = setInterval(injectRoleSelector, 500)
    setTimeout(() => clearInterval(interval), 30000)
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: [
    "login.before",
    "order.list.before",
    "product.list.before",
    "customer.list.before",
  ],
})

export default InviteRoleWidget
