import Image from "next/image"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ShieldCheck,
  Truck,
  RefreshCcw,
  Headset,
  Cable,
  Headphones,
  Watch,
  Monitor,
  Mouse,
  Smartphone,
  Grid
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
      icon: ShieldCheck,
      title: "Superior Quality",
      description: "All products are 100% authentic",
    },
    {
      icon: Truck,
      title: "Fast & Free Shipping",
      description: "Free delivery on orders over GH₵200",
    },
    {
      icon: RefreshCcw,
      title: "30-Day Returns",
      description: "Hassle-free returns within 30 days",
    },
    {
      icon: Headset,
      title: "24/7 Support",
      description: "Dedicated support team available anytime",
    },
  ]

  return sectionShell(
    <div className="py-12 small:py-16 border-y border-grey-20">
      <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-4 gap-10">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="group flex flex-col items-center text-center cursor-pointer transition duration-300 hover:scale-[1.05]"
            >
              <div className="h-12 w-12 rounded-full border-2 border-grey-90 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:border-brand">
                <Icon size={24} color="currentColor" />
              </div>
              <div className="text-[18px] font-semibold text-grey-90 mb-2">
                {item.title}
              </div>
              <div className="text-[13px] text-grey-50 leading-[1.5] max-w-[200px]">
                {item.description}
              </div>
            </div>
          )
        }
        )}
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
        className="text-[14px] font-medium text-grey-90 hover:text-brand"
      >
        See All →
      </LocalizedClientLink>
    </div>
  )
}

function iconForCategory(name: string) {
  const n = (name || "").toLowerCase()
  if (n.includes("cable") || n.includes("charg")) return Cable
  if (n.includes("headphone") || n.includes("audio")) return Headphones
  if (n.includes("watch")) return Watch
  if (n.includes("screen") || n.includes("protector") || n.includes("phone"))
    return Smartphone
  if (n.includes("monitor") || n.includes("display")) return Monitor
  if (n.includes("mouse")) return Mouse
  return Grid
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
    <div className="py-20">
      <h2 className="text-center text-[28px] small:text-[32px] font-bold text-grey-90 mb-12">
        Shop By Category
      </h2>
      <div className="mx-auto max-w-[1200px] grid grid-cols-3 small:grid-cols-6 gap-x-8 gap-y-8 justify-center">
        {items.map((c) => {
          const Icon = iconForCategory(c.label)
          return (
            <LocalizedClientLink
              key={c.label}
              href={c.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="h-[80px] w-[80px] rounded-[12px] bg-grey-5 border border-grey-20 flex items-center justify-center transition duration-300 group-hover:bg-brand group-hover:border-brand group-hover:scale-[1.05] shadow-xs group-hover:shadow-[0_4px_12px_rgba(93,171,166,0.2)]">
                <span className="text-grey-90 group-hover:text-white transition-colors">
                  <Icon size={36} color="currentColor" />
                </span>
              </div>
              <div className="mt-3 text-[14px] font-medium text-grey-90 max-w-[100px] leading-[1.3]">
                {c.label}
              </div>
            </LocalizedClientLink>
          )
        })}
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
        <div className="relative overflow-hidden rounded-[24px] p-8 small:p-12 min-h-[450px] bg-gradient-to-br from-[#4A90E2] to-brand">
          <div className="relative z-10 max-w-[40%]">
            <div className="text-[30px] small:text-[36px] font-bold text-white mb-4">
              {p1?.title}
            </div>
            <p className="text-[15px] leading-[1.6] text-white/90 mb-6">
              {p1?.subtitle || p1?.description || "Shop the latest picks from our store."}
            </p>
            <LocalizedClientLink
              href={p1Href}
              className="inline-flex items-center text-[15px] font-semibold text-white underline hover:opacity-80 gap-1"
            >
              Shop Product →
            </LocalizedClientLink>
          </div>
          <div className="absolute inset-y-0 right-0 w-[55%]">
            <Image
              src={p1Image}
              alt={p1?.title || "Featured product"}
              fill
              className="object-cover rounded-l-[16px]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {/* Decorative overlay */}
          <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-l from-transparent to-black/5 pointer-events-none" />
        </div>

        <div className="relative overflow-hidden rounded-[24px] p-8 small:p-12 min-h-[450px] bg-[#F5E6D3]">
          <div className="relative z-10 max-w-[40%]">
            <div className="text-[30px] small:text-[36px] font-bold text-grey-90 mb-4">
              {p2?.title}
            </div>
            <p className="text-[15px] leading-[1.6] text-grey-60 mb-6">
              {p2?.subtitle || p2?.description || "Discover customer favorites and new arrivals."}
            </p>
            <LocalizedClientLink
              href={p2Href}
              className="inline-flex items-center text-[15px] font-semibold text-grey-90 underline hover:text-brand gap-1"
            >
              Shop Product →
            </LocalizedClientLink>
          </div>
          <div className="absolute inset-y-0 right-0 w-[60%] flex items-center justify-center">
            <div className="relative h-[320px] w-[320px] drop-shadow-xl">
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
