import Medusa from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

// Force HTTPS in production to prevent mixed-content errors
if (
  process.env.NODE_ENV === "production" &&
  MEDUSA_BACKEND_URL.startsWith("http://") &&
  !MEDUSA_BACKEND_URL.includes("localhost")
) {
  MEDUSA_BACKEND_URL = MEDUSA_BACKEND_URL.replace("http://", "https://")
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
