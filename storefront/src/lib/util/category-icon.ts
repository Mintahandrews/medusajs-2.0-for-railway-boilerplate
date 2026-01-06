import {
  Smartphone,
  Headphones,
  Watch,
  Cable,
  Laptop,
  Monitor,
  ShoppingBag,
  Grid3X3,
  Battery,
  Zap,
  Shield,
  Camera,
  Gamepad2,
  Speaker,
  Usb,
  Bluetooth,
  Wifi,
  HardDrive,
  Keyboard,
  Mouse,
  Printer,
  Tv,
  Tablet,
  type LucideIcon,
} from "lucide-react"

export function getCategoryIcon(name: string): LucideIcon {
  const n = (name || "").toLowerCase()

  // Phone Cases & Mobile Accessories
  if (
    n.includes("case") ||
    n.includes("phone") ||
    n.includes("mobile") ||
    n.includes("iphone") ||
    n.includes("samsung") ||
    n.includes("android") ||
    n.includes("smartphone")
  ) {
    return Smartphone
  }

  // Screen Protectors & Protection
  if (
    n.includes("screen") ||
    n.includes("protector") ||
    n.includes("glass") ||
    n.includes("tempered") ||
    n.includes("protection")
  ) {
    return Shield
  }

  // Headphones & Audio
  if (
    n.includes("headphone") ||
    n.includes("headset") ||
    n.includes("ear") ||
    n.includes("airpod") ||
    n.includes("earbud") ||
    n.includes("audio") ||
    n.includes("buds")
  ) {
    return Headphones
  }

  // Speakers
  if (n.includes("speaker") || n.includes("sound") || n.includes("bluetooth speaker")) {
    return Speaker
  }

  // Smartwatches & Wearables
  if (
    n.includes("watch") ||
    n.includes("smartwatch") ||
    n.includes("wearable") ||
    n.includes("band") ||
    n.includes("fitness")
  ) {
    return Watch
  }

  // Cables & Connectors
  if (
    n.includes("cable") ||
    n.includes("cord") ||
    n.includes("lightning") ||
    n.includes("usb-c") ||
    n.includes("type-c") ||
    n.includes("connector")
  ) {
    return Cable
  }

  // USB Accessories
  if (n.includes("usb") || n.includes("hub") || n.includes("adapter")) {
    return Usb
  }

  // Chargers & Power
  if (
    n.includes("charger") ||
    n.includes("charg") ||
    n.includes("power") ||
    n.includes("plug") ||
    n.includes("fast charge")
  ) {
    return Zap
  }

  // Power Banks & Batteries
  if (
    n.includes("battery") ||
    n.includes("powerbank") ||
    n.includes("power bank") ||
    n.includes("portable")
  ) {
    return Battery
  }

  // Wireless Accessories
  if (n.includes("wireless") || n.includes("qi")) {
    return Wifi
  }

  // Bluetooth
  if (n.includes("bluetooth")) {
    return Bluetooth
  }

  // Laptops & Notebooks
  if (
    n.includes("laptop") ||
    n.includes("notebook") ||
    n.includes("macbook") ||
    n.includes("chromebook")
  ) {
    return Laptop
  }

  // Tablets & iPads
  if (
    n.includes("tablet") ||
    n.includes("ipad") ||
    n.includes("tab")
  ) {
    return Tablet
  }

  // Keyboards
  if (n.includes("keyboard")) {
    return Keyboard
  }

  // Mouse & Pointing Devices
  if (n.includes("mouse") || n.includes("trackpad")) {
    return Mouse
  }

  // Monitors & Displays
  if (n.includes("monitor") || n.includes("display") || n.includes("screen")) {
    return Monitor
  }

  // TVs
  if (n.includes("tv") || n.includes("television")) {
    return Tv
  }

  // Storage & Hard Drives
  if (
    n.includes("storage") ||
    n.includes("drive") ||
    n.includes("ssd") ||
    n.includes("memory") ||
    n.includes("sd card")
  ) {
    return HardDrive
  }

  // Camera & Photography
  if (
    n.includes("camera") ||
    n.includes("photo") ||
    n.includes("lens") ||
    n.includes("tripod") ||
    n.includes("gopro")
  ) {
    return Camera
  }

  // Gaming
  if (
    n.includes("game") ||
    n.includes("gaming") ||
    n.includes("controller") ||
    n.includes("joystick") ||
    n.includes("console")
  ) {
    return Gamepad2
  }

  // Printers
  if (n.includes("printer") || n.includes("print")) {
    return Printer
  }

  // Bags & Accessories
  if (
    n.includes("bag") ||
    n.includes("backpack") ||
    n.includes("pouch") ||
    n.includes("sleeve") ||
    n.includes("carrying")
  ) {
    return ShoppingBag
  }

  // Default / More / All
  if (n.includes("more") || n.includes("all") || n.includes("other")) {
    return Grid3X3
  }

  return Grid3X3
}
