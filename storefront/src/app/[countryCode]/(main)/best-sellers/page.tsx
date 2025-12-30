import { Metadata } from "next"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { getCollectionsList } from "@lib/data/collections"

export const metadata: Metadata = {
  title: "Best Sellers | Letscase",
  description: "Shop our most popular picks.",
}

type Params = {
  params: {
    countryCode: string
  }
}

export default async function BestSellersPage({ params }: Params) {
  const { collections } = await getCollectionsList(0, 1).catch(() => ({
    collections: [],
    count: 0,
  }))

  const bestSellersCollection = collections?.[0]

  return (
    <div className="py-6 content-container">
      <div className="mb-8">
        <h1 className="text-2xl-semi text-grey-90">Best Sellers</h1>
        <p className="mt-2 text-[14px] text-grey-50">
          Our most popular picks right now.
        </p>
      </div>

      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          page={1}
          countryCode={params.countryCode}
          collectionId={bestSellersCollection?.id}
        />
      </Suspense>
    </div>
  )
}
