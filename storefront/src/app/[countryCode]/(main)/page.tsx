import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import CategoryBanner from "@modules/home/components/category-banner"
import PromotionalBanners from "@modules/home/components/promotional-banners"
import HomePromotions from "@modules/home/components/home-promotions"
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
      <div className="py-0">
        <PromotionalBanners />
        <CategoryBanner />
        {/* New Arrivals (First Collection) */}
        <div className="content-container my-16">
          <div className="flex gap-4 mb-6">
            <span className="font-medium border-b-2 border-black pb-1">New Arrival</span>
            <span className="text-gray-500">Bestseller</span>
            <span className="text-gray-500">Featured Products</span>
          </div>
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collection={collections[0]} region={region} />
          </ul>
        </div>

        <HomePromotions />

        {/* Discounts Section */}
        <div className="content-container mb-16">
          <h2 className="text-2xl font-medium mb-6">Discounts up to -50%</h2>
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collection={collections[1] || collections[0]} region={region} />
          </ul>
        </div>

        <SummerSaleBanner />
      </div>
    </>
  )
}
