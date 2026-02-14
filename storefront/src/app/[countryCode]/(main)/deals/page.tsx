import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"
import { listCategories } from "@lib/data/categories"

export const metadata: Metadata = {
  title: "Deals | Letscase",
  description: "Shop discounted products and limited-time offers.",
}

type Params = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function DealsPage({ params }: Params) {
  const { countryCode } = await params
  const categories = await listCategories().catch(() => [])
  const topCategoryLinks = (categories || [])
    .filter((c: any) => !c?.parent_category_id && !c?.parent_category)
    .filter((c: any) => c?.handle && c?.name)
    .slice(0, 8)
    .map((c: any) => ({ label: c.name as string, href: `/categories/${c.handle}` }))

  return (
    <StoreTemplate
      onSale
      page={"1"}
      countryCode={countryCode}
      title={"Deals"}
      subtitle={"Save on selected accessories and limited-time offers."}
      quickLinks={topCategoryLinks}
    />
  )
}
