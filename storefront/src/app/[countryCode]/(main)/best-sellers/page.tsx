import { Metadata } from "next"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { getCollectionsList } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

  const categories = await listCategories().catch(() => [])
  const topCategoryLinks = (categories || [])
    .filter((c: any) => !c?.parent_category_id && !c?.parent_category)
    .filter((c: any) => c?.handle && c?.name)
    .slice(0, 8)
    .map((c: any) => ({ label: c.name as string, href: `/categories/${c.handle}` }))

  return (
    <div className="py-6 content-container">
      <div className="mb-8">
        <h1 className="text-2xl-semi text-grey-90">Best Sellers</h1>
        <p className="mt-2 text-[14px] text-grey-50">
          Our most popular picks right now.
        </p>

        <div className="mt-5 grid grid-cols-1 small:grid-cols-3 gap-3">
          <div className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
            <p className="text-[14px] font-semibold text-grey-90">Top-rated picks</p>
            <p className="mt-1 text-[13px] text-grey-50">
              Best-selling accessories customers love.
            </p>
          </div>
          <div className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
            <p className="text-[14px] font-semibold text-grey-90">Quality-first</p>
            <p className="mt-1 text-[13px] text-grey-50">
              Built for daily use and long-lasting performance.
            </p>
          </div>
          <div className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
            <p className="text-[14px] font-semibold text-grey-90">Need help?</p>
            <p className="mt-1 text-[13px] text-grey-50">
              We’ll help you pick the right accessory.
            </p>
          </div>
        </div>

        {topCategoryLinks.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {topCategoryLinks.map((l) => (
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
