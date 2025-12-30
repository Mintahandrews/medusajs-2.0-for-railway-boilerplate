import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  onSale,
  countryCode,
  title,
  subtitle,
  quickLinks,
}: {
  sortBy?: SortOptions
  page?: string
  onSale?: boolean
  countryCode: string
  title?: string
  subtitle?: string
  quickLinks?: Array<{ label: string; href: string }>
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const defaultDiscountSort = !!onSale && !sortBy
  const sort = sortBy || "created_at"

  const resolvedTitle = title || (onSale ? "Deals" : "All products")
  const resolvedSubtitle =
    subtitle ||
    (onSale
      ? "Discounted items and limited-time offers."
      : "Browse the full Letscase catalog.")

  return (
    <div className="py-6 content-container" data-testid="category-container">
      <div className="mb-8">
        <h1 className="text-2xl-semi text-grey-90" data-testid="store-page-title">
          {resolvedTitle}
        </h1>
        <p className="mt-2 text-[14px] text-grey-50">{resolvedSubtitle}</p>

        <div className="mt-5 grid grid-cols-1 small:grid-cols-3 gap-3">
          <div className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
            <p className="text-[14px] font-semibold text-grey-90">Fast delivery</p>
            <p className="mt-1 text-[13px] text-grey-50">
              Quick dispatch with reliable tracking.
            </p>
          </div>
          <div className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
            <p className="text-[14px] font-semibold text-grey-90">Easy returns</p>
            <p className="mt-1 text-[13px] text-grey-50">
              See our returns &amp; refunds policy.
            </p>
          </div>
          <div className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
            <p className="text-[14px] font-semibold text-grey-90">Support that helps</p>
            <p className="mt-1 text-[13px] text-grey-50">
              Reach us quickly via the Contact page.
            </p>
          </div>
        </div>

        {quickLinks?.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {quickLinks.map((l) => (
              <LocalizedClientLink
                key={l.href}
                href={l.href}
                className="inline-flex h-9 items-center rounded-full border border-grey-20 bg-white px-4 text-[13px] font-semibold text-grey-90 hover:border-ui-border-interactive hover:text-ui-fg-interactive transition"
              >
                {l.label}
              </LocalizedClientLink>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col small:flex-row small:items-start">
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              onSale={onSale}
              defaultDiscountSort={defaultDiscountSort}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
