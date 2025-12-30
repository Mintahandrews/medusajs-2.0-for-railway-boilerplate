import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import LetscaseHome from "@modules/home/components/letscase-home"
import { listCategories } from "@lib/data/categories"
import { getProductsList } from "@lib/data/products"

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
  const categories = await listCategories().catch(() => [] as any[])
  const {
    response: { products },
  } = await getProductsList({
    countryCode,
    pageParam: 1,
    queryParams: {
      limit: 24,
      order: "created_at",
    },
  }).catch(() => ({ response: { products: [], count: 0 }, nextPage: null }))

  return (
    <>
      <Hero />
      <LetscaseHome
        products={products}
        categories={categories}
      />
    </>
  )
}
