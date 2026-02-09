export interface AiPreviewResult {
  /** Data URL (base64) of the generated mockup image */
  imageUrl: string
}

export interface AiPreviewOptions {
  /** Scene type: lifestyle | desk | nature | studio | flat */
  scene?: string
  /** Case type: slim | tough | clear | magsafe */
  caseType?: string
  /** Human-readable device name, e.g. "iPhone 16 Pro Max" */
  deviceModel?: string
  /** Device handle, e.g. "iphone-16-pro-max" */
  deviceHandle?: string
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
 * using Google Gemini 2.5 Flash Image (Nano Banana) via our backend proxy.
 * The AI reproduces the exact design onto a realistic phone case mockup.
 *
 * @param imageDataUrl - The case design export (data URL)
 * @param options - Scene, case type, and device info for the AI prompt
 */
export async function generateAiPreview(
  imageDataUrl: string,
  options: AiPreviewOptions = {}
): Promise<AiPreviewResult> {
  const {
    scene = "lifestyle",
    caseType = "tough",
    deviceModel,
    deviceHandle,
  } = options

  // Downsize large canvas exports to keep payload under backend limits
  const image = await downsizeImage(imageDataUrl, 1024)

  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  const res = await fetch(`${getBackendUrl()}/store/custom/ai-preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
    },
    body: JSON.stringify({
      image,
      scene,
      case_type: caseType,
      device_model: deviceModel,
      device_handle: deviceHandle,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `AI preview failed (${res.status})`)
  }

  return res.json()
}
