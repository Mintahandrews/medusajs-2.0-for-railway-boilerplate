import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import CategoryBanner from "@modules/home/components/category-banner"
import PromotionalBanners from "@modules/home/components/promotional-banners"
import SummerSaleBanner from "@modules/home/components/summer-sale-banner"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <CategoryBanner />
      <div className="py-12">
        <PromotionalBanners />
        {/* We can organize FeaturedProducts by passing specific collections if needed, or keeping the loop */}
        <ul className="flex flex-col gap-x-6 content-container my-16">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
        <SummerSaleBanner />
      </div>
    </>
  )
}
