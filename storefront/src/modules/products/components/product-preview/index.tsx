

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block h-full">
      <div
        data-testid="product-wrapper"
        className="h-full flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 border border-transparent hover:border-gray-100"
      >
        <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Quick Add overlay could go here in future */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/20 to-transparent">
            {/* Placeholder for future action buttons */}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 gap-2">
          <span
            className="text-base font-medium text-ui-fg-base line-clamp-2 group-hover:text-letscase-600 transition-colors"
            data-testid="product-title"
          >
            {product.title}
          </span>
          <div className="flex items-center gap-x-2 mt-auto">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
