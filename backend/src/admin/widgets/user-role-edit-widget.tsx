import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

const OBSERVER_FLAG = "__letscase_user_role_edit_observer"
const FETCH_FLAG = "__letscase_user_role_edit_fetch_patched"

function getUserIdFromPath(pathname: string): string | null {
  // /app/settings/users/<id>/edit
  const m = pathname.match(/\/app\/settings\/users\/([^/]+)\/edit\/?$/)
  return m?.[1] || null
}

async function fetchUserRole(userId: string): Promise<string | null> {
  try {
    const res = await fetch(`/admin/users/${userId}`, { credentials: "include" })
    if (!res.ok) return null
    const data = await res.json()
    const user = data?.user
    return user?.metadata?.pos_role || null
  } catch {
    return null
  }
}

/**
 * Invisible widget that augments the native Medusa Admin user edit page:
 * - Injects a POS Role dropdown into /app/settings/users/:id/edit
 * - Intercepts POST /admin/users/:id and merges metadata.pos_role
 */
const UserRoleEditWidget = () => {
  useEffect(() => {
    if ((window as any)[OBSERVER_FLAG]) return
    ;(window as any)[OBSERVER_FLAG] = true

    // Patch fetch once so Save includes metadata.pos_role
    if (!(window as any)[FETCH_FLAG]) {
      ;(window as any)[FETCH_FLAG] = true
      const originalFetch = window.fetch.bind(window)

      window.fetch = (async (...args: any[]) => {
        const [url, options] = args

        if (
          typeof url === "string" &&
          /\/admin\/users\/[^/]+\/?$/.test(url) &&
          options?.method?.toUpperCase() === "POST" &&
          options?.headers &&
          String((options.headers as any)["Content-Type"] || (options.headers as any)["content-type"] || "")
            .toLowerCase()
            .includes("application/json")
        ) {
          try {
            const select = document.getElementById(
              "lc-user-pos-role"
            ) as HTMLSelectElement | null
            const selectedRole = select?.value

            if (selectedRole) {
              const rawBody = options.body
              const parsed =
                typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody

              const nextBody = {
                ...(parsed || {}),
                metadata: {
                  ...((parsed || {})?.metadata || {}),
                  pos_role: selectedRole,
                },
              }

              const nextOptions = {
                ...(options || {}),
                body: JSON.stringify(nextBody),
              }

              return originalFetch(url, nextOptions)
            }
          } catch (e) {
            console.warn("[user-role-edit-widget] Failed to patch save:", e)
          }
        }

        return originalFetch(...args)
      }) as typeof fetch
    }

    const injectRoleSelector = async () => {
      const userId = getUserIdFromPath(window.location.pathname)
      if (!userId) return

      // Try to find a stable container on the user edit page
      const main = document.querySelector("main") || document.body
      if (!main) return

      if (document.getElementById("lc-user-pos-role")) return

      // Look for the form area by finding the email input or any input group
      const emailInput = main.querySelector(
        'input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Email"]'
      ) as HTMLInputElement | null
      if (!emailInput) return

      const anchor =
        emailInput.closest('[class*="grid"], [class*="flex"], [class*="space-y"], form') ||
        emailInput.parentElement
      if (!anchor) return

      const wrapper = document.createElement("div")
      wrapper.style.cssText = "margin-top: 16px;"

      const label = document.createElement("label")
      label.htmlFor = "lc-user-pos-role"
      label.textContent = "POS Role"
      label.style.cssText =
        "display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:var(--fg-subtle,#71717a);"

      const select = document.createElement("select")
      select.id = "lc-user-pos-role"
      select.style.cssText = [
        "width:100%",
        "border:1px solid var(--border-base,#e4e4e7)",
        "border-radius:8px",
        "padding:8px 12px",
        "font-size:13px",
        "background:var(--bg-field,#fff)",
        "color:var(--fg-base,#09090b)",
        "appearance:auto",
      ].join(";")

      ;[
        { value: "cashier", label: "Cashier" },
        { value: "manager", label: "Manager" },
        { value: "admin", label: "Admin" },
      ].forEach((r) => {
        const opt = document.createElement("option")
        opt.value = r.value
        opt.textContent = r.label
        select.appendChild(opt)
      })

      const hint = document.createElement("p")
      hint.textContent = "Controls POS access and admin permissions."
      hint.style.cssText =
        "margin-top:6px;font-size:12px;color:var(--fg-muted,#a1a1aa);"

      wrapper.appendChild(label)
      wrapper.appendChild(select)
      wrapper.appendChild(hint)

      // Place it after the email field group
      const emailGroup =
        emailInput.closest('[class*="flex"][class*="flex-col"]') ||
        emailInput.parentElement?.parentElement ||
        emailInput.parentElement

      if (emailGroup && emailGroup.parentElement) {
        emailGroup.parentElement.insertBefore(wrapper, emailGroup.nextSibling)
      } else {
        anchor.appendChild(wrapper)
      }

      // Set initial value from API
      const role = (await fetchUserRole(userId)) || "cashier"
      select.value = role
    }

    const observer = new MutationObserver(() => {
      void injectRoleSelector()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    void injectRoleSelector()
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: [
    "order.list.before",
    "product.list.before",
    "customer.list.before",
    "login.before",
  ],
})

export default UserRoleEditWidget
