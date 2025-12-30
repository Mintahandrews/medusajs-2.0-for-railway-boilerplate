import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import ShieldCheck from "@modules/common/icons/shield-check"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container py-6 small:py-10"
        data-testid="product-container"
      >
        <div className="text-ui-fg-muted text-small-regular mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <LocalizedClientLink href="/" className="hover:text-ui-fg-subtle">
              Home
            </LocalizedClientLink>
            <span className="text-ui-fg-subtle">/</span>
            <LocalizedClientLink href="/store" className="hover:text-ui-fg-subtle">
              Products
            </LocalizedClientLink>
            <span className="text-ui-fg-subtle">/</span>
            <span className="text-ui-fg-base">{product.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 large:grid-cols-2 gap-8 large:gap-12 items-start">
          <div className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-4 small:p-6">
            <ImageGallery images={product?.images || []} />
          </div>

          <div className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-4 small:p-6">
            <div className="flex flex-col gap-y-6">
              <ProductInfo product={product} />

              <Suspense
                fallback={
                  <ProductActions
                    disabled={true}
                    product={product}
                    region={region}
                  />
                }
              >
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>

              <div className="grid grid-cols-1 small:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 rounded-rounded border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
                  <FastDelivery />
                  <div className="text-ui-fg-subtle text-small-regular">Fast delivery</div>
                </div>
                <div className="flex items-center gap-2 rounded-rounded border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
                  <Refresh />
                  <div className="text-ui-fg-subtle text-small-regular">Easy returns</div>
                </div>
                <div className="flex items-center gap-2 rounded-rounded border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
                  <ShieldCheck />
                  <div className="text-ui-fg-subtle text-small-regular">Secure checkout</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container my-10 small:my-16">
        <div className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-4 small:p-6">
          <ProductTabs product={product} />
        </div>
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
