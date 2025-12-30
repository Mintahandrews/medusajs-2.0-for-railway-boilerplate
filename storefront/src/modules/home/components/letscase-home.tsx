import Image from "next/image"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Heart from "@modules/common/icons/heart"
import ShieldCheck from "@modules/common/icons/shield-check"
import Refresh from "@modules/common/icons/refresh"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Headset from "@modules/common/icons/headset"
import Phone from "@modules/common/icons/phone"
import Laptop from "@modules/common/icons/laptop"
import Plug from "@modules/common/icons/plug"
import Watch from "@modules/common/icons/watch"
import Monitor from "@modules/common/icons/monitor"
import Grid from "@modules/common/icons/grid"

import ProductCarousel from "./product-carousel"
import TestimonialsSlider from "./testimonials-slider"
import NewsletterSignup from "./newsletter-signup"

const PLACEHOLDER_PRODUCTS = [
  {
    title: "Ultra-Fast Charger",
    price: "GH₵29.99",
    image:
      "https://images.unsplash.com/photo-1591290619762-d6d7be0e8ccb?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Crystal-Clear Headphone",
    price: "GH₵39.99",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Advanced HD Monitor",
    price: "GH₵299.99",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "10gb Wireless Mouse",
    price: "GH₵29.99",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&auto=format&fit=crop&q=80",
  },
]

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
      icon: FastDelivery,
      title: "Fast & Free Shipping",
      description: "Free delivery on orders over GH₵200",
    },
    {
      icon: Refresh,
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
      <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-10">
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
              <div className="text-[13px] text-grey-50 leading-[1.5] max-w-[220px]">
                {item.description}
              </div>
            </div>
          )}
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
  if (n.includes("phone") || n.includes("mobile")) return Phone
  if (n.includes("comput") || n.includes("laptop") || n.includes("mac") || n.includes("ipad"))
    return Laptop
  if (n.includes("audio") || n.includes("headphone") || n.includes("ear") || n.includes("speaker"))
    return Headset
  if (n.includes("charg") || n.includes("power") || n.includes("cable")) return Plug
  if (n.includes("watch")) return Watch
  if (n.includes("monitor") || n.includes("screen") || n.includes("display")) return Monitor
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
    <div className="py-16 small:py-20">
      <h2 className="text-center text-[28px] small:text-[32px] font-bold text-grey-90">
        Shop By Category
      </h2>
      <div className="mt-12 mx-auto max-w-[1200px] grid grid-cols-3 xsmall:grid-cols-4 small:grid-cols-6 gap-x-8 gap-y-6">
        {items.map((c) => {
          const Icon = iconForCategory(c.label)
          return (
          <LocalizedClientLink
            key={c.label}
            href={c.href}
            className="group flex flex-col items-center text-center"
          >
            <div className="h-16 w-16 small:h-20 small:w-20 rounded-large bg-grey-5 border border-grey-20 flex items-center justify-center transition duration-300 group-hover:bg-brand group-hover:border-brand group-hover:scale-[1.05]">
              <span className="text-grey-90 group-hover:text-white">
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

function PromoBanners() {
  return sectionShell(
    <div className="py-10 small:py-12">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-8">
        <div className="relative overflow-hidden rounded-[24px] p-8 small:p-12 min-h-[420px] bg-gradient-to-br from-blue-500 to-brand">
          <div className="relative z-10 max-w-[320px]">
            <div className="text-[30px] small:text-[36px] font-bold text-white">
              iPhone 16 Pro Max
            </div>
            <p className="mt-4 text-[15px] leading-[1.6] text-white/90">
              Made with titanium. Power for 27 hours and boom. Built-in GPS
            </p>
            <LocalizedClientLink
              href="/store"
              className="mt-6 inline-block text-[15px] font-semibold text-white underline hover:opacity-80"
            >
              Shop Collection →
            </LocalizedClientLink>
          </div>
          <div className="absolute inset-y-0 right-0 w-[55%]">
            <Image
              src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&auto=format&fit=crop&q=80"
              alt="iPhone 16 Pro Max"
              fill
              className="object-cover rounded-l-[16px]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-[24px] p-8 small:p-12 min-h-[420px] bg-[#F5E6D3]">
          <div className="relative z-10 max-w-[320px]">
            <div className="text-[30px] small:text-[36px] font-bold text-grey-90">
              Premium Headphone
            </div>
            <p className="mt-4 text-[15px] leading-[1.6] text-grey-60">
              Listening to music or watching movies. Made for luxury listening
            </p>
            <LocalizedClientLink
              href="/store"
              className="mt-6 inline-block text-[15px] font-semibold text-grey-90 underline hover:text-brand"
            >
              Shop Collection →
            </LocalizedClientLink>
          </div>
          <div className="absolute inset-y-0 right-0 w-[52%] flex items-center justify-center">
            <div className="relative h-[280px] w-[280px] small:h-[320px] small:w-[320px] drop-shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80"
                alt="Premium Headphone"
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
      image: product.thumbnail || product.images?.[0]?.url || "",
      price: price.cheapestPrice?.calculated_price || "",
    }
  })
}

export default function LetscaseHome({
  collections,
  region,
  categories,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
  categories: any[]
}) {
  const bestSellers = collections?.[0]?.products
    ? mapProductsForCarousel(collections[0].products as any)
    : []

  const trendingNow = collections?.[1]?.products
    ? mapProductsForCarousel(collections[1].products as any)
    : []

  return (
    <>
      <TrustBadges />

      {sectionShell(
        <div className="pt-16 small:pt-20 pb-10">
          <SectionHeader title="Best Sellers" href="/store" />
        </div>
      )}
      {sectionShell(
        <div className="pb-14">
          <ProductCarousel
            items={bestSellers.length ? bestSellers : PLACEHOLDER_PRODUCTS}
          />
        </div>
      )}

      <ShopByCategory categories={categories} />
      <PromoBanners />

      {sectionShell(
        <div className="pt-16 small:pt-20 pb-10">
          <SectionHeader title="Trending Now" href="/store" />
        </div>
      )}
      {sectionShell(
        <div className="pb-14">
          <ProductCarousel
            items={trendingNow.length ? trendingNow : PLACEHOLDER_PRODUCTS}
          />
        </div>
      )}

      <TestimonialsSlider />
      <NewsletterSignup />
    </>
  )
}
