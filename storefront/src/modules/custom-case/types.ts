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
  /** Printable area inset from edges */
  inset: { top: number; right: number; bottom: number; left: number }
  /** Border radius for the case outline */
  borderRadius: number
  /** Camera module bounding box */
  cameraCutout?: { x: number; y: number; width: number; height: number; radius: number }
  /** Individual camera lenses for realistic rendering */
  cameraLenses?: CameraLens[]
  /** Side button positions */
  sideButtons?: { side: "left" | "right"; y: number; height: number }[]
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

export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  // Apple
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    width: 360,
    height: 750,
    inset: { top: 44, right: 22, bottom: 44, left: 22 },
    borderRadius: 50,
    cameraCutout: { x: 220, y: 42, width: 110, height: 110, radius: 24 },
    cameraLenses: [
      { cx: 252, cy: 74, r: 18 },
      { cx: 298, cy: 74, r: 18 },
      { cx: 275, cy: 120, r: 18 },
    ],
    sideButtons: [
      { side: "right", y: 180, height: 50 },
      { side: "left", y: 160, height: 30 },
      { side: "left", y: 220, height: 60 },
    ],
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "Apple",
    width: 340,
    height: 720,
    inset: { top: 42, right: 20, bottom: 42, left: 20 },
    borderRadius: 48,
    cameraCutout: { x: 210, y: 40, width: 105, height: 105, radius: 22 },
    cameraLenses: [
      { cx: 242, cy: 70, r: 17 },
      { cx: 284, cy: 70, r: 17 },
      { cx: 263, cy: 114, r: 17 },
    ],
    sideButtons: [
      { side: "right", y: 170, height: 48 },
      { side: "left", y: 150, height: 28 },
      { side: "left", y: 210, height: 56 },
    ],
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    brand: "Apple",
    width: 340,
    height: 710,
    inset: { top: 40, right: 20, bottom: 40, left: 20 },
    borderRadius: 46,
    cameraCutout: { x: 220, y: 44, width: 90, height: 90, radius: 20 },
    cameraLenses: [
      { cx: 248, cy: 66, r: 16 },
      { cx: 286, cy: 66, r: 16 },
    ],
    sideButtons: [
      { side: "right", y: 170, height: 48 },
      { side: "left", y: 150, height: 28 },
      { side: "left", y: 210, height: 56 },
    ],
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    width: 360,
    height: 740,
    inset: { top: 44, right: 22, bottom: 44, left: 22 },
    borderRadius: 48,
    cameraCutout: { x: 218, y: 42, width: 108, height: 108, radius: 24 },
    cameraLenses: [
      { cx: 250, cy: 72, r: 17 },
      { cx: 294, cy: 72, r: 17 },
      { cx: 272, cy: 118, r: 17 },
    ],
    sideButtons: [
      { side: "right", y: 180, height: 50 },
      { side: "left", y: 160, height: 30 },
      { side: "left", y: 220, height: 60 },
    ],
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    brand: "Apple",
    width: 340,
    height: 700,
    inset: { top: 40, right: 20, bottom: 40, left: 20 },
    borderRadius: 44,
    cameraCutout: { x: 215, y: 44, width: 90, height: 90, radius: 20 },
    cameraLenses: [
      { cx: 242, cy: 66, r: 16 },
      { cx: 280, cy: 66, r: 16 },
    ],
    sideButtons: [
      { side: "right", y: 170, height: 48 },
      { side: "left", y: 150, height: 28 },
      { side: "left", y: 210, height: 56 },
    ],
  },
  // Samsung
  {
    id: "samsung-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    width: 360,
    height: 750,
    inset: { top: 44, right: 22, bottom: 44, left: 22 },
    borderRadius: 32,
    cameraCutout: { x: 240, y: 40, width: 90, height: 140, radius: 16 },
    cameraLenses: [
      { cx: 285, cy: 68, r: 16 },
      { cx: 285, cy: 110, r: 16 },
      { cx: 285, cy: 152, r: 12 },
    ],
    sideButtons: [
      { side: "right", y: 190, height: 50 },
      { side: "right", y: 260, height: 70 },
    ],
  },
  {
    id: "samsung-s24",
    name: "Galaxy S24",
    brand: "Samsung",
    width: 340,
    height: 710,
    inset: { top: 40, right: 20, bottom: 40, left: 20 },
    borderRadius: 36,
    cameraCutout: { x: 230, y: 38, width: 80, height: 130, radius: 14 },
    cameraLenses: [
      { cx: 270, cy: 64, r: 15 },
      { cx: 270, cy: 104, r: 15 },
      { cx: 270, cy: 142, r: 11 },
    ],
    sideButtons: [
      { side: "right", y: 180, height: 48 },
      { side: "right", y: 248, height: 64 },
    ],
  },
  // Google
  {
    id: "pixel-9-pro",
    name: "Pixel 9 Pro",
    brand: "Google",
    width: 345,
    height: 720,
    inset: { top: 42, right: 20, bottom: 42, left: 20 },
    borderRadius: 40,
    cameraCutout: { x: 80, y: 38, width: 185, height: 55, radius: 28 },
    cameraLenses: [
      { cx: 130, cy: 65, r: 16 },
      { cx: 172, cy: 65, r: 16 },
      { cx: 214, cy: 65, r: 12 },
    ],
    sideButtons: [
      { side: "right", y: 180, height: 48 },
      { side: "right", y: 250, height: 64 },
    ],
  },
  {
    id: "pixel-8",
    name: "Pixel 8",
    brand: "Google",
    width: 340,
    height: 700,
    inset: { top: 40, right: 20, bottom: 40, left: 20 },
    borderRadius: 38,
    cameraCutout: { x: 80, y: 36, width: 180, height: 50, radius: 25 },
    cameraLenses: [
      { cx: 130, cy: 62, r: 15 },
      { cx: 205, cy: 62, r: 15 },
    ],
    sideButtons: [
      { side: "right", y: 180, height: 48 },
      { side: "right", y: 248, height: 64 },
    ],
  },
]
