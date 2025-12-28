import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

const FeaturedProducts = ({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) => {
  if (!collection || !collection.products) {
    return null
  }

  return (
    <div className="py-12 content-container">
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        <button className="pb-4 border-b-2 border-teal-600 font-medium text-teal-600 text-lg">New Arrival</button>
        <button className="pb-4 text-gray-500 hover:text-teal-600 font-medium text-lg transition-colors">Bestseller</button>
        <button className="pb-4 text-gray-500 hover:text-teal-600 font-medium text-lg transition-colors">Featured Products</button>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {collection.products.slice(0, 8).map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FeaturedProducts
