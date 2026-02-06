import Image from "next/image"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
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
      title: "100% Authentic",
      description: "Every product is genuine and verified",
      icon: Shield,
    },
    {
      title: "Delivery Across Ghana",
      description: "Free shipping on orders over GH₵200",
      icon: Truck,
    },
    {
      title: "30-Day Returns",
      description: "Hassle-free returns within 30 days",
      icon: RotateCcw,
    },
    {
      title: "WhatsApp Support",
      description: "Chat with us anytime on WhatsApp",
      icon: Headphones,
    },
  ]

  return sectionShell(
    <div className="py-14 small:py-16">
      <h2 className="text-center text-[24px] small:text-[28px] font-bold text-grey-90 mb-10">
        Why Shop With Us
      </h2>
      <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-4 gap-6 small:gap-8">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="group relative rounded-[20px] border border-grey-20 bg-gradient-to-br from-grey-5 to-white p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-brand hover:-translate-y-1">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={24} strokeWidth={2} />
              </div>
              <div className="text-[15px] font-semibold text-grey-90 mb-1">
                {item.title}
              </div>
              <div className="text-[13px] text-grey-50 leading-[1.5]">
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

const CATEGORY_IMAGES: Record<string, string> = {
  iphone: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=700&fit=crop&q=80",
  cases: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=700&fit=crop&q=80",
  "android phones": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=700&fit=crop&q=80",
  earphones: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=700&fit=crop&q=80",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=700&fit=crop&q=80",
  laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=700&fit=crop&q=80",
  speakers: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=700&fit=crop&q=80",
  chargers: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=700&fit=crop&q=80",
  cables: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=700&fit=crop&q=80",
  "screen protectors": "https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600&h=700&fit=crop&q=80",
  "laptop bags": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=700&fit=crop&q=80",
  watches: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=700&fit=crop&q=80",
  smartwatch: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=700&fit=crop&q=80",
  tablets: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=700&fit=crop&q=80",
  accessories: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&h=700&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=700&fit=crop&q=80",
}

function getCategoryImage(label: string): string {
  const lower = label.toLowerCase()
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (key === "default") continue
    if (lower.includes(key) || key.includes(lower)) return url
  }
  return CATEGORY_IMAGES.default
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
      image: getCategoryImage(c.name as string),
    }))

  const fallback = [
    { label: "iPhones", href: "/store", image: CATEGORY_IMAGES.iphone },
    { label: "Cases", href: "/store", image: CATEGORY_IMAGES.cases },
    { label: "Earphones/buds", href: "/store", image: CATEGORY_IMAGES.earphones },
    { label: "Laptops", href: "/store", image: CATEGORY_IMAGES.laptops },
    { label: "Speakers", href: "/store", image: CATEGORY_IMAGES.speakers },
    { label: "Chargers", href: "/store", image: CATEGORY_IMAGES.chargers },
    { label: "Screen Protectors", href: "/store", image: CATEGORY_IMAGES["screen protectors"] },
    { label: "Laptop bags", href: "/store", image: CATEGORY_IMAGES["laptop bags"] },
  ]

  const items = topLevel.length ? topLevel : fallback

  // Split into featured (first 2 large) and rest (smaller grid)
  const featured = items.slice(0, 2)
  const rest = items.slice(2)

  return sectionShell(
    <div className="py-16 small:py-20">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[12px] font-semibold uppercase tracking-wider mb-4">
          Browse Collections
        </span>
        <h2 className="text-[28px] small:text-[36px] font-bold text-grey-90">
          Shop By Category
        </h2>
        <p className="mt-3 text-[14px] text-grey-50 max-w-[500px] mx-auto">
          Explore our wide range of premium tech accessories organized just for you
        </p>
      </div>

      <div className="mx-auto max-w-[1200px] space-y-4 small:space-y-5">
        {/* Top row — 2 large featured cards */}
        <div className="grid grid-cols-1 small:grid-cols-2 gap-4 small:gap-5">
          {featured.map((c) => (
            <LocalizedClientLink
              key={c.label}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl bg-grey-90 aspect-[4/3] small:aspect-[3/2] block"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 small:p-7">
                <h3 className="text-white text-[20px] small:text-[24px] font-bold uppercase tracking-wide drop-shadow-lg">
                  {c.label}
                </h3>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-grey-90 text-[12px] font-semibold uppercase tracking-wider hover:bg-brand hover:text-white transition-colors duration-300">
                    View All
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>

        {/* Bottom row — smaller cards grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-4 small:gap-5">
            {rest.map((c) => (
              <LocalizedClientLink
                key={c.label}
                href={c.href}
                className="group relative overflow-hidden rounded-2xl bg-grey-90 aspect-[3/4] block"
              >
                <Image
                  src={c.image}
                  alt={c.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 small:p-5">
                  <h3 className="text-white text-[14px] small:text-[16px] font-bold uppercase tracking-wide drop-shadow-lg">
                    {c.label}
                  </h3>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/60 text-white text-[11px] font-semibold uppercase tracking-wider group-hover:bg-white group-hover:text-grey-90 transition-colors duration-300">
                      View All
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        )}
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
      
      {/* Trust Badges - moved to before footer */}
      <TrustBadges />
    </>
  )
}
