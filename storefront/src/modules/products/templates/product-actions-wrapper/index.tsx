import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  let product: any = null

  try {
    const products = await getProductsById({
      ids: [id],
      regionId: region.id,
    })
    product = products?.[0] ?? null
  } catch (e) {
    console.error("[ProductActionsWrapper] Failed to fetch product:", id, e)
    return null
  }

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} />
}
