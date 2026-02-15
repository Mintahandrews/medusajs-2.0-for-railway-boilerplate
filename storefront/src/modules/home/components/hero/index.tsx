import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Paintbrush, Smartphone, Headphones, BatteryCharging, Shield } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { getCategoryIcon } from "@lib/util/category-icon"

type QuickCategory = {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const FALLBACK_QUICK_CATEGORIES: QuickCategory[] = [
  { label: "Phone Cases", icon: Smartphone, href: "/categories/phone-cases" },
  { label: "Chargers", icon: BatteryCharging, href: "/categories/chargers" },
  { label: "Audio", icon: Headphones, href: "/categories/audio" },
  { label: "Screen Guards", icon: Shield, href: "/categories/screen-guards" },
]

type HeroProps = {
  categories?: HttpTypes.StoreProductCategory[]
}

const Hero = ({ categories = [] }: HeroProps) => {
  const dynamicQuickCategories: QuickCategory[] = (categories || [])
    .filter((category) => !category?.parent_category_id && !category?.parent_category)
    .filter((category) => category?.handle && category?.name)
    .slice(0, 4)
    .map((category) => ({
      label: category.name as string,
      href: `/categories/${category.handle}`,
      icon: getCategoryIcon(category.name as string),
    }))

  const quickCategories = dynamicQuickCategories.length
    ? dynamicQuickCategories
    : FALLBACK_QUICK_CATEGORIES

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10 py-8 small:py-10">
        <div
          className="relative overflow-hidden rounded-[28px] px-6 py-12 small:px-12 small:py-0 small:h-[560px] flex items-center"
        >
          {/* Hero background — using next/image for optimization & LCP */}
          <Image
            src="/hero.svg"
            alt="Letscase Hero Background"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Dark gradient for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 small:from-black/75 small:via-black/40 small:to-transparent" />

          <div className="relative z-10 w-full grid grid-cols-1 small:grid-cols-2 items-center gap-10">
            <div>
              <span className="inline-block mb-4 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-[12px] font-semibold text-white uppercase tracking-wider border border-white/20">
                Ghana&apos;s #1 Tech Accessories
              </span>
              <h1 className="text-[32px] small:text-[52px] leading-[1.12] font-bold tracking-[-0.02em] text-white max-w-[560px] drop-shadow-lg">
                Premium Cases &amp;
                <br />
                Accessories for
                <br />
                <span className="text-emerald-400">Every Device</span>
              </h1>
              <p className="mt-5 text-[15px] small:text-[16px] text-white/80 leading-[1.7] max-w-[460px]">
                100% authentic products with fast delivery across Ghana.
                Protect your devices with style — from phone cases to chargers
                and everything in between.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center gap-2 px-7 h-[48px] rounded-full bg-white text-gray-900 text-[15px] font-semibold transition duration-300 hover:bg-gray-100 hover:scale-[1.02] shadow-lg"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={16} />
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/customizer"
                  className="inline-flex items-center gap-2 px-7 h-[48px] rounded-full bg-emerald-500 text-white text-[15px] font-semibold transition duration-300 hover:bg-emerald-600 hover:scale-[1.02] shadow-lg"
                >
                  <Paintbrush size={16} />
                  <span>Customise your case</span>
                </LocalizedClientLink>
              </div>

              {/* Quick category pills */}
              <div className="mt-8 hidden small:flex items-center gap-3">
                {quickCategories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <LocalizedClientLink
                      key={`${cat.href}-${cat.label}`}
                      href={cat.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-3.5 py-2 text-[12px] font-medium text-white/80 hover:border-white/50 hover:text-white transition"
                    >
                      <Icon size={13} />
                      <span>{cat.label}</span>
                    </LocalizedClientLink>
                  )
                })}
              </div>
            </div>

            <div className="hidden small:block" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
