import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import LetscaseHome from "@modules/home/components/letscase-home"
import { listCategories } from "@lib/data/categories"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Letscase Ghana - Premium Phone Cases & Tech Accessories",
  description:
    "Shop authentic iPhone cases, Android accessories, laptop bags, chargers and more in Accra. Fast delivery across Ghana. Free shipping over GH₵200.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)
  const categories = await listCategories().catch(() => [] as any[])

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <LetscaseHome
        collections={collections}
        region={region}
        categories={categories}
      />
    </>
  )
}
