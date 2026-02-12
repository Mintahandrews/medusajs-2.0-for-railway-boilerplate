import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { listCategories } from "@lib/data/categories"

export const metadata: Metadata = {
  title: "Shop All Phone Cases & Tech Accessories",
  description:
    "Browse our full collection of premium phone cases, custom designer cases, laptop bags, chargers and tech accessories. Fast delivery across Ghana.",
  openGraph: {
    title: "Shop All | Letscase Ghana",
    description:
      "Browse our full collection of premium phone cases, custom designer cases, laptop bags, chargers and tech accessories.",
  },
}

type Params = {
  searchParams: {
    sortBy?: SortOptions
    page?: string
    onSale?: string
  }
  params: {
    countryCode: string
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, page, onSale } = searchParams

  const categories = await listCategories().catch(() => [])
  const topCategoryLinks = (categories || [])
    .filter((c: any) => !c?.parent_category_id && !c?.parent_category)
    .filter((c: any) => c?.handle && c?.name)
    .slice(0, 8)
    .map((c: any) => ({ label: c.name as string, href: `/categories/${c.handle}` }))

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      onSale={onSale === "1" || onSale === "true"}
      countryCode={params.countryCode}
      title={"Shop All"}
      subtitle={"Explore all Letscase products and accessories."}
      quickLinks={topCategoryLinks}
    />
  )
}
