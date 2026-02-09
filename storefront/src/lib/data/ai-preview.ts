export interface AiPreviewResult {
  /** URL of the generated image (hosted on Replicate CDN) */
  imageUrl: string
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
 * using Replicate (SDXL img2img) via our backend proxy.
 *
 * @param imageDataUrl - The case preview export (data URL)
 * @param scene - Scene type: lifestyle | desk | nature | studio | flat
 */
export async function generateAiPreview(
  imageDataUrl: string,
  scene: string = "lifestyle"
): Promise<AiPreviewResult> {
  // Downsize large canvas exports to keep payload under backend limits
  const image = await downsizeImage(imageDataUrl, 1024)

  const res = await fetch(`${getBackendUrl()}/store/custom/ai-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, scene }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `AI preview failed (${res.status})`)
  }

  return res.json()
}
