export interface AiPreviewResult {
  /** Base64-encoded result image */
  data: string
  /** Remaining Pebblely API credits */
  credits: number
}

/** Resolve backend URL at call time so HTTPS upgrade works on the client */
function getBackendUrl(): string {
  const raw = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  if (typeof window !== "undefined" && window.location.protocol === "https:" && raw.startsWith("http://")) {
    return raw.replace("http://", "https://")
  }
  return raw
}

/**
 * Downsize a data-URL image to fit within maxDim (default 1024) to keep
 * the JSON payload small. Returns a smaller base64 data URL.
 */
function downsizeImage(dataUrl: string, maxDim = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width <= maxDim && height <= maxDim) {
        resolve(dataUrl)
        return
      }
      const ratio = Math.min(maxDim / width, maxDim / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
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
  // Downsize large canvas exports to keep payload under backend limits
  const image = await downsizeImage(imageBase64, 1024)

  const res = await fetch(`${getBackendUrl()}/store/custom/ai-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, description, theme }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `AI preview failed (${res.status})`)
  }

  return res.json()
}
