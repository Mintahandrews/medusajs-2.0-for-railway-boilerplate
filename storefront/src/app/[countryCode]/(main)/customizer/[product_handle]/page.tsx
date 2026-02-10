import { Metadata } from "next"
import {
  getDeviceConfig,
  getDefaultDevice,
  detectDeviceFromProduct,
  isCustomizableCase,
} from "@lib/device-assets"
import { getProductByHandle, searchProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import CustomizerLoader from "@modules/customizer/templates/customizer-loader"

interface Props {
  params: Promise<{ countryCode: string; product_handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product_handle } = await params
  const device =
    getDeviceConfig(product_handle) ??
    detectDeviceFromProduct(product_handle)
  return {
    title: device ? `Customize – ${device.name}` : "Case Customizer",
    description: "Design your own custom phone case",
  }
}

export default async function CustomizerPage({ params }: Props) {
  const { countryCode, product_handle } = await params

  // Fetch product + region for cart integration (best-effort — editor works without them)
  let product = null
  let region = null
  try {
    region = (await getRegion(countryCode)) ?? null
    if (region) {
      // 1. Try exact handle match (works when coming from a product page)
      product = (await getProductByHandle(product_handle, region.id)) ?? null

      // 2. If no exact match, search by device name (works when coming from
      //    the customizer landing page where URL uses a device handle like
      //    "iphone-15-pro" but the Medusa product handle might be different)
      if (!product) {
        const deviceConf = getDeviceConfig(product_handle) ?? detectDeviceFromProduct(product_handle)
        if (deviceConf) {
          const searchQuery = deviceConf.name.replace(/[()]/g, "")
          const candidates = await searchProducts(searchQuery, region.id, 20)
          // Pick the first customizable case product that matches this device
          product = candidates?.find((p) => {
            if (!isCustomizableCase(p)) return false
            const detected = detectDeviceFromProduct(p.handle, p.title, p.description)
            return detected?.handle === deviceConf.handle
          }) ?? candidates?.find((p) => isCustomizableCase(p)) ?? null
        }
      }
    }
  } catch {
    // Product data not available — customizer still works, just no cart integration
  }

  // Determine the device config:
  // 1. Exact match on product_handle (e.g. "iphone-15-pro")
  // 2. Fuzzy match from product handle + title + description
  // 3. Fallback to default device
  let deviceConfig = getDeviceConfig(product_handle)
  if (!deviceConfig && product) {
    deviceConfig = detectDeviceFromProduct(
      product.handle,
      product.title,
      product.description
    )
  }
  if (!deviceConfig) {
    deviceConfig = detectDeviceFromProduct(product_handle) ?? getDefaultDevice()
  }

  return (
    <CustomizerLoader
      deviceConfig={deviceConfig}
      productHandle={product_handle}
      product={product}
      region={region}
    />
  )
}
