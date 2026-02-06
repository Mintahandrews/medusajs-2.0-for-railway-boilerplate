export default function medusaError(error: any): never {
  // Handle Axios-style errors (legacy)
  if (error?.response?.data) {
    try {
      const u = error.config?.url
        ? new URL(error.config.url, error.config.baseURL || "")
        : null
      if (u) console.error("Resource:", u.toString())
    } catch { /* ignore URL parse errors */ }
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)

    const message = error.response.data?.message || error.response.data
    const msg = typeof message === "string" ? message : JSON.stringify(message)
    throw new Error(msg.charAt(0).toUpperCase() + msg.slice(1) + ".")
  }

  // Handle @medusajs/js-sdk fetch errors and plain Error objects
  if (error?.message) {
    throw new Error(error.message)
  }

  // Handle string errors
  if (typeof error === "string") {
    throw new Error(error)
  }

  throw new Error("An unknown error occurred.")
}
