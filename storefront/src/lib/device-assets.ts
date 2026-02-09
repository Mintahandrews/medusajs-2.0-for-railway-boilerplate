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

/** Compact helper to build a DeviceConfig from physical dimensions (mm). */
function dev(
  handle: string,
  name: string,
  widthMm: number,
  heightMm: number,
  r: number,
  bleedMm = 3,
  pxPerMm = 6,
): DeviceConfig {
  const cw = Math.round(widthMm * pxPerMm)
  const ch = Math.round(heightMm * pxPerMm)
  return {
    name,
    handle,
    canvasWidth: cw,
    canvasHeight: ch,
    cornerRadius: r,
    editorMaskPath: roundedRectPath(cw, ch, r),
    overlayUrl: `/assets/phone-case/${handle}/overlay.png`,
    mockupMaskUrl: `/assets/phone-case/${handle}/mask.svg`,
    printSpec: { widthMm, heightMm, dpi: 300 },
    bleedMm,
    bleedPx: bleedPx(cw, widthMm, bleedMm),
  }
}

/**
 * Comprehensive device registry.
 * Physical dimensions sourced from GSMArena, Apple, Samsung, Google specs.
 * Canvas pixels ≈ 6 px/mm for a 300 DPI print-ready workspace.
 */
export const DEVICE_CONFIGS: Record<string, DeviceConfig> = {
  /* ---- iPhone 11 series (2019) ----------------------------------------- */
  //                         handle              name                    W mm    H mm    r
  "iphone-11":       dev("iphone-11",       "iPhone 11",               75.7,  150.9,  48),
  "iphone-11-pro":   dev("iphone-11-pro",   "iPhone 11 Pro",           71.4,  144.0,  48),
  "iphone-11-pro-max": dev("iphone-11-pro-max", "iPhone 11 Pro Max",   77.8,  158.0,  48),

  /* ---- iPhone 12 series (2020) ----------------------------------------- */
  "iphone-12":       dev("iphone-12",       "iPhone 12",               71.5,  146.7,  44),
  "iphone-12-mini":  dev("iphone-12-mini",  "iPhone 12 mini",          64.2,  131.5,  44),
  "iphone-12-pro":   dev("iphone-12-pro",   "iPhone 12 Pro",           71.5,  146.7,  44),
  "iphone-12-pro-max": dev("iphone-12-pro-max", "iPhone 12 Pro Max",   78.1,  160.8,  44),

  /* ---- iPhone 13 series (2021) ----------------------------------------- */
  "iphone-13":       dev("iphone-13",       "iPhone 13",               71.5,  146.7,  44),
  "iphone-13-mini":  dev("iphone-13-mini",  "iPhone 13 mini",          64.2,  131.5,  44),
  "iphone-13-pro":   dev("iphone-13-pro",   "iPhone 13 Pro",           71.5,  146.7,  44),
  "iphone-13-pro-max": dev("iphone-13-pro-max", "iPhone 13 Pro Max",   78.1,  160.8,  44),

  /* ---- iPhone 14 series (2022) ----------------------------------------- */
  "iphone-14":       dev("iphone-14",       "iPhone 14",               71.5,  146.7,  44),
  "iphone-14-plus":  dev("iphone-14-plus",  "iPhone 14 Plus",          78.1,  160.8,  44),
  "iphone-14-pro":   dev("iphone-14-pro",   "iPhone 14 Pro",           71.5,  147.5,  44),
  "iphone-14-pro-max": dev("iphone-14-pro-max", "iPhone 14 Pro Max",   77.6,  160.7,  44),

  /* ---- iPhone 15 series (2023) ----------------------------------------- */
  "iphone-15":       dev("iphone-15",       "iPhone 15",               71.6,  147.6,  45),
  "iphone-15-plus":  dev("iphone-15-plus",  "iPhone 15 Plus",          77.8,  160.9,  45),
  "iphone-15-pro":   dev("iphone-15-pro",   "iPhone 15 Pro",           70.6,  146.6,  45),
  "iphone-15-pro-max": dev("iphone-15-pro-max", "iPhone 15 Pro Max",   76.7,  159.9,  45),

  /* ---- iPhone 16 series (2024) ----------------------------------------- */
  "iphone-16":       dev("iphone-16",       "iPhone 16",               71.6,  147.6,  48),
  "iphone-16-plus":  dev("iphone-16-plus",  "iPhone 16 Plus",          77.8,  160.9,  48),
  "iphone-16-pro":   dev("iphone-16-pro",   "iPhone 16 Pro",           71.5,  149.6,  48),
  "iphone-16-pro-max": dev("iphone-16-pro-max", "iPhone 16 Pro Max",   77.6,  163.0,  48),

  /* ---- Samsung Galaxy S series ----------------------------------------- */
  "samsung-s23":     dev("samsung-s23",     "Samsung Galaxy S23",       70.9,  146.3,  48),
  "samsung-s23-ultra": dev("samsung-s23-ultra", "Samsung Galaxy S23 Ultra", 78.1, 163.4, 33),
  "samsung-s24":     dev("samsung-s24",     "Samsung Galaxy S24",       70.6,  147.0,  48),
  "samsung-s24-ultra": dev("samsung-s24-ultra", "Samsung Galaxy S24 Ultra", 79.0, 162.3, 36),
  "samsung-s25":     dev("samsung-s25",     "Samsung Galaxy S25",       70.1,  146.9,  51),
  "samsung-s25-ultra": dev("samsung-s25-ultra", "Samsung Galaxy S25 Ultra", 77.6, 162.8, 48),

  /* ---- Google Pixel series --------------------------------------------- */
  "pixel-8":         dev("pixel-8",         "Google Pixel 8",           70.8,  150.5,  54),
  "pixel-8-pro":     dev("pixel-8-pro",     "Google Pixel 8 Pro",       76.5,  162.6,  60),
  "pixel-9":         dev("pixel-9",         "Google Pixel 9",           72.0,  152.8,  54),
  "pixel-9-pro":     dev("pixel-9-pro",     "Google Pixel 9 Pro",       72.0,  152.8,  54),
  "pixel-9-pro-xl":  dev("pixel-9-pro-xl",  "Google Pixel 9 Pro XL",    76.6,  162.8,  54),
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
 * Fuzzy-match a product handle, title, or description to a device config.
 * Handles product handles like "iphone-15-pro-designer-cases",
 * "i-phone-12pro-cases", "samsung-s24-ultra-case", "pixel-9-pro-case", etc.
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
    // normalise separators: "i-phone" → "iphone", "galaxy-s" → "galaxys"
    .replace(/i-phone/g, "iphone")
    .replace(/galaxy[\s-]?s/g, "galaxys")

  // --- iPhone detection ---
  // Captures model number + optional "mini", "pro", "plus", "max" variants
  const iphoneMatch = haystack.match(
    /iphone[\s-]?(\d{2,})[\s-]?(mini|pro)?[\s-]?(max|plus)?/
  )
  if (iphoneMatch) {
    const model = parseInt(iphoneMatch[1], 10)
    const isPro = iphoneMatch[2] === "pro"
    const isMini = iphoneMatch[2] === "mini"
    const isMax = iphoneMatch[3] === "max"
    const isPlus = iphoneMatch[3] === "plus"

    // Build the ideal handle
    let suffix = ""
    if (isMini) suffix = "-mini"
    else if (isPro && isMax) suffix = "-pro-max"
    else if (isPro) suffix = "-pro"
    else if (isPlus) suffix = "-plus"

    // Try exact model match first
    const exact = DEVICE_CONFIGS[`iphone-${model}${suffix}`]
    if (exact) return exact

    // Fallback: map to closest available generation
    const clamp = Math.max(11, Math.min(model, 16))
    const fallback = DEVICE_CONFIGS[`iphone-${clamp}${suffix}`]
      ?? DEVICE_CONFIGS[`iphone-${clamp}`]
    if (fallback) return fallback

    // Last resort
    return DEVICE_CONFIGS["iphone-15-pro"]
  }

  // --- Samsung detection ---
  // Matches "samsung s24 ultra", "galaxys25", "galaxy-s23-ultra", etc.
  const samsungMatch = haystack.match(
    /(?:samsung|galaxys)[\s-]?(\d{2,})[\s-]?(ultra|plus|\+)?/
  )
  if (samsungMatch) {
    const model = parseInt(samsungMatch[1], 10)
    const isUltra = samsungMatch[2] === "ultra"
    const suffix = isUltra ? "-ultra" : ""
    const clamp = Math.max(23, Math.min(model, 25))
    return DEVICE_CONFIGS[`samsung-s${clamp}${suffix}`]
      ?? DEVICE_CONFIGS["samsung-s24"]
  }

  // --- Pixel detection ---
  // Matches "pixel 9 pro xl", "pixel-8-pro", "pixel9", etc.
  const pixelMatch = haystack.match(
    /pixel[\s-]?(\d+)[\s-]?(pro)?[\s-]?(xl)?/
  )
  if (pixelMatch) {
    const model = parseInt(pixelMatch[1], 10)
    const isPro = !!pixelMatch[2]
    const isXl = !!pixelMatch[3]
    let suffix = ""
    if (isPro && isXl) suffix = "-pro-xl"
    else if (isPro) suffix = "-pro"
    const clamp = Math.max(8, Math.min(model, 9))
    return DEVICE_CONFIGS[`pixel-${clamp}${suffix}`]
      ?? DEVICE_CONFIGS[`pixel-${clamp}`]
      ?? DEVICE_CONFIGS["pixel-9"]
  }

  return null
}

/**
 * Check whether a product is a customizable phone case.
 *
 * A product qualifies when BOTH conditions are met:
 *  1. A known device model can be detected from the product data
 *     (via detectDeviceFromProduct — matches iPhone, Samsung Galaxy, Pixel).
 *  2. The product data contains a phone-case-related keyword
 *     ("case", "cover", "shell", "bumper", "sleeve", "protector").
 *
 * This two-pronged check prevents false positives on non-case products
 * that happen to mention a phone model, and non-phone products that
 * happen to contain the word "case".
 */
export function isCustomizableCase(product: {
  handle?: string | null
  title?: string | null
  description?: string | null
  tags?: Array<{ value?: string }> | null
  collection?: { handle?: string; title?: string } | null
  type?: { value?: string } | null
}): boolean {
  // 1. Must match a known device
  const device = detectDeviceFromProduct(
    product.handle,
    product.title,
    product.description
  )
  if (!device) return false

  // 2. Must contain a phone-case keyword
  const text = [
    product.handle,
    product.title,
    product.collection?.handle,
    product.collection?.title,
    product.type?.value,
    ...(product.tags?.map((t) => t.value) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const caseKeywords = ["case", "cover", "shell", "bumper", "sleeve", "protector", "customiz"]
  return caseKeywords.some((kw) => text.includes(kw))
}
