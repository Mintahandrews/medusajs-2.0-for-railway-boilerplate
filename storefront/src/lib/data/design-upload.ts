/** Resolve backend URL at call time so HTTPS upgrade works on the client */
function getBackendUrl(): string {
  const raw = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  if (typeof window !== "undefined" && window.location.protocol === "https:" && raw.startsWith("http://")) {
    return raw.replace("http://", "https://")
  }
  return raw
}

export interface DesignUploadResult {
  previewUrl: string
  previewKey: string
  printFileUrl: string
  printFileKey: string
}

/**
 * Upload customizer design files (preview + print file) to MinIO via the
 * Medusa backend. Accepts data-URL strings and converts them to base64
 * before sending.
 */
export async function uploadDesignFiles(
  previewDataUrl: string,
  printFileDataUrl: string,
  cartId: string
): Promise<DesignUploadResult> {
  // Strip the data:image/png;base64, prefix
  const toBase64 = (dataUrl: string) => {
    const idx = dataUrl.indexOf(",")
    return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl
  }

  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  const response = await fetch(
    `${getBackendUrl()}/store/custom/design-upload`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(publishableKey ? { "x-publishable-api-key": publishableKey } : {}),
      },
      body: JSON.stringify({
        cart_id: cartId,
        files: [
          {
            name: "preview.png",
            content: toBase64(previewDataUrl),
            mimeType: "image/png",
          },
          {
            name: "print-file.png",
            content: toBase64(printFileDataUrl),
            mimeType: "image/png",
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Upload failed (${response.status})`)
  }

  const { uploads } = (await response.json()) as {
    uploads: Array<{ url: string; key: string }>
  }

  return {
    previewUrl: uploads[0].url,
    previewKey: uploads[0].key,
    printFileUrl: uploads[1].url,
    printFileKey: uploads[1].key,
  }
}
