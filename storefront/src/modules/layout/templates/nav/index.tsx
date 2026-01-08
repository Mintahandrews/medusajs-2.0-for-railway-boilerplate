import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import Image from "next/image"
import { Search, Heart, User, ShoppingBag } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import DesktopNav from "./desktop-nav"
import DesktopSearch from "./desktop-search"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  const [categories, collectionsResult] = await Promise.all([
    listCategories().catch(() => [] as any[]),
    getCollectionsList(0, 100).catch(() => ({ collections: [], count: 0 })),
  ])

  const topLevelCategories = (categories as any[])
    .filter((c) => !c?.parent_category_id && !c?.parent_category)
    .filter((c) => c?.handle && c?.name)
    .slice(0, 12)

  const categoryLinks = topLevelCategories.map((c) => ({
    name: c.name as string,
    href: `/categories/${c.handle}`,
  }))

  const collections = (collectionsResult as {
    collections: HttpTypes.StoreCollection[]
    count: number
  })?.collections

  const collectionLinks = (collections || [])
    .filter((c) => c?.handle && c?.title)
    .slice(0, 12)
    .map((c) => ({
      name: c.title as string,
      href: `/collections/${c.handle}`,
    }))

  const fallbackCategoryLinks = [
    { name: "All Categories", href: "/store" },
    { name: "Accessories", href: "/store" },
    { name: "Chargers", href: "/store" },
    { name: "Earbuds", href: "/store" },
    { name: "Cases", href: "/store" },
    { name: "Screen Protectors", href: "/store" },
  ]

  const fallbackCollectionLinks = [
    { name: "Best Sellers", href: "/store" },
    { name: "New Arrivals", href: "/store" },
    { name: "Top Rated", href: "/store" },
    { name: "Gift Ideas", href: "/store" },
    { name: "Under GH₵200", href: "/store" },
    { name: "Travel Ready", href: "/store" },
  ]

  const shopCategories = (categoryLinks.length
    ? categoryLinks
    : fallbackCategoryLinks
  ).slice(0, 12)

  const shopCollections = (collectionLinks.length
    ? collectionLinks
    : fallbackCollectionLinks
  ).slice(0, 12)

  const fallbackMega = [
    {
      name: "Mobile Accessories",
      href: "/store",
      children: ["iPhone Cases", "Screen Protectors", "Chargers", "AirPod Cases"],
    },
    {
      name: "Computing",
      href: "/store",
      children: ["Laptop Bags", "MacBook Cases", "iPad Cases", "Stands"],
    },
    {
      name: "Audio",
      href: "/store",
      children: ["Headphones", "Earbuds", "Speakers", "Accessories"],
    },
    {
      name: "Charging & Power",
      href: "/store",
      children: ["USB-C Chargers", "Cables", "Car Chargers", "Wireless Charging"],
    },
  ]

  const megaCategories = (topLevelCategories.length
    ? topLevelCategories.slice(0, 4).map((c) => ({
      name: c.name as string,
      href: `/categories/${c.handle}`,
      children: ((c as any)?.category_children || [])
        .filter((cc: any) => cc?.handle && cc?.name)
        .slice(0, 6)
        .map((cc: any) => ({
          name: cc.name as string,
          href: `/categories/${cc.handle}`,
        })),
    }))
    : fallbackMega.map((c) => ({
      name: c.name,
      href: c.href,
      children: c.children.map((n) => ({ name: n, href: "/store" })),
    })))

  const trendingCollections = shopCollections
  const trendingCollectionsCol1 = trendingCollections.slice(0, 6)
  const trendingCollectionsCol2 = trendingCollections.slice(6, 12)

  const exploreLinks = [
    { name: "Shop all products", href: "/store" },
    { name: "Search", href: "/search" },
    { name: "About Us", href: "/about-us" },
    { name: "Deals", href: "/deals" },
  ]

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto border-b duration-200 bg-white border-ui-border-base h-[70px]">
        <nav className="flex items-center justify-between w-full h-full px-5 small:px-10">
          <div className="flex items-center gap-x-8 flex-1 basis-0">
            <div className="small:hidden">
              <SideMenu regions={regions} />
            </div>

            <Suspense
              fallback={
                <div className="hidden small:flex items-center gap-x-8 text-[14px] font-medium text-grey-90">
                  <span className="pb-1 border-b-2 border-transparent hover:text-brand hover:border-brand transition-colors duration-200 cursor-pointer">Home</span>
                  <span className="pb-1 border-b-2 border-transparent hover:text-brand transition-colors duration-200 cursor-pointer">Shop</span>
                  <span className="pb-1 border-b-2 border-transparent hover:text-brand transition-colors duration-200 cursor-pointer">Trending Gear</span>
                  <span className="pb-1 border-b-2 border-transparent hover:text-brand transition-colors duration-200 cursor-pointer">Deals</span>
                  <span className="pb-1 border-b-2 border-transparent hover:text-brand transition-colors duration-200 cursor-pointer">About Us</span>
                </div>
              }
            >
              <DesktopNav
                megaCategories={megaCategories}
                trendingCollectionsCol1={trendingCollectionsCol1}
                trendingCollectionsCol2={trendingCollectionsCol2}
                exploreLinks={exploreLinks}
              />
            </Suspense>
          </div>

          <div className="flex items-center justify-center">
            <LocalizedClientLink href="/" data-testid="nav-store-link">
              <Image
                src="/logo.svg"
                alt="Letscase"
                width={180}
                height={44}
                className="h-7 w-auto small:h-8"
                priority
              />
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-4 small:gap-x-6 h-full flex-1 basis-0 justify-end">
            <LocalizedClientLink
              href="/search"
              scroll={false}
              className="small:hidden text-grey-90 hover:text-brand transition-transform duration-200 hover:scale-110"
              aria-label="Search"
              data-testid="nav-search-link"
            >
              <Search size={22} />
            </LocalizedClientLink>

            <DesktopSearch />

            <LocalizedClientLink
              href="/account/wishlist"
              className="hidden small:inline-flex text-grey-90 hover:text-brand transition-transform duration-200 hover:scale-110"
              aria-label="Wishlist"
            >
              <Heart size={22} />
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/account"
              className="text-grey-90 hover:text-brand transition-transform duration-200 hover:scale-110"
              data-testid="nav-account-link"
              aria-label="Account"
            >
              <User size={22} />
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-brand flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <ShoppingBag size={22} />
                  <span>0</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
