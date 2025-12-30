export const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"
}

export const getMedusaBackendURL = () => {
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
}

export const getMedusaAdminURL = () => {
  const backend = getMedusaBackendURL().replace(/\/$/, "")
  return `${backend}/app`
}
