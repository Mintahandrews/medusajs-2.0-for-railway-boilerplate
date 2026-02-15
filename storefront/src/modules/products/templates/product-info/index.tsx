import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import { useMemo } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-3">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        {product.subtitle ? (
          <Text className="text-medium text-ui-fg-subtle mt-1" data-testid="product-subtitle">
            {product.subtitle}
          </Text>
        ) : null}

        {/* Stock badges (Out of stock / Low stock) */}
        {/**
         * low_stock_threshold can be set on the product as `metadata.low_stock_threshold`
         * Falls back to 5 when not set.
         */}
        {(() => {
          const thresholdRaw =
            // @ts-ignore - metadata may be typed as any
            product?.metadata?.low_stock_threshold ?? (product as any)?.low_stock_threshold
          const threshold = Number(thresholdRaw ?? 5)

          const managedVariants = (product.variants || []).filter((v) => v?.manage_inventory)

          // If no managed variants, we don't show stock badges
          if (!managedVariants.length) return null

          const stocks = managedVariants.map((v) => v.inventory_quantity ?? 0)
          const allZero = stocks.every((s) => (s ?? 0) <= 0)
          if (allZero) {
            return (
              <div className="mt-2">
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-sm font-semibold bg-red-50 text-red-700 border border-red-100">
                  Out of stock
                </span>
              </div>
            )
          }

          const minStock = Math.min(...stocks.filter((s) => s > 0))
          if (minStock <= threshold) {
            return (
              <div className="mt-2">
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-sm font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                  Low stock — {minStock} left
                </span>
              </div>
            )
          }

          return null
        })()}

        {product.description ? (
          <Text
            className="text-medium text-ui-fg-subtle whitespace-pre-line"
            data-testid="product-description"
          >
            {product.description}
          </Text>
        ) : null}
      </div>
    </div>
  )
}

export default ProductInfo
