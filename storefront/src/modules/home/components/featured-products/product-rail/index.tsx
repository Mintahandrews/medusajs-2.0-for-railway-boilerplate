import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const { products } = collection

  if (!products) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <Text className="text-3xl font-bold text-gray-900 mb-2">{collection.title}</Text>
          {/* Optional subtitle if we had one, for now just space */}
        </div>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all {collection.title}
        </InteractiveLink>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products &&
          products.map((product) => (
            <li key={product.id}>
              {/* @ts-ignore */}
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
