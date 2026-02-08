/**
 * Device-specific asset configuration for the phone case customizer.
 * Maps device handles to their mask SVG path, overlay PNG, and canvas dimensions.
 */

export interface DeviceConfig {
  /** Display name */
  name: string
  /** URL-safe handle used in routes and lookups */
  handle: string
  /** Internal canvas width (px) — the design coordinate space */
  canvasWidth: number
  /** Internal canvas height (px) */
  canvasHeight: number
  /** Corner radius for the case outline */
  cornerRadius: number
  /**
   * SVG path `d` attribute describing the printable area (straight-on view).
   * Used as the Fabric.js `clipPath` in the editor so the user's design
   * never bleeds outside the phone shape.
   */
  editorMaskPath: string
  /** Path to the realistic overlay PNG (shadows, camera bezel, frame) */
  overlayUrl: string
  /** Path to the full SVG mask used for angled mockup generation */
  mockupMaskUrl: string
  /** Physical print dimensions in mm (for 300 DPI export) */
  printSpec: { widthMm: number; heightMm: number; dpi: number }
  /** Bleed area in mm that extends beyond the visible mask for edge-to-edge printing */
  bleedMm: number
  /** Bleed in canvas pixels (computed from bleedMm and canvas/print ratio) */
  bleedPx: number
}

/* -------------------------------------------------------------------------- */
/*  Rounded-rect path helper                                                  */
/* -------------------------------------------------------------------------- */

function roundedRectPath(w: number, h: number, r: number): string {
  return [
    `M ${r},0`,
    `L ${w - r},0`,
    `Q ${w},0 ${w},${r}`,
    `L ${w},${h - r}`,
    `Q ${w},${h} ${w - r},${h}`,
    `L ${r},${h}`,
    `Q 0,${h} 0,${h - r}`,
    `L 0,${r}`,
    `Q 0,0 ${r},0`,
    `Z`,
  ].join(" ")
}

/* -------------------------------------------------------------------------- */
/*  Device registry                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Helper: compute bleed in canvas pixels from physical bleed (mm) and
 * the canvas-to-print ratio (canvasWidth / printSpec.widthMm).
 */
function bleedPx(canvasWidth: number, widthMm: number, bleedMm: number): number {
  return Math.round((canvasWidth / widthMm) * bleedMm)
}

export const DEVICE_CONFIGS: Record<string, DeviceConfig> = {
  "iphone-15-pro": {
    name: "iPhone 15 Pro",
    handle: "iphone-15-pro",
    canvasWidth: 450,
    canvasHeight: 920,
    cornerRadius: 44,
    editorMaskPath: roundedRectPath(450, 920, 44),
    overlayUrl: "/assets/phone-case/iphone 15 pro/overlay.png",
    mockupMaskUrl: "/assets/phone-case/iphone 15 pro/mask.svg",
    printSpec: { widthMm: 75, heightMm: 153, dpi: 300 },
    bleedMm: 3,
    bleedPx: bleedPx(450, 75, 3),
  },

  "iphone-14": {
    name: "iPhone 14",
    handle: "iphone-14",
    canvasWidth: 430,
    canvasHeight: 880,
    cornerRadius: 40,
    editorMaskPath: roundedRectPath(430, 880, 40),
    overlayUrl: "/assets/phone-case/iphone-14/overlay.svg",
    mockupMaskUrl: "/assets/phone-case/iphone-14/mask.svg",
    printSpec: { widthMm: 71.5, heightMm: 146.7, dpi: 300 },
    bleedMm: 3,
    bleedPx: bleedPx(430, 71.5, 3),
  },

  "iphone-16-pro": {
    name: "iPhone 16 Pro",
    handle: "iphone-16-pro",
    canvasWidth: 460,
    canvasHeight: 940,
    cornerRadius: 46,
    editorMaskPath: roundedRectPath(460, 940, 46),
    overlayUrl: "/assets/phone-case/iphone-16-pro/overlay.svg",
    mockupMaskUrl: "/assets/phone-case/iphone-16-pro/mask.svg",
    printSpec: { widthMm: 76.5, heightMm: 156.5, dpi: 300 },
    bleedMm: 3,
    bleedPx: bleedPx(460, 76.5, 3),
  },

  "samsung-s24": {
    name: "Samsung Galaxy S24",
    handle: "samsung-s24",
    canvasWidth: 440,
    canvasHeight: 900,
    cornerRadius: 36,
    editorMaskPath: roundedRectPath(440, 900, 36),
    overlayUrl: "/assets/phone-case/samsung-s24/overlay.svg",
    mockupMaskUrl: "/assets/phone-case/samsung-s24/mask.svg",
    printSpec: { widthMm: 70.6, heightMm: 147.0, dpi: 300 },
    bleedMm: 3,
    bleedPx: bleedPx(440, 70.6, 3),
  },

  "pixel-9": {
    name: "Google Pixel 9",
    handle: "pixel-9",
    canvasWidth: 440,
    canvasHeight: 920,
    cornerRadius: 42,
    editorMaskPath: roundedRectPath(440, 920, 42),
    overlayUrl: "/assets/phone-case/pixel-9/overlay.svg",
    mockupMaskUrl: "/assets/phone-case/pixel-9/mask.svg",
    printSpec: { widthMm: 72.0, heightMm: 152.8, dpi: 300 },
    bleedMm: 3,
    bleedPx: bleedPx(440, 72.0, 3),
  },
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export function getDeviceConfig(handle: string): DeviceConfig | null {
  return DEVICE_CONFIGS[handle] ?? null
}

export function getDefaultDevice(): DeviceConfig {
  return DEVICE_CONFIGS["iphone-15-pro"]
}

export function getAllDeviceHandles(): string[] {
  return Object.keys(DEVICE_CONFIGS)
}

/**
 * Keywords that identify each device model.
 * Order matters — more specific patterns should come first.
 */
const DEVICE_KEYWORDS: { keywords: string[]; handle: string }[] = [
  { keywords: ["iphone-16-pro", "iphone 16 pro", "i-phone-16-pro", "i-phone-16pro"], handle: "iphone-16-pro" },
  { keywords: ["iphone-15-pro", "iphone 15 pro", "i-phone-15-pro", "i-phone-15pro"], handle: "iphone-15-pro" },
  { keywords: ["iphone-14", "iphone 14", "i-phone-14", "iphone14"], handle: "iphone-14" },
  { keywords: ["samsung-s24", "samsung s24", "galaxy-s24", "galaxy s24"], handle: "samsung-s24" },
  { keywords: ["pixel-9", "pixel 9", "pixel9"], handle: "pixel-9" },
]

/**
 * Fuzzy-match a product handle, title, or description to a device config.
 * Returns the matching DeviceConfig or null if no match.
 */
export function detectDeviceFromProduct(
  productHandle?: string | null,
  productTitle?: string | null,
  productDescription?: string | null
): DeviceConfig | null {
  const haystack = [productHandle, productTitle, productDescription]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  for (const entry of DEVICE_KEYWORDS) {
    for (const kw of entry.keywords) {
      if (haystack.includes(kw)) {
        return DEVICE_CONFIGS[entry.handle] ?? null
      }
    }
  }
  return null
}

/**
 * Check whether a product is a customizable phone case.
 * Looks for "case" in the handle, title, tags, or collection names.
 */
export function isCustomizableCase(product: {
  handle?: string | null
  title?: string | null
  description?: string | null
  tags?: Array<{ value?: string }> | null
  collection?: { handle?: string; title?: string } | null
  type?: { value?: string } | null
}): boolean {
  const text = [
    product.handle,
    product.title,
    product.description,
    product.collection?.handle,
    product.collection?.title,
    product.type?.value,
    ...(product.tags?.map((t) => t.value) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  // Must contain "case" somewhere in the product data
  return text.includes("case")
}
