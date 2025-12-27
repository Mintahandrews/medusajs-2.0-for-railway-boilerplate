import Medusa from "@medusajs/js-sdk"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://letscase-admin.up.railway.app"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export const medusa = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    publishableKey: PUBLISHABLE_KEY,
})

export { MEDUSA_BACKEND_URL }
