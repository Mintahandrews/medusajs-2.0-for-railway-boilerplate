import Image from "next/image"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import GridIcon from "@modules/common/icons/grid"
import HeadsetIcon from "@modules/common/icons/headset"
import LaptopIcon from "@modules/common/icons/laptop"
import MonitorIcon from "@modules/common/icons/monitor"
import PhoneIcon from "@modules/common/icons/phone"
import PlugIcon from "@modules/common/icons/plug"
import ShoppingBagIcon from "@modules/common/icons/shopping-bag"
import WatchIcon from "@modules/common/icons/watch"
import {
  Check,
  ChevronRight
} from "lucide-react"

import ProductCarousel from "./product-carousel"
import TestimonialsSlider from "./testimonials-slider"
import NewsletterSignup from "./newsletter-signup"

function sectionShell(children: React.ReactNode, className?: string) {
  return (
    <section className={className || "bg-white"}>
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">{children}</div>
    </section>
  )
}

function TrustBadges() {
  const items = [
    {
      title: "Superior Quality",
      description: "All products are 100% authentic",
    },
    {
      title: "Fast & Free Shipping",
      description: "Free delivery on orders over GH₵200",
    },
    {
      title: "30-Day Returns",
      description: "Hassle-free returns within 30 days",
    },
    {
      title: "24/7 Support",
      description: "Dedicated support team available anytime",
    },
  ]

  return sectionShell(
    <div className="py-10 small:py-12">
      <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-4 gap-6 small:gap-8">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border border-grey-20 bg-white flex items-center justify-center text-grey-90">
              <Check size={18} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-grey-90">
                {item.title}
              </div>
              <div className="text-[12px] text-grey-50 leading-[1.4]">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[28px] small:text-[32px] font-bold text-grey-90">
        {title}
      </h2>
      <LocalizedClientLink
        href={href}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-grey-50 hover:text-grey-90"
      >
        <span>See All</span>
        <ChevronRight size={16} />
      </LocalizedClientLink>
    </div>
  )
}

function iconForCategory(name: string) {
  const n = (name || "").toLowerCase()
  if (n.includes("charger") || n.includes("charg") || n.includes("cable")) return PlugIcon
  if (n.includes("headphone") || n.includes("headset") || n.includes("ear") || n.includes("audio")) return HeadsetIcon
  if (n.includes("watch")) return WatchIcon
  if (n.includes("case") || n.includes("phone") || n.includes("screen") || n.includes("protector")) return PhoneIcon
  if (n.includes("laptop") || n.includes("comput") || n.includes("mac") || n.includes("ipad")) return LaptopIcon
  if (n.includes("monitor") || n.includes("display")) return MonitorIcon
  if (n.includes("shirt") || n.includes("sweat") || n.includes("pant") || n.includes("short") || n.includes("merch")) return ShoppingBagIcon
  return GridIcon
}

function ShopByCategory({ categories }: { categories: any[] }) {
  const topLevel = (categories || [])
    .filter((c) => !c?.parent_category_id && !c?.parent_category)
    .filter((c) => c?.handle && c?.name)
    .slice(0, 6)
    .map((c) => ({
      label: c.name as string,
      href: `/categories/${c.handle}`,
    }))

  const fallback = [
    { label: "Cables", href: "/store" },
    { label: "Headphones", href: "/store" },
    { label: "Smartwatch", href: "/store" },
    { label: "Screen Protector", href: "/store" },
    { label: "Monitor", href: "/store" },
    { label: "More", href: "/store" },
  ]

  const items = topLevel.length ? topLevel : fallback

  return sectionShell(
    <div className="py-18 small:py-20">
      <h2 className="text-center text-[28px] small:text-[32px] font-bold text-grey-90 mb-12">
        Shop By Category
      </h2>
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-[24px] border border-grey-20 bg-grey-10 px-6 py-6">
          <div className="flex items-center justify-between gap-8 overflow-x-auto no-scrollbar">
            {items.map((c) => {
              const Icon = iconForCategory(c.label)
              return (
                <LocalizedClientLink
                  key={c.label}
                  href={c.href}
                  className="group shrink-0 flex flex-col items-center text-center min-w-[84px]"
                >
                  <div className="h-12 w-12 rounded-full border border-grey-20 bg-white flex items-center justify-center text-grey-90 group-hover:bg-brand group-hover:border-brand group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>
                  <div className="mt-3 text-[12px] font-medium text-grey-90 leading-[1.2]">
                    {c.label}
                  </div>
                </LocalizedClientLink>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PromoBanners({ products }: { products: HttpTypes.StoreProduct[] }) {
  const featured = (products || []).slice(0, 2)

  if (featured.length < 2) {
    return null
  }

  const [p1, p2] = featured

  const p1Href = p1?.handle ? `/products/${p1.handle}` : "/store"
  const p2Href = p2?.handle ? `/products/${p2.handle}` : "/store"

  const p1Image = p1?.thumbnail || p1?.images?.[0]?.url || "/product-placeholder.svg"
  const p2Image = p2?.thumbnail || p2?.images?.[0]?.url || "/product-placeholder.svg"

  return sectionShell(
    <div className="py-10">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-8">
        <div className="relative overflow-hidden rounded-[24px] border border-grey-20 bg-grey-10 min-h-[420px]">
          <div className="grid grid-cols-1 small:grid-cols-2 items-center gap-8 h-full p-8 small:p-10">
            <div className="max-w-[360px]">
            <div className="text-[22px] small:text-[26px] font-bold text-grey-90 mb-2">
              {p1?.title}
            </div>
            <p className="text-[13px] leading-[1.6] text-grey-50 mb-6 line-clamp-3">
              {p1?.subtitle || p1?.description || "Shop the latest picks from our store."}
            </p>
            <LocalizedClientLink
              href={p1Href}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-grey-90 hover:text-brand"
            >
              <span>Shop Collection</span>
              <ChevronRight size={16} />
            </LocalizedClientLink>
            </div>

            <div className="relative h-[240px] small:h-[360px] w-full">
              <Image
                src={p1Image}
                alt={p1?.title || "Featured product"}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-grey-20 bg-grey-10 min-h-[420px]">
          <div className="grid grid-cols-1 small:grid-cols-2 items-center gap-8 h-full p-8 small:p-10">
            <div className="max-w-[360px]">
            <div className="text-[22px] small:text-[26px] font-bold text-grey-90 mb-2">
              {p2?.title}
            </div>
            <p className="text-[13px] leading-[1.6] text-grey-50 mb-6 line-clamp-3">
              {p2?.subtitle || p2?.description || "Discover customer favorites and new arrivals."}
            </p>
            <LocalizedClientLink
              href={p2Href}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-grey-90 hover:text-brand"
            >
              <span>Shop Collection</span>
              <ChevronRight size={16} />
            </LocalizedClientLink>
            </div>

            <div className="relative h-[240px] small:h-[360px] w-full">
              <Image
                src={p2Image}
                alt={p2?.title || "Featured product"}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function mapProductsForCarousel(products: HttpTypes.StoreProduct[]) {
  return products.slice(0, 8).map((product) => {
    const price = getProductPrice({ product })
    return {
      id: product.id,
      title: product.title,
      href: `/products/${product.handle}`,
      image: product.thumbnail || product.images?.[0]?.url || "/product-placeholder.svg",
      price: price.cheapestPrice?.calculated_price || "",
    }
  })
}

export default function LetscaseHome({
  products,
  categories,
}: {
  products: HttpTypes.StoreProduct[]
  categories: any[]
}) {
  const bestSellers = mapProductsForCarousel((products || []).slice(0, 8))
  const trendingNow = mapProductsForCarousel((products || []).slice(8, 16))

  return (
    <>
      <TrustBadges />

      {bestSellers.length
        ? sectionShell(
            <>
              <div className="pt-20 pb-10">
                <SectionHeader title="Best Sellers" href="/store" />
              </div>
              <div className="pb-14">
                <ProductCarousel items={bestSellers} />
              </div>
            </>
          )
        : null}

      <ShopByCategory categories={categories} />
      <PromoBanners products={products} />

      {trendingNow.length
        ? sectionShell(
            <>
              <div className="pt-20 pb-10">
                <SectionHeader title="Trending Now" href="/store" />
              </div>
              <div className="pb-14">
                <ProductCarousel items={trendingNow} />
              </div>
            </>
          )
        : null}

      <TestimonialsSlider />
      <NewsletterSignup />
    </>
  )
}
