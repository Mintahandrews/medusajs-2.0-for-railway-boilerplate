const _raw = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
// Ensure HTTPS in production to avoid Mixed Content errors
const BACKEND_URL =
  typeof window !== "undefined" && window.location.protocol === "https:" && _raw.startsWith("http://")
    ? _raw.replace("http://", "https://")
    : _raw

export interface AiPreviewResult {
  /** Base64-encoded result image */
  data: string
  /** Remaining Pebblely API credits */
  credits: number
}

/**
 * Generate an AI lifestyle preview of the user's phone case design
 * using the Pebblely AI backend proxy.
 *
 * @param imageBase64 - The case preview export (data URL or raw base64)
 * @param description - Optional custom scene prompt
 * @param theme - Optional Pebblely theme (ignored if description is set)
 */
export async function generateAiPreview(
  imageBase64: string,
  description?: string,
  theme?: string
): Promise<AiPreviewResult> {
  const res = await fetch(`${BACKEND_URL}/store/custom/ai-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64, description, theme }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `AI preview failed (${res.status})`)
  }

  return res.json()
}
