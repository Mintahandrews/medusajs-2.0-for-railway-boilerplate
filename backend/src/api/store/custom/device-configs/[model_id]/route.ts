import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * Device configuration registry.
 * In a production system these would come from a database or the Product
 * Variant metadata, but keeping them server-side avoids hardcoding asset
 * URLs in the frontend bundle while remaining easy to extend.
 */
const DEVICE_CONFIGS: Record<string, object> = {
  "iphone-15-pro": {
    name: "iPhone 15 Pro",
    handle: "iphone-15-pro",
    canvasWidth: 450,
    canvasHeight: 920,
    cornerRadius: 44,
    overlayUrl: "/assets/phone-case/iphone 15 pro/overlay.png",
    mockupMaskUrl: "/assets/phone-case/iphone 15 pro/mask.svg",
    printSpec: { widthMm: 75, heightMm: 153, dpi: 300 },
    bleedMm: 3,
  },
  "iphone-14": {
    name: "iPhone 14",
    handle: "iphone-14",
    canvasWidth: 430,
    canvasHeight: 880,
    cornerRadius: 40,
    overlayUrl: "/assets/phone-case/iphone-14/overlay.svg",
    mockupMaskUrl: "/assets/phone-case/iphone-14/mask.svg",
    printSpec: { widthMm: 71.5, heightMm: 146.7, dpi: 300 },
    bleedMm: 3,
  },
  "iphone-16-pro": {
    name: "iPhone 16 Pro",
    handle: "iphone-16-pro",
    canvasWidth: 460,
    canvasHeight: 940,
    cornerRadius: 46,
    overlayUrl: "/assets/phone-case/iphone-16-pro/overlay.svg",
    mockupMaskUrl: "/assets/phone-case/iphone-16-pro/mask.svg",
    printSpec: { widthMm: 76.5, heightMm: 156.5, dpi: 300 },
    bleedMm: 3,
  },
  "samsung-s24": {
    name: "Samsung Galaxy S24",
    handle: "samsung-s24",
    canvasWidth: 440,
    canvasHeight: 900,
    cornerRadius: 36,
    overlayUrl: "/assets/phone-case/samsung-s24/overlay.svg",
    mockupMaskUrl: "/assets/phone-case/samsung-s24/mask.svg",
    printSpec: { widthMm: 70.6, heightMm: 147.0, dpi: 300 },
    bleedMm: 3,
  },
  "pixel-9": {
    name: "Google Pixel 9",
    handle: "pixel-9",
    canvasWidth: 440,
    canvasHeight: 920,
    cornerRadius: 42,
    overlayUrl: "/assets/phone-case/pixel-9/overlay.svg",
    mockupMaskUrl: "/assets/phone-case/pixel-9/mask.svg",
    printSpec: { widthMm: 72.0, heightMm: 152.8, dpi: 300 },
    bleedMm: 3,
  },
}

/**
 * GET /store/custom/device-configs/:model_id
 *
 * Returns the device configuration for the given model handle.
 * If model_id is "all", returns all configs.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const modelId = (req.params as any).model_id as string

  if (modelId === "all") {
    res.json({ configs: DEVICE_CONFIGS })
    return
  }

  const config = DEVICE_CONFIGS[modelId]
  if (!config) {
    res.status(404).json({ message: `Device config not found: ${modelId}` })
    return
  }

  res.json({ config })
}
