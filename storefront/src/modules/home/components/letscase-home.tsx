import Image from "next/image"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { getCategoryIcon } from "../../../lib/util/category-icon"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
} from "lucide-react"

import ProductCarousel from "./product-carousel"
import TestimonialsSlider from "./testimonials-slider"
import NewsletterSignup from "./newsletter-signup"
import StoreLocation from "./store-location"
import VideoShowcase from "./video-showcase"

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
      icon: Shield,
    },
    {
      title: "Fast & Free Shipping",
      description: "Free delivery on orders over GH₵200",
      icon: Truck,
    },
    {
      title: "30-Day Returns",
      description: "Hassle-free returns within 30 days",
      icon: RotateCcw,
    },
    {
      title: "24/7 Support",
      description: "Dedicated support team available anytime",
      icon: Headphones,
    },
  ]

  return sectionShell(
    <div className="py-10 small:py-16">
      <h2 className="text-center text-[20px] small:text-[28px] font-bold text-grey-90 mb-8 small:mb-10">
        Why Shop With Us
      </h2>
      <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-4 gap-4 small:gap-8">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="group relative rounded-[16px] small:rounded-[20px] border border-grey-20 bg-gradient-to-br from-grey-5 to-white p-4 small:p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-brand hover:-translate-y-1">
              <div className="mx-auto h-12 w-12 small:h-14 small:w-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg mb-3 small:mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={20} strokeWidth={2} className="small:size-24" />
              </div>
              <div className="text-[14px] small:text-[15px] font-semibold text-grey-90 mb-1">
                {item.title}
              </div>
              <div className="text-[12px] small:text-[13px] text-grey-50 leading-[1.5]">
                {item.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>,
    "bg-grey-5"
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

function ShopByCategory({ categories }: { categories: any[] }) {
  const topLevel = (categories || [])
    .filter((c) => !c?.parent_category_id && !c?.parent_category)
    .filter((c) => c?.handle && c?.name)
    .sort((a, b) => {
      const ar = typeof a?.rank === "number" ? a.rank : Number.MAX_SAFE_INTEGER
      const br = typeof b?.rank === "number" ? b.rank : Number.MAX_SAFE_INTEGER
      if (ar !== br) return ar - br
      return String(a?.name || "").localeCompare(String(b?.name || ""))
    })
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
    <div className="py-12 small:py-20">
      <div className="text-center mb-8 small:mb-12">
        <span className="inline-block px-3 small:px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] small:text-[12px] font-semibold uppercase tracking-wider mb-3 small:mb-4">
          Browse Collections
        </span>
        <h2 className="text-[24px] small:text-[36px] font-bold text-grey-90">
          Shop By Category
        </h2>
        <p className="mt-2 small:mt-3 text-[13px] small:text-[14px] text-grey-50 max-w-[400px] small:max-w-[500px] mx-auto px-4">
          Explore our wide range of premium tech accessories organized just for you
        </p>
      </div>
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-3 small:gap-6">
          {items.map((c) => {
            const Icon = getCategoryIcon(c.label)
            return (
              <LocalizedClientLink
                key={c.label}
                href={c.href}
                className="group relative flex flex-col items-center text-center p-3 small:p-6 rounded-[16px] small:rounded-[20px] bg-white border border-grey-20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-brand"
              >
                {/* 3D Icon Container with Brand Theme */}
                <div className="relative h-12 w-12 small:h-16 small:w-16 medium:h-20 medium:w-20 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/30 group-hover:scale-110 transition-all duration-300">
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Floating shadow for 3D effect */}
                  <div className="absolute -bottom-1.5 small:-bottom-2 left-1/2 -translate-x-1/2 w-8 small:w-12 h-2 small:h-3 rounded-full bg-brand blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                  <Icon size={22} className="relative z-10 small:size-28" />
                </div>
                <div className="mt-2 small:mt-4 text-[12px] small:text-[14px] font-semibold text-grey-90 group-hover:text-brand transition-colors">
                  {c.label}
                </div>
                {/* Hover arrow indicator */}
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={16} className="text-brand" />
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </div>,
    "bg-gradient-to-b from-grey-5 to-white"
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
    <div className="py-6 small:py-10">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-6 small:gap-8">
        <div className="relative overflow-hidden rounded-[16px] small:rounded-[24px] border border-grey-20 bg-grey-10 min-h-[300px] small:min-h-[420px]">
          <div className="grid grid-cols-1 small:grid-cols-2 items-center gap-6 small:gap-8 h-full p-6 small:p-8 small:p-10">
            <div className="max-w-[300px] small:max-w-[360px]">
            <div className="text-[18px] small:text-[26px] font-bold text-grey-90 mb-2">
              {p1?.title}
            </div>
            <p className="text-[12px] small:text-[13px] leading-[1.6] text-grey-50 mb-4 small:mb-6 line-clamp-3">
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

            <div className="relative h-[180px] small:h-[360px] w-full">
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

        <div className="relative overflow-hidden rounded-[16px] small:rounded-[24px] border border-grey-20 bg-grey-10 min-h-[300px] small:min-h-[420px]">
          <div className="grid grid-cols-1 small:grid-cols-2 items-center gap-6 small:gap-8 h-full p-6 small:p-8 small:p-10">
            <div className="max-w-[300px] small:max-w-[360px]">
            <div className="text-[18px] small:text-[26px] font-bold text-grey-90 mb-2">
              {p2?.title}
            </div>
            <p className="text-[12px] small:text-[13px] leading-[1.6] text-grey-50 mb-4 small:mb-6 line-clamp-3">
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

            <div className="relative h-[180px] small:h-[360px] w-full">
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
      {/* Video Showcase - at the top after hero */}
      <VideoShowcase />

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
      
      {/* Store Location Map */}
      <StoreLocation />
      
      <NewsletterSignup />
      
      {/* Trust Badges - moved to before footer */}
      <TrustBadges />
    </>
  )
}
