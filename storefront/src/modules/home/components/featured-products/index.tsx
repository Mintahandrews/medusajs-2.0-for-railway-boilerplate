import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

export default async function FeaturedProducts({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  if (!collection || !collection.products) {
    return null
  }

  return (
    <li key={collection.id}>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
        {collection.products.slice(0, 8).map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </li>
  )
}
