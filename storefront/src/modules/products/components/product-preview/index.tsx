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
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block bg-[#F5F5F7] p-4 rounded-xl relative hover:shadow-md transition-shadow">
      <div className="absolute top-4 right-4 z-10 cursor-pointer text-gray-400 hover:text-red-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div data-testid="product-wrapper" className="flex flex-col items-center">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          className="bg-transparent aspect-square object-contain mix-blend-multiply"
        />
        <div className="flex flex-col items-center mt-6 gap-2 w-full">
          <Text className="text-center font-medium text-base text-black line-clamp-2 min-h-[48px]" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2 text-xl font-semibold">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <button className="w-full bg-black text-white py-3 rounded-lg mt-4 font-medium hover:bg-gray-800 transition-colors">
            Buy Now
          </button>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
