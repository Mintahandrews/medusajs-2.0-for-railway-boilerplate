import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Benefits from "@modules/home/components/benefits"
import CategoriesGrid from "@modules/home/components/categories-grid"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Letscase - Premium Tech Accessories in Ghana",
  description:
    "Discover high-quality phone cases, chargers, earbuds, and more at Letscase. Ghana's premier tech accessories store.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const collections = await getCollectionsWithProducts(countryCode)

  if (!collections) {
    return null
  }

  return (
    <>
      <Hero />
      <Benefits />
      <CategoriesGrid />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
