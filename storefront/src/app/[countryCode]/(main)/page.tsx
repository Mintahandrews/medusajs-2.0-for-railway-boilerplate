import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import CategoryBanner from "@modules/home/components/category-banner"
import PromotionalBanners from "@modules/home/components/promotional-banners"
import HomePromotions from "@modules/home/components/home-promotions"
import SummerSaleBanner from "@modules/home/components/summer-sale-banner"
import DiscountProducts from "@modules/home/components/discount-products"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Letscase - Premium Tech Store",
  description:
    "Your one-stop destination for premium tech gadgets, accessories, and the latest electronics.",
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
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collection={collections[0]} region={region} />
          </ul>
        </div>

        <HomePromotions />

        <DiscountProducts />

        <SummerSaleBanner />
      </div>
    </>
  )
}
