import { Text, clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistButton from "@modules/common/components/wishlist-button"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { AlertTriangle, Ban } from "lucide-react"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // Use product directly if it already has calculated_price (pre-fetched),
  // otherwise fall back to individual fetch (backward compat)
  const hasPrice = product.variants?.some(
    (v: any) => v.calculated_price !== undefined
  )

  let pricedProduct = product
  if (!hasPrice) {
    const [fetched] = await getProductsById({
      ids: [product.id!],
      regionId: region.id,
    })
    if (!fetched) return null
    pricedProduct = fetched
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  const managedVariants = (pricedProduct.variants || []).filter(
    (variant: any) => variant?.manage_inventory
  )

  const inventoryLevels = managedVariants.map(
    (variant: any) => variant?.inventory_quantity ?? 0
  )

  const thresholdRaw =
    // @ts-ignore metadata may be loosely typed
    pricedProduct?.metadata?.low_stock_threshold ?? (pricedProduct as any)?.low_stock_threshold
  const lowStockThreshold = Number.isFinite(Number(thresholdRaw))
    ? Number(thresholdRaw)
    : 5

  const totalInventory = inventoryLevels.reduce((acc, qty) => acc + qty, 0)
  const hasManagedInventory = managedVariants.length > 0
  const isOutOfStock = hasManagedInventory && totalInventory <= 0
  const positiveStocks = inventoryLevels.filter((qty) => qty > 0)
  const minPositiveStock = positiveStocks.length ? Math.min(...positiveStocks) : null
  const isLowStock =
    hasManagedInventory && !isOutOfStock && minPositiveStock !== null && minPositiveStock <= lowStockThreshold

  const CardWrapper = ({ children }: { children: React.ReactNode }) =>
    isOutOfStock ? (
      <div className="group cursor-not-allowed" aria-disabled="true">
        {children}
      </div>
    ) : (
      <LocalizedClientLink href={`/products/${product.handle}`} className="group">
        {children}
      </LocalizedClientLink>
    )

  return (
    <CardWrapper>
      <div
        data-testid="product-wrapper"
        className={clx({ "opacity-60": isOutOfStock })}
      >
        <div className="relative">
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 items-end">
            {isLowStock && minPositiveStock !== null && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 shadow-sm">
                <AlertTriangle size={12} />
                Only {minPositiveStock} left
              </span>
            )}
            <WishlistButton
              item={{
                id: product.id!,
                handle: product.handle!,
                title: product.title,
                image: product.thumbnail || product.images?.[0]?.url || null,
                price: cheapestPrice?.calculated_price || undefined,
              }}
            />
          </div>
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            alt={product.title}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-xs font-semibold gap-1">
              <Ban size={18} />
              <span>Out of stock</span>
            </div>
          )}
        </div>
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}
