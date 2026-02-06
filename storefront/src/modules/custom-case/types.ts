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
  /** Camera cutout position & size (optional) */
  cameraCutout?: { x: number; y: number; width: number; height: number; radius: number }
}

export type DesignState = {
  device: DeviceTemplate
  backgroundColor: string
  canvasJSON: string | null
  previewDataUrl: string | null
}

export const CASE_COLORS = [
  "#FFFFFF", "#000000", "#F87171", "#FB923C", "#FACC15",
  "#4ADE80", "#5DABA6", "#60A5FA", "#A78BFA", "#F472B6",
  "#E5E7EB", "#1E293B", "#DC2626", "#EA580C", "#CA8A04",
  "#16A34A", "#3D8B87", "#2563EB", "#7C3AED", "#DB2777",
]

export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "iphone-15",
    name: "iPhone 15",
    brand: "Apple",
    width: 340,
    height: 700,
    inset: { top: 40, right: 20, bottom: 40, left: 20 },
    borderRadius: 44,
    cameraCutout: { x: 220, y: 50, width: 80, height: 80, radius: 40 },
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    width: 360,
    height: 740,
    inset: { top: 44, right: 22, bottom: 44, left: 22 },
    borderRadius: 48,
    cameraCutout: { x: 230, y: 50, width: 90, height: 90, radius: 45 },
  },
  {
    id: "iphone-14",
    name: "iPhone 14",
    brand: "Apple",
    width: 335,
    height: 690,
    inset: { top: 38, right: 20, bottom: 38, left: 20 },
    borderRadius: 42,
    cameraCutout: { x: 215, y: 48, width: 78, height: 78, radius: 39 },
  },
  {
    id: "samsung-s24",
    name: "Galaxy S24",
    brand: "Samsung",
    width: 340,
    height: 710,
    inset: { top: 40, right: 20, bottom: 40, left: 20 },
    borderRadius: 36,
    cameraCutout: { x: 225, y: 45, width: 85, height: 85, radius: 20 },
  },
  {
    id: "samsung-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    width: 360,
    height: 750,
    inset: { top: 44, right: 22, bottom: 44, left: 22 },
    borderRadius: 32,
    cameraCutout: { x: 235, y: 48, width: 90, height: 90, radius: 22 },
  },
  {
    id: "pixel-8",
    name: "Pixel 8",
    brand: "Google",
    width: 340,
    height: 700,
    inset: { top: 40, right: 20, bottom: 40, left: 20 },
    borderRadius: 38,
    cameraCutout: { x: 100, y: 40, width: 140, height: 50, radius: 25 },
  },
]
