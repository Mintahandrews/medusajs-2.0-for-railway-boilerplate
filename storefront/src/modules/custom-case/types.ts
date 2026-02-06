export type CameraLens = {
  cx: number
  cy: number
  r: number
}

export type DeviceTemplate = {
  id: string
  name: string
  brand: string
  /** Canvas width in px */
  width: number
  /** Canvas height in px */
  height: number
  /** Physical device size in mm (for reference / verification) */
  physicalSize?: { height: number; width: number; depth: number }
  /** Printable area inset from edges (case edge thickness) */
  inset: { top: number; right: number; bottom: number; left: number }
  /** Border radius for the case outline */
  borderRadius: number
  /** Screen area inset (for realistic phone rendering) */
  screenInset?: { top: number; right: number; bottom: number; left: number }
  /** Screen border radius */
  screenRadius?: number
  /** Camera rendering style: "module" = square/pill island, "individual" = separate lens cutouts, "bar" = horizontal visor */
  cameraStyle?: "module" | "individual" | "bar"
  /** Camera module bounding box */
  cameraCutout?: { x: number; y: number; width: number; height: number; radius: number }
  /** Individual camera lenses for realistic rendering */
  cameraLenses?: CameraLens[]
  /** Side button positions */
  sideButtons?: { side: "left" | "right"; y: number; height: number }[]
  /** USB-C / Lightning port cutout at the bottom edge */
  portCutout?: { x: number; y: number; width: number; height: number; radius: number }
  /** Case depth in px for 3D rendering */
  caseDepth?: number
}

export type PatternTemplate = {
  id: string
  name: string
  /** CSS gradient or pattern */
  css: string
  /** Fabric.js-compatible fill for canvas */
  type: "gradient" | "solid"
  colors: string[]
}

export type StickerItem = {
  id: string
  emoji: string
  label: string
}

export type DesignState = {
  device: DeviceTemplate
  backgroundColor: string
  canvasJSON: string | null
  previewDataUrl: string | null
}

export const FONT_OPTIONS = [
  { id: "inter", name: "Inter", family: "Inter, sans-serif" },
  { id: "playfair", name: "Playfair", family: "'Playfair Display', serif" },
  { id: "mono", name: "Mono", family: "'JetBrains Mono', monospace" },
  { id: "cursive", name: "Script", family: "'Dancing Script', cursive" },
  { id: "bebas", name: "Bebas", family: "'Bebas Neue', sans-serif" },
  { id: "lobster", name: "Lobster", family: "'Lobster', cursive" },
  { id: "oswald", name: "Oswald", family: "'Oswald', sans-serif" },
  { id: "pacifico", name: "Pacifico", family: "'Pacifico', cursive" },
]

export const CASE_COLORS = [
  "#FFFFFF", "#000000", "#F87171", "#FB923C", "#FACC15",
  "#4ADE80", "#5DABA6", "#60A5FA", "#A78BFA", "#F472B6",
  "#E5E7EB", "#1E293B", "#DC2626", "#EA580C", "#CA8A04",
  "#16A34A", "#3D8B87", "#2563EB", "#7C3AED", "#DB2777",
]

export const GRADIENT_PRESETS: PatternTemplate[] = [
  { id: "sunset", name: "Sunset", css: "linear-gradient(135deg, #ff6b6b, #feca57)", type: "gradient", colors: ["#ff6b6b", "#feca57"] },
  { id: "ocean", name: "Ocean", css: "linear-gradient(135deg, #667eea, #764ba2)", type: "gradient", colors: ["#667eea", "#764ba2"] },
  { id: "mint", name: "Mint", css: "linear-gradient(135deg, #11998e, #38ef7d)", type: "gradient", colors: ["#11998e", "#38ef7d"] },
  { id: "flamingo", name: "Flamingo", css: "linear-gradient(135deg, #ee9ca7, #ffdde1)", type: "gradient", colors: ["#ee9ca7", "#ffdde1"] },
  { id: "midnight", name: "Midnight", css: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", type: "gradient", colors: ["#0f0c29", "#302b63", "#24243e"] },
  { id: "cherry", name: "Cherry", css: "linear-gradient(135deg, #eb3349, #f45c43)", type: "gradient", colors: ["#eb3349", "#f45c43"] },
  { id: "sky", name: "Sky", css: "linear-gradient(135deg, #89f7fe, #66a6ff)", type: "gradient", colors: ["#89f7fe", "#66a6ff"] },
  { id: "lavender", name: "Lavender", css: "linear-gradient(135deg, #c471f5, #fa71cd)", type: "gradient", colors: ["#c471f5", "#fa71cd"] },
  { id: "gold", name: "Gold", css: "linear-gradient(135deg, #f7971e, #ffd200)", type: "gradient", colors: ["#f7971e", "#ffd200"] },
  { id: "forest", name: "Forest", css: "linear-gradient(135deg, #134e5e, #71b280)", type: "gradient", colors: ["#134e5e", "#71b280"] },
  { id: "rose-gold", name: "Rose Gold", css: "linear-gradient(135deg, #b76e79, #e8c4a0)", type: "gradient", colors: ["#b76e79", "#e8c4a0"] },
  { id: "arctic", name: "Arctic", css: "linear-gradient(135deg, #dfe6e9, #b2bec3)", type: "gradient", colors: ["#dfe6e9", "#b2bec3"] },
]

export const STICKER_PACKS: { category: string; stickers: StickerItem[] }[] = [
  {
    category: "Smileys",
    stickers: [
      { id: "s1", emoji: "😀", label: "Grinning" },
      { id: "s2", emoji: "😎", label: "Cool" },
      { id: "s3", emoji: "🥰", label: "Love" },
      { id: "s4", emoji: "😂", label: "Laughing" },
      { id: "s5", emoji: "🤩", label: "Star eyes" },
      { id: "s6", emoji: "😇", label: "Angel" },
    ],
  },
  {
    category: "Nature",
    stickers: [
      { id: "n1", emoji: "🌸", label: "Blossom" },
      { id: "n2", emoji: "🌈", label: "Rainbow" },
      { id: "n3", emoji: "🦋", label: "Butterfly" },
      { id: "n4", emoji: "🌺", label: "Hibiscus" },
      { id: "n5", emoji: "🍀", label: "Clover" },
      { id: "n6", emoji: "🌙", label: "Moon" },
    ],
  },
  {
    category: "Symbols",
    stickers: [
      { id: "y1", emoji: "⭐", label: "Star" },
      { id: "y2", emoji: "❤️", label: "Heart" },
      { id: "y3", emoji: "🔥", label: "Fire" },
      { id: "y4", emoji: "💎", label: "Diamond" },
      { id: "y5", emoji: "✨", label: "Sparkles" },
      { id: "y6", emoji: "💫", label: "Dizzy" },
      { id: "y7", emoji: "🎵", label: "Music" },
      { id: "y8", emoji: "👑", label: "Crown" },
    ],
  },
  {
    category: "Food",
    stickers: [
      { id: "f1", emoji: "🍕", label: "Pizza" },
      { id: "f2", emoji: "🍩", label: "Donut" },
      { id: "f3", emoji: "🍦", label: "Ice cream" },
      { id: "f4", emoji: "🧁", label: "Cupcake" },
      { id: "f5", emoji: "🍓", label: "Strawberry" },
      { id: "f6", emoji: "🥑", label: "Avocado" },
    ],
  },
  {
    category: "Travel",
    stickers: [
      { id: "t1", emoji: "✈️", label: "Plane" },
      { id: "t2", emoji: "🏝️", label: "Island" },
      { id: "t3", emoji: "🗺️", label: "Map" },
      { id: "t4", emoji: "🌍", label: "Globe" },
      { id: "t5", emoji: "⛰️", label: "Mountain" },
      { id: "t6", emoji: "🏖️", label: "Beach" },
    ],
  },
]

/*
 * ── DEVICE TEMPLATES ───────────────────────────────────────────────────
 *
 * All canvas dimensions derived from official specs at **4 px per mm**.
 * Camera cutouts are positioned for the BACK of the phone (case design view).
 * Case edge adds ~2 mm (8 px) inset on each side.
 *
 * Sources:
 *   Apple — support.apple.com/en-us/111829, /121030, /121031, /121032
 *   Samsung — gsmarena.com, samsung.com/specs
 *   Google — store.google.com/product/pixel_*_specs
 */
export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  // ── Apple · iPhone 16 series ───────────────────────────────────────

  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    width: 310,
    height: 652,
    physicalSize: { height: 163.0, width: 77.6, depth: 8.25 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 44,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 36,
    caseDepth: 10,
    cameraStyle: "module",
    cameraCutout: { x: 18, y: 26, width: 148, height: 148, radius: 28 },
    cameraLenses: [
      { cx: 56, cy: 64, r: 16 },   // Main 48 MP
      { cx: 128, cy: 64, r: 16 },  // Ultra Wide
      { cx: 92, cy: 136, r: 16 },  // 5× Telephoto
    ],
    sideButtons: [
      { side: "right", y: 258, height: 80 },  // Side button
      { side: "right", y: 390, height: 32 },  // Camera Control
      { side: "left", y: 230, height: 24 },   // Action button
      { side: "left", y: 270, height: 40 },   // Volume Up
      { side: "left", y: 320, height: 40 },   // Volume Down
    ],
    portCutout: { x: 137, y: 648, width: 36, height: 4, radius: 2 },
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "Apple",
    width: 286,
    height: 598,
    physicalSize: { height: 149.6, width: 71.5, depth: 8.25 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 42,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 34,
    caseDepth: 10,
    cameraStyle: "module",
    cameraCutout: { x: 16, y: 24, width: 140, height: 140, radius: 26 },
    cameraLenses: [
      { cx: 52, cy: 60, r: 15 },
      { cx: 120, cy: 60, r: 15 },
      { cx: 86, cy: 128, r: 15 },
    ],
    sideButtons: [
      { side: "right", y: 236, height: 74 },
      { side: "right", y: 358, height: 30 },
      { side: "left", y: 210, height: 22 },
      { side: "left", y: 246, height: 36 },
      { side: "left", y: 292, height: 36 },
    ],
    portCutout: { x: 125, y: 594, width: 36, height: 4, radius: 2 },
  },
  {
    id: "iphone-16-plus",
    name: "iPhone 16 Plus",
    brand: "Apple",
    width: 311,
    height: 644,
    physicalSize: { height: 160.9, width: 77.8, depth: 7.80 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 44,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 36,
    caseDepth: 9,
    cameraStyle: "module",
    cameraCutout: { x: 20, y: 28, width: 70, height: 140, radius: 35 },
    cameraLenses: [
      { cx: 55, cy: 68, r: 15 },
      { cx: 55, cy: 128, r: 15 },
    ],
    sideButtons: [
      { side: "right", y: 250, height: 78 },
      { side: "right", y: 380, height: 30 },
      { side: "left", y: 252, height: 38 },
      { side: "left", y: 300, height: 38 },
    ],
    portCutout: { x: 138, y: 640, width: 36, height: 4, radius: 2 },
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    brand: "Apple",
    width: 286,
    height: 590,
    physicalSize: { height: 147.6, width: 71.6, depth: 7.80 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 42,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 34,
    caseDepth: 9,
    cameraStyle: "module",
    cameraCutout: { x: 18, y: 26, width: 66, height: 132, radius: 33 },
    cameraLenses: [
      { cx: 51, cy: 62, r: 14 },
      { cx: 51, cy: 120, r: 14 },
    ],
    sideButtons: [
      { side: "right", y: 230, height: 72 },
      { side: "right", y: 352, height: 28 },
      { side: "left", y: 232, height: 36 },
      { side: "left", y: 278, height: 36 },
    ],
    portCutout: { x: 125, y: 586, width: 36, height: 4, radius: 2 },
  },

  // ── Apple · iPhone 15 series ───────────────────────────────────────

  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    width: 307,
    height: 640,
    physicalSize: { height: 159.9, width: 76.7, depth: 8.25 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 44,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 36,
    caseDepth: 10,
    cameraStyle: "module",
    cameraCutout: { x: 18, y: 26, width: 146, height: 146, radius: 28 },
    cameraLenses: [
      { cx: 56, cy: 64, r: 15 },
      { cx: 128, cy: 64, r: 15 },
      { cx: 92, cy: 134, r: 15 },
    ],
    sideButtons: [
      { side: "right", y: 252, height: 78 },
      { side: "left", y: 224, height: 22 },
      { side: "left", y: 260, height: 38 },
      { side: "left", y: 308, height: 38 },
    ],
    portCutout: { x: 136, y: 636, width: 36, height: 4, radius: 2 },
  },
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    brand: "Apple",
    width: 282,
    height: 586,
    physicalSize: { height: 146.6, width: 70.6, depth: 8.25 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 42,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 34,
    caseDepth: 10,
    cameraStyle: "module",
    cameraCutout: { x: 16, y: 24, width: 136, height: 136, radius: 26 },
    cameraLenses: [
      { cx: 50, cy: 58, r: 14 },
      { cx: 118, cy: 58, r: 14 },
      { cx: 84, cy: 124, r: 14 },
    ],
    sideButtons: [
      { side: "right", y: 230, height: 72 },
      { side: "left", y: 206, height: 20 },
      { side: "left", y: 240, height: 34 },
      { side: "left", y: 284, height: 34 },
    ],
    portCutout: { x: 123, y: 582, width: 36, height: 4, radius: 2 },
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    brand: "Apple",
    width: 286,
    height: 590,
    physicalSize: { height: 147.6, width: 71.6, depth: 7.80 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 42,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 34,
    caseDepth: 9,
    cameraStyle: "module",
    cameraCutout: { x: 18, y: 28, width: 88, height: 88, radius: 20 },
    cameraLenses: [
      { cx: 44, cy: 54, r: 14 },
      { cx: 80, cy: 90, r: 14 },
    ],
    sideButtons: [
      { side: "right", y: 230, height: 72 },
      { side: "left", y: 228, height: 10 },
      { side: "left", y: 252, height: 36 },
      { side: "left", y: 298, height: 36 },
    ],
    portCutout: { x: 125, y: 586, width: 36, height: 4, radius: 2 },
  },

  // ── Samsung · Galaxy S series ──────────────────────────────────────

  {
    id: "samsung-s25-ultra",
    name: "Galaxy S25 Ultra",
    brand: "Samsung",
    width: 310,
    height: 651,
    physicalSize: { height: 162.8, width: 77.6, depth: 8.20 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 32,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 24,
    caseDepth: 10,
    cameraStyle: "individual",
    cameraCutout: { x: 16, y: 28, width: 52, height: 210, radius: 10 },
    cameraLenses: [
      { cx: 42, cy: 60, r: 16 },   // 200 MP Main
      { cx: 42, cy: 108, r: 15 },  // Ultra Wide
      { cx: 42, cy: 154, r: 12 },  // 5× Tele
      { cx: 42, cy: 194, r: 10 },  // 3× Tele
    ],
    sideButtons: [
      { side: "right", y: 260, height: 48 },
      { side: "right", y: 320, height: 72 },
    ],
    portCutout: { x: 137, y: 647, width: 36, height: 4, radius: 2 },
  },
  {
    id: "samsung-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    width: 316,
    height: 649,
    physicalSize: { height: 162.3, width: 79.0, depth: 8.60 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 28,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 20,
    caseDepth: 10,
    cameraStyle: "individual",
    cameraCutout: { x: 16, y: 30, width: 52, height: 200, radius: 10 },
    cameraLenses: [
      { cx: 42, cy: 62, r: 15 },
      { cx: 42, cy: 106, r: 15 },
      { cx: 42, cy: 150, r: 12 },
      { cx: 42, cy: 190, r: 10 },
    ],
    sideButtons: [
      { side: "right", y: 258, height: 48 },
      { side: "right", y: 318, height: 72 },
    ],
    portCutout: { x: 140, y: 645, width: 36, height: 4, radius: 2 },
  },
  {
    id: "samsung-s24-plus",
    name: "Galaxy S24+",
    brand: "Samsung",
    width: 304,
    height: 634,
    physicalSize: { height: 158.5, width: 75.9, depth: 7.70 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 28,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 20,
    caseDepth: 9,
    cameraStyle: "individual",
    cameraCutout: { x: 14, y: 28, width: 48, height: 180, radius: 10 },
    cameraLenses: [
      { cx: 38, cy: 58, r: 14 },
      { cx: 38, cy: 100, r: 14 },
      { cx: 38, cy: 140, r: 11 },
    ],
    sideButtons: [
      { side: "right", y: 248, height: 46 },
      { side: "right", y: 306, height: 68 },
    ],
    portCutout: { x: 134, y: 630, width: 36, height: 4, radius: 2 },
  },
  {
    id: "samsung-s24",
    name: "Galaxy S24",
    brand: "Samsung",
    width: 282,
    height: 588,
    physicalSize: { height: 147.0, width: 70.6, depth: 7.60 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 28,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 20,
    caseDepth: 9,
    cameraStyle: "individual",
    cameraCutout: { x: 14, y: 28, width: 46, height: 170, radius: 10 },
    cameraLenses: [
      { cx: 37, cy: 56, r: 13 },
      { cx: 37, cy: 96, r: 13 },
      { cx: 37, cy: 134, r: 10 },
    ],
    sideButtons: [
      { side: "right", y: 230, height: 44 },
      { side: "right", y: 286, height: 64 },
    ],
    portCutout: { x: 123, y: 584, width: 36, height: 4, radius: 2 },
  },

  // ── Google · Pixel series ──────────────────────────────────────────

  {
    id: "pixel-9-pro-xl",
    name: "Pixel 9 Pro XL",
    brand: "Google",
    width: 306,
    height: 651,
    physicalSize: { height: 162.8, width: 76.6, depth: 8.50 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 40,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 32,
    caseDepth: 10,
    cameraStyle: "bar",
    cameraCutout: { x: 36, y: 24, width: 234, height: 56, radius: 28 },
    cameraLenses: [
      { cx: 88, cy: 52, r: 14 },
      { cx: 148, cy: 52, r: 14 },
      { cx: 208, cy: 52, r: 11 },
    ],
    sideButtons: [
      { side: "right", y: 260, height: 48 },
      { side: "right", y: 322, height: 64 },
    ],
    portCutout: { x: 135, y: 647, width: 36, height: 4, radius: 2 },
  },
  {
    id: "pixel-9-pro",
    name: "Pixel 9 Pro",
    brand: "Google",
    width: 288,
    height: 611,
    physicalSize: { height: 152.8, width: 71.9, depth: 8.50 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 40,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 32,
    caseDepth: 10,
    cameraStyle: "bar",
    cameraCutout: { x: 32, y: 22, width: 224, height: 52, radius: 26 },
    cameraLenses: [
      { cx: 82, cy: 48, r: 13 },
      { cx: 140, cy: 48, r: 13 },
      { cx: 198, cy: 48, r: 10 },
    ],
    sideButtons: [
      { side: "right", y: 244, height: 44 },
      { side: "right", y: 300, height: 60 },
    ],
    portCutout: { x: 126, y: 607, width: 36, height: 4, radius: 2 },
  },
  {
    id: "pixel-9",
    name: "Pixel 9",
    brand: "Google",
    width: 288,
    height: 610,
    physicalSize: { height: 152.4, width: 72.0, depth: 8.50 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 40,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 32,
    caseDepth: 9,
    cameraStyle: "bar",
    cameraCutout: { x: 40, y: 22, width: 208, height: 52, radius: 26 },
    cameraLenses: [
      { cx: 96, cy: 48, r: 13 },
      { cx: 192, cy: 48, r: 13 },
    ],
    sideButtons: [
      { side: "right", y: 242, height: 44 },
      { side: "right", y: 298, height: 60 },
    ],
    portCutout: { x: 126, y: 606, width: 36, height: 4, radius: 2 },
  },
  {
    id: "pixel-8-pro",
    name: "Pixel 8 Pro",
    brand: "Google",
    width: 306,
    height: 650,
    physicalSize: { height: 162.6, width: 76.5, depth: 8.80 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 40,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 32,
    caseDepth: 10,
    cameraStyle: "bar",
    cameraCutout: { x: 34, y: 22, width: 238, height: 54, radius: 27 },
    cameraLenses: [
      { cx: 86, cy: 49, r: 14 },
      { cx: 148, cy: 49, r: 14 },
      { cx: 210, cy: 49, r: 11 },
    ],
    sideButtons: [
      { side: "right", y: 258, height: 46 },
      { side: "right", y: 316, height: 62 },
    ],
    portCutout: { x: 135, y: 646, width: 36, height: 4, radius: 2 },
  },
  {
    id: "pixel-8",
    name: "Pixel 8",
    brand: "Google",
    width: 283,
    height: 602,
    physicalSize: { height: 150.5, width: 70.8, depth: 8.90 },
    inset: { top: 8, right: 8, bottom: 8, left: 8 },
    borderRadius: 40,
    screenInset: { top: 12, right: 12, bottom: 12, left: 12 },
    screenRadius: 32,
    caseDepth: 9,
    cameraStyle: "bar",
    cameraCutout: { x: 34, y: 22, width: 215, height: 50, radius: 25 },
    cameraLenses: [
      { cx: 86, cy: 47, r: 13 },
      { cx: 193, cy: 47, r: 13 },
    ],
    sideButtons: [
      { side: "right", y: 240, height: 44 },
      { side: "right", y: 296, height: 58 },
    ],
    portCutout: { x: 124, y: 598, width: 36, height: 4, radius: 2 },
  },
]
