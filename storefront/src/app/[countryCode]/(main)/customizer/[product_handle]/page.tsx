import { Metadata } from "next"
import {
  getDeviceConfig,
  getDefaultDevice,
  detectDeviceFromProduct,
} from "@lib/device-assets"
import { getProductByHandle } from "@lib/data/products"
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
      product = (await getProductByHandle(product_handle, region.id)) ?? null
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
