import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreProductCategory, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: { category: string[]; countryCode: string }
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()

    if (!product_categories?.length) {
      return []
    }

    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      (regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat() || []).filter(
        (code): code is string => Boolean(code)
      )
    )

    if (!countryCodes?.length) {
      return []
    }

    const categoryHandles = product_categories
      .map((category: any) => category.handle)
      .filter(Boolean)

    return countryCodes
      .map((countryCode: string) =>
        categoryHandles.map((handle: string) => ({
          countryCode,
          category: [handle],
        }))
      )
      .flat()
  } catch {
    // Backend not reachable during build (common in CI/local builds).
    // Returning [] disables SSG for this route; pages will render at runtime.
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { product_categories } = await getCategoryByHandle(
      params.category
    )

    const title = product_categories
      .map((category: StoreProductCategory) => category.name)
      .join(" | ")

    const description =
      product_categories[product_categories.length - 1].description ??
      `${title} category.`

    const seoDescription = description !== `${title} category.`
      ? description
      : `Shop ${title} at Letscase Ghana. Browse premium phone cases and tech accessories. Fast delivery across Ghana.`

    return {
      title,
      description: seoDescription,
      openGraph: {
        title: `${title} | Letscase`,
        description: seoDescription,
      },
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    return {
      title: "Category",
      description: "Browse premium phone cases and tech accessories at Letscase Ghana.",
    }
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { sortBy, page } = searchParams

  let product_categories
  try {
    const result = await getCategoryByHandle(params.category)
    product_categories = result.product_categories
  } catch {
    // Category not found or backend error — redirect to store
    redirect(`/${params.countryCode}/store`)
  }

  if (!product_categories || product_categories.length === 0) {
    redirect(`/${params.countryCode}/store`)
  }

  return (
    <CategoryTemplate
      categories={product_categories}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
