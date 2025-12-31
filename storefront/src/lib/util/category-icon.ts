import GridIcon from "@modules/common/icons/grid"
import HeadsetIcon from "@modules/common/icons/headset"
import LaptopIcon from "@modules/common/icons/laptop"
import MonitorIcon from "@modules/common/icons/monitor"
import PhoneIcon from "@modules/common/icons/phone"
import PlugIcon from "@modules/common/icons/plug"
import ShoppingBagIcon from "@modules/common/icons/shopping-bag"
import WatchIcon from "@modules/common/icons/watch"

export function getCategoryIcon(name: string) {
  const n = (name || "").toLowerCase()

  // Charging / power
  if (
    n.includes("charger") ||
    n.includes("charg") ||
    n.includes("cable") ||
    n.includes("power") ||
    n.includes("adapter") ||
    n.includes("battery") ||
    n.includes("wireless")
  ) {
    return PlugIcon
  }

  // Audio
  if (
    n.includes("headphone") ||
    n.includes("headset") ||
    n.includes("ear") ||
    n.includes("airpod") ||
    n.includes("earbud") ||
    n.includes("audio") ||
    n.includes("speaker")
  ) {
    return HeadsetIcon
  }

  // Wearables
  if (n.includes("watch") || n.includes("smartwatch")) {
    return WatchIcon
  }

  // Mobile / cases / protection
  if (
    n.includes("case") ||
    n.includes("phone") ||
    n.includes("mobile") ||
    n.includes("iphone") ||
    n.includes("android") ||
    n.includes("screen") ||
    n.includes("protector") ||
    n.includes("glass")
  ) {
    return PhoneIcon
  }

  // Computing
  if (
    n.includes("laptop") ||
    n.includes("notebook") ||
    n.includes("comput") ||
    n.includes("pc") ||
    n.includes("mac") ||
    n.includes("macbook") ||
    n.includes("ipad") ||
    n.includes("tablet") ||
    n.includes("keyboard") ||
    n.includes("mouse")
  ) {
    return LaptopIcon
  }

  // Displays
  if (n.includes("monitor") || n.includes("display")) {
    return MonitorIcon
  }

  // Bags / merch
  if (
    n.includes("bag") ||
    n.includes("backpack") ||
    n.includes("pouch") ||
    n.includes("wallet") ||
    n.includes("merch") ||
    n.includes("shirt") ||
    n.includes("sweat") ||
    n.includes("pant") ||
    n.includes("short")
  ) {
    return ShoppingBagIcon
  }

  return GridIcon
}
