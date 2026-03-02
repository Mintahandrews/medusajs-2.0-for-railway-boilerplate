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
    <section className="relative w-full h-screen min-h-[600px] max-h-[1000px] -mt-[72px]">
      {/* Hero background — full bleed, fills entire viewport */}
      <Image
        src="/hero.jpg"
        alt="Letscase Hero Background"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      {/* Dark gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

      {/* Content — vertically centered, accounts for the 72px nav overlap */}
      <div className="relative z-10 flex items-center justify-center h-full pt-[72px]">
        <div className="mx-auto max-w-[1440px] w-full px-6 small:px-12">
          <div className="max-w-[640px]">
            <span className="inline-block mb-4 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-[12px] font-semibold text-white uppercase tracking-wider border border-white/20">
              Ghana&apos;s #1 Tech Accessories
            </span>
            <h1 className="text-display small:text-display-xl text-white drop-shadow-lg">
              Premium Cases &amp;
              <br />
              Accessories for
              <br />
              <span className="text-brand-300">Every Device</span>
            </h1>
            <p className="mt-5 text-[15px] small:text-[17px] text-white/85 leading-[1.7] max-w-[480px]">
              100% authentic products with fast delivery across Ghana.
              Protect your devices with style — from phone cases to chargers
              and everything in between.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center gap-2 px-8 h-[52px] rounded-full bg-white text-grey-90 text-[15px] font-semibold transition duration-300 hover:bg-grey-10 hover:scale-[1.02] shadow-xl"
              >
                <span>Shop Now</span>
                <ArrowRight size={16} />
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/customizer"
                className="inline-flex items-center gap-2 px-8 h-[52px] rounded-full bg-brand text-white text-[15px] font-semibold transition duration-300 hover:bg-brand-600 hover:scale-[1.02] shadow-xl"
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
        </div>
      </div>

      {/* Scroll indicator dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <span className="h-2 w-6 rounded-full bg-white" />
        <span className="h-2 w-2 rounded-full bg-white/50" />
        <span className="h-2 w-2 rounded-full bg-white/50" />
      </div>
    </section>
  )
}

export default Hero
