import { Metadata } from "next"
import Image from "next/image"
import {
  Store,
  Smartphone,
  Palette,
  Headphones,
  Truck,
  MessageCircle,
  ShieldCheck,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import StoreLocation from "@modules/home/components/store-location"

export const metadata: Metadata = {
  title: "About Us | Letscase",
  description:
    "Learn about Letscase — Ghana's premium electronics and mobile accessories retailer based in Accra.",
}

/**
 * Visual board items — each card shows an icon/emoji label and description.
 * To add real photos later, add a `src` field and swap the placeholder div
 * for an <Image> component pointing to /public/about/<filename>.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  store: Store,
  smartphone: Smartphone,
  palette: Palette,
  headphones: Headphones,
  truck: Truck,
  messageCircle: MessageCircle,
}

const VISUAL_BOARD = [
  {
    iconKey: "store",
    title: "Our Store",
    desc: "Visit us in Accra for hands-on browsing and free screen protector installation.",
    image: "https://images.unsplash.com/photo-1697545806136-92d30cb7081e?w=600&h=400&fit=crop&q=80",
  },
  {
    iconKey: "smartphone",
    title: "Phone Cases",
    desc: "Premium silicone, hard, clear, and leather cases for every major phone model.",
    image: "https://images.unsplash.com/photo-1535157412991-2ef801c1748b?w=600&h=400&fit=crop&q=80",
  },
  {
    iconKey: "palette",
    title: "Custom Designs",
    desc: "Turn your photos and artwork into unique, made-in-Ghana phone cases.",
    image: "https://images.unsplash.com/photo-1593830566460-2464575a9a24?w=600&h=400&fit=crop&q=80",
  },
  {
    iconKey: "headphones",
    title: "Tech Accessories",
    desc: "Chargers, earphones, speakers, laptop bags — all quality-tested.",
    image: "https://images.unsplash.com/photo-1566793474285-2decf0fc182a?w=600&h=400&fit=crop&q=80",
  },
  {
    iconKey: "truck",
    title: "Nationwide Delivery",
    desc: "Fast delivery across Ghana with in-store pickup available.",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600&h=400&fit=crop&q=80",
  },
  {
    iconKey: "messageCircle",
    title: "Real Support",
    desc: "Reach us on WhatsApp, Instagram, Snapchat, or TikTok — we respond within hours.",
    image: "https://images.unsplash.com/photo-1626863905121-3b0c0ed7b94c?w=600&h=400&fit=crop&q=80",
  },
]

/** Hero banner images for the mosaic collage */
const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1535469145415-8e49c30eae75?w=800&h=600&fit=crop&q=80",
    alt: "Assorted colorful smartphone cases",
  },
  {
    src: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=800&h=600&fit=crop&q=80",
    alt: "Sony headphones and smartphone case",
  },
  {
    src: "https://images.unsplash.com/photo-1542219550-76864b1bc385?w=800&h=600&fit=crop&q=80",
    alt: "iPhone cases and sports bands collection",
  },
  {
    src: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&h=600&fit=crop&q=80",
    alt: "Apple devices and accessories",
  },
]

export default function AboutUsPage() {
  return (
    <>
      <div className="mx-auto max-w-[1000px] px-5 small:px-10 py-16">
        {/* ── Hero Section with Logo ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <Image
              src="/Lets Case Logo black.png"
              alt="Letscase logo"
              width={280}
              height={64}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-[36px] small:text-[42px] font-bold text-grey-90 leading-tight">
            About Letscase
          </h1>
          <p className="mt-4 text-[16px] leading-[1.7] text-grey-60 max-w-[600px] mx-auto">
            Ghana&rsquo;s premium electronics and mobile accessories retailer based
            in Accra. We are passionate about providing high-quality tech
            accessories that enhance your digital lifestyle.
          </p>
        </div>

        {/* ── Picture Board — Mosaic Collage ── */}
        <div className="mb-14">
          <h2 className="text-[20px] font-semibold text-grey-90 text-center">
            A Glimpse of Letscase
          </h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60 text-center max-w-[480px] mx-auto">
            From our store to your doorstep &mdash; here&rsquo;s what we&rsquo;re
            all about.
          </p>

          {/* Mosaic grid — 2 large + 2 small images */}
          <div className="mt-6 grid grid-cols-2 small:grid-cols-4 gap-3 auto-rows-[200px] small:auto-rows-[220px]">
            <div className="relative col-span-2 row-span-2 rounded-[20px] overflow-hidden group">
              <Image
                src={HERO_IMAGES[0].src}
                alt={HERO_IMAGES[0].alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-[15px] font-semibold">Premium Phone Cases</p>
                <p className="text-white/80 text-[13px] mt-0.5">Designed for style and protection</p>
              </div>
            </div>
            <div className="relative rounded-[20px] overflow-hidden group">
              <Image
                src={HERO_IMAGES[1].src}
                alt={HERO_IMAGES[1].alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <p className="absolute bottom-3 left-3 text-white text-[13px] font-semibold">Accessories</p>
            </div>
            <div className="relative rounded-[20px] overflow-hidden group">
              <Image
                src={HERO_IMAGES[2].src}
                alt={HERO_IMAGES[2].alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <p className="absolute bottom-3 left-3 text-white text-[13px] font-semibold">Custom Designs</p>
            </div>
            <div className="relative col-span-2 rounded-[20px] overflow-hidden group">
              <Image
                src={HERO_IMAGES[3].src}
                alt={HERO_IMAGES[3].alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <p className="absolute bottom-3 left-3 text-white text-[13px] font-semibold">Trusted by Thousands in Ghana</p>
            </div>
          </div>
        </div>

        {/* ── What We Offer — Image + Icon Cards ── */}
        <div className="mb-14">
          <h2 className="text-[20px] font-semibold text-grey-90 text-center">
            What We Offer
          </h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60 text-center max-w-[480px] mx-auto">
            Everything you need to protect and personalize your devices.
          </p>

          <div className="mt-6 grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-4">
            {VISUAL_BOARD.map((item) => {
              const Icon = ICON_MAP[item.iconKey]
              return (
                <div
                  key={item.title}
                  className="rounded-[18px] border border-grey-20 bg-white overflow-hidden hover:border-brand/30 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="relative h-[180px] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0">
                        {Icon && <Icon size={18} />}
                      </div>
                      <p className="text-[14px] font-semibold text-grey-90">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-[13px] leading-[1.6] text-grey-60">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Value props ── */}
        <div className="mb-14 grid grid-cols-1 small:grid-cols-3 gap-4">
          <div className="rounded-[16px] border border-grey-20 bg-white p-5 text-center">
            <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mx-auto mb-3">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-[15px] font-semibold text-grey-90">Curated Products</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
              Accessories chosen for compatibility, durability, and everyday performance.
            </p>
          </div>
          <div className="rounded-[16px] border border-grey-20 bg-white p-5 text-center">
            <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mx-auto mb-3">
              <Star size={24} />
            </div>
            <h2 className="text-[15px] font-semibold text-grey-90">Trusted Support</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
              Need help deciding? We&apos;ll recommend what fits your device.
            </p>
          </div>
          <div className="rounded-[16px] border border-grey-20 bg-white p-5 text-center">
            <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mx-auto mb-3">
              <Zap size={24} />
            </div>
            <h2 className="text-[15px] font-semibold text-grey-90">Fast Delivery</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
              Quick dispatch and order tracking from your account.
            </p>
          </div>
        </div>

        {/* ── Learn more ── */}
        <div className="rounded-[16px] border border-grey-20 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-grey-90">Learn More</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Want to know how Letscase started, or prefer to shop in person?
          </p>
          <div className="mt-4 flex flex-col small:flex-row gap-3">
            <LocalizedClientLink
              href="/our-story"
              className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-brand hover:text-brand transition"
            >
              Our Story
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/visit-our-store"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-white text-[14px] font-semibold hover:bg-brand-dark transition"
            >
              Visit Our Store
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Store Location Map & Info */}
      <StoreLocation />
    </>
  )
}
