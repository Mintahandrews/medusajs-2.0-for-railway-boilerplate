import { Text } from "@medusajs/ui"

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
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block bg-[#F6F6F6] p-6 rounded-[20px] relative hover:shadow-md transition-shadow">
      <div className="absolute top-6 right-6 z-10 cursor-pointer text-[#909090] hover:text-red-500">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.0667 4C19.3867 4 17.2 5.06667 16 7.06667C14.8 5.06667 12.6133 4 9.93333 4C5.2 4 1.33333 7.86667 1.33333 12.6667C1.33333 18.6667 6.4 23.0667 13.7333 27.2L16 29.3333L18.2667 27.2C25.6 23.0667 30.6667 18.6667 30.6667 12.6667C30.6667 7.86667 26.8 4 22.0667 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div data-testid="product-wrapper" className="flex flex-col items-center">
        <div className="w-full h-[200px] flex items-center justify-center mb-6">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="bg-transparent aspect-square object-contain mix-blend-multiply h-full w-auto"
          />
        </div>
        <div className="flex flex-col items-center gap-2 w-full text-center">
          <Text className="text-center font-medium text-base text-black line-clamp-2 min-h-[48px]" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2 text-2xl font-bold tracking-tight mt-2 mb-4">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <button className="px-10 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Buy Now
          </button>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
