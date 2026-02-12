export const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  // Auto-detect Railway public domain
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  }
  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Production domain fallback
  if (process.env.NODE_ENV === "production") {
    return "https://letscasegh.com"
  }
  return "http://localhost:8000"
}

export const getMedusaBackendURL = () => {
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
}

export const getMedusaAdminURL = () => {
  const backend = getMedusaBackendURL().replace(/\/$/, "")
  return `${backend}/app`
}
