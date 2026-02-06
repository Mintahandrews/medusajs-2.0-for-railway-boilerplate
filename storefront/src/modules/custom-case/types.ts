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
  /** Printable area inset from edges (case edge thickness) */
  inset: { top: number; right: number; bottom: number; left: number }
  /** Border radius for the case outline */
  borderRadius: number
  /** Screen area inset (for realistic phone rendering) */
  screenInset?: { top: number; right: number; bottom: number; left: number }
  /** Screen border radius */
  screenRadius?: number
  /** Camera module bounding box */
  cameraCutout?: { x: number; y: number; width: number; height: number; radius: number }
  /** Individual camera lenses for realistic rendering */
  cameraLenses?: CameraLens[]
  /** Side button positions */
  sideButtons?: { side: "left" | "right"; y: number; height: number }[]
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

// Real phone dimensions (mm): iPhone 16 Pro Max = 163 x 77.6, iPhone 16 Pro = 149.6 x 71.5
// Scaled to canvas units keeping accurate aspect ratios
export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  // Apple — 16 series
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    width: 310,   // 77.6mm scaled
    height: 652,  // 163mm scaled (ratio 2.1:1)
    inset: { top: 14, right: 10, bottom: 14, left: 10 },
    borderRadius: 44,
    screenInset: { top: 18, right: 14, bottom: 18, left: 14 },
    screenRadius: 36,
    caseDepth: 10,
    cameraCutout: { x: 185, y: 28, width: 100, height: 100, radius: 22 },
    cameraLenses: [
      { cx: 213, cy: 56, r: 16 },
      { cx: 257, cy: 56, r: 16 },
      { cx: 235, cy: 100, r: 16 },
    ],
    sideButtons: [
      { side: "right", y: 160, height: 50 },
      { side: "left", y: 140, height: 28 },
      { side: "left", y: 195, height: 56 },
    ],
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "Apple",
    width: 286,   // 71.5mm
    height: 598,  // 149.6mm
    inset: { top: 13, right: 9, bottom: 13, left: 9 },
    borderRadius: 42,
    screenInset: { top: 17, right: 13, bottom: 17, left: 13 },
    screenRadius: 34,
    caseDepth: 10,
    cameraCutout: { x: 168, y: 26, width: 95, height: 95, radius: 20 },
    cameraLenses: [
      { cx: 194, cy: 52, r: 15 },
      { cx: 236, cy: 52, r: 15 },
      { cx: 215, cy: 94, r: 15 },
    ],
    sideButtons: [
      { side: "right", y: 148, height: 46 },
      { side: "left", y: 130, height: 26 },
      { side: "left", y: 180, height: 52 },
    ],
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    brand: "Apple",
    width: 286,
    height: 590,
    inset: { top: 13, right: 9, bottom: 13, left: 9 },
    borderRadius: 42,
    screenInset: { top: 17, right: 13, bottom: 17, left: 13 },
    screenRadius: 34,
    caseDepth: 9,
    cameraCutout: { x: 180, y: 30, width: 82, height: 82, radius: 18 },
    cameraLenses: [
      { cx: 204, cy: 52, r: 14 },
      { cx: 240, cy: 52, r: 14 },
    ],
    sideButtons: [
      { side: "right", y: 148, height: 46 },
      { side: "left", y: 130, height: 26 },
      { side: "left", y: 180, height: 52 },
    ],
  },
  // Apple — 15 series
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    width: 310,
    height: 640,
    inset: { top: 14, right: 10, bottom: 14, left: 10 },
    borderRadius: 44,
    screenInset: { top: 18, right: 14, bottom: 18, left: 14 },
    screenRadius: 36,
    caseDepth: 10,
    cameraCutout: { x: 185, y: 28, width: 100, height: 100, radius: 22 },
    cameraLenses: [
      { cx: 213, cy: 56, r: 16 },
      { cx: 257, cy: 56, r: 16 },
      { cx: 235, cy: 100, r: 16 },
    ],
    sideButtons: [
      { side: "right", y: 155, height: 50 },
      { side: "left", y: 138, height: 28 },
      { side: "left", y: 190, height: 56 },
    ],
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    brand: "Apple",
    width: 286,
    height: 580,
    inset: { top: 13, right: 9, bottom: 13, left: 9 },
    borderRadius: 42,
    screenInset: { top: 17, right: 13, bottom: 17, left: 13 },
    screenRadius: 34,
    caseDepth: 9,
    cameraCutout: { x: 175, y: 30, width: 82, height: 82, radius: 18 },
    cameraLenses: [
      { cx: 199, cy: 52, r: 14 },
      { cx: 235, cy: 52, r: 14 },
    ],
    sideButtons: [
      { side: "right", y: 148, height: 46 },
      { side: "left", y: 130, height: 26 },
      { side: "left", y: 180, height: 52 },
    ],
  },
  // Samsung
  {
    id: "samsung-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    width: 316,  // 79mm
    height: 648, // 162.3mm
    inset: { top: 14, right: 10, bottom: 14, left: 10 },
    borderRadius: 28,
    screenInset: { top: 16, right: 12, bottom: 16, left: 12 },
    screenRadius: 20,
    caseDepth: 10,
    cameraCutout: { x: 210, y: 32, width: 80, height: 130, radius: 14 },
    cameraLenses: [
      { cx: 250, cy: 58, r: 15 },
      { cx: 250, cy: 96, r: 15 },
      { cx: 250, cy: 134, r: 11 },
    ],
    sideButtons: [
      { side: "right", y: 165, height: 50 },
      { side: "right", y: 235, height: 64 },
    ],
  },
  {
    id: "samsung-s24",
    name: "Galaxy S24",
    brand: "Samsung",
    width: 284,  // 70.6mm
    height: 590, // 147mm
    inset: { top: 12, right: 9, bottom: 12, left: 9 },
    borderRadius: 30,
    screenInset: { top: 15, right: 11, bottom: 15, left: 11 },
    screenRadius: 22,
    caseDepth: 9,
    cameraCutout: { x: 190, y: 30, width: 72, height: 120, radius: 12 },
    cameraLenses: [
      { cx: 226, cy: 54, r: 14 },
      { cx: 226, cy: 90, r: 14 },
      { cx: 226, cy: 124, r: 10 },
    ],
    sideButtons: [
      { side: "right", y: 150, height: 46 },
      { side: "right", y: 216, height: 60 },
    ],
  },
  // Google
  {
    id: "pixel-9-pro",
    name: "Pixel 9 Pro",
    brand: "Google",
    width: 296,  // 73mm
    height: 612, // 152.8mm
    inset: { top: 13, right: 9, bottom: 13, left: 9 },
    borderRadius: 38,
    screenInset: { top: 16, right: 12, bottom: 16, left: 12 },
    screenRadius: 30,
    caseDepth: 10,
    cameraCutout: { x: 68, y: 26, width: 160, height: 48, radius: 24 },
    cameraLenses: [
      { cx: 110, cy: 50, r: 14 },
      { cx: 148, cy: 50, r: 14 },
      { cx: 186, cy: 50, r: 11 },
    ],
    sideButtons: [
      { side: "right", y: 155, height: 46 },
      { side: "right", y: 220, height: 60 },
    ],
  },
  {
    id: "pixel-8",
    name: "Pixel 8",
    brand: "Google",
    width: 288,
    height: 596,
    inset: { top: 12, right: 9, bottom: 12, left: 9 },
    borderRadius: 36,
    screenInset: { top: 15, right: 11, bottom: 15, left: 11 },
    screenRadius: 28,
    caseDepth: 9,
    cameraCutout: { x: 66, y: 24, width: 156, height: 44, radius: 22 },
    cameraLenses: [
      { cx: 108, cy: 46, r: 13 },
      { cx: 178, cy: 46, r: 13 },
    ],
    sideButtons: [
      { side: "right", y: 150, height: 46 },
      { side: "right", y: 216, height: 60 },
    ],
  },
]
