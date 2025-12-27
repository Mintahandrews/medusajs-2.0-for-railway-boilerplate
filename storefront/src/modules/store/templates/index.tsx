import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import SortProducts from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="content-container py-6">
      {/* Breadcrumbs placeholder - logic can be added here or in a separate component */}
      <div className="flex text-gray-500 text-sm mb-8 gap-2">
        <span>Home</span>
        <span>{">"}</span>
        <span>Catalog</span>
        <span>{">"}</span>
        <span className="text-cyber-accent">Smartphones</span>
      </div>

      <div className="flex flex-col small:flex-row small:items-start" data-testid="category-container">
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-base font-medium text-gray-500">Selected Products: <span className="text-cyber-accent font-semibold">85</span></h1>
            <div className="flex items-center gap-2">
              <SortProducts sortBy={sort} />
            </div>
          </div>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
