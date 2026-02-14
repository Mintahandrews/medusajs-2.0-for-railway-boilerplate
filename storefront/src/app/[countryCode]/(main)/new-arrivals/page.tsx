import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"
import { listCategories } from "@lib/data/categories"

export const metadata: Metadata = {
  title: "New Arrivals | Letscase",
  description: "Discover the latest products added to our store.",
}

type Params = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function NewArrivalsPage({ params }: Params) {
  const { countryCode } = await params
  const categories = await listCategories().catch(() => [])
  const topCategoryLinks = (categories || [])
    .filter((c: any) => !c?.parent_category_id && !c?.parent_category)
    .filter((c: any) => c?.handle && c?.name)
    .slice(0, 8)
    .map((c: any) => ({ label: c.name as string, href: `/categories/${c.handle}` }))

  return (
    <StoreTemplate
      sortBy="created_at"
      page={"1"}
      countryCode={countryCode}
      title={"New Arrivals"}
      subtitle={"Fresh accessories added recently — check back often."}
      quickLinks={topCategoryLinks}
    />
  )
}
