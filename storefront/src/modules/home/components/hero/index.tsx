import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Paintbrush, Smartphone, Headphones, BatteryCharging, Shield } from "lucide-react"

const QUICK_CATEGORIES = [
  { label: "Phone Cases", icon: Smartphone, href: "/categories/phone-cases" },
  { label: "Chargers", icon: BatteryCharging, href: "/categories/chargers" },
  { label: "Audio", icon: Headphones, href: "/categories/audio" },
  { label: "Screen Guards", icon: Shield, href: "/categories/screen-guards" },
]

const Hero = () => {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10 py-8 small:py-10">
        <div
          className="relative overflow-hidden rounded-[28px] border border-grey-20 bg-cover bg-center px-6 py-10 small:px-12 small:py-0 small:h-[560px] flex items-center"
          style={{ backgroundImage: "url('/hero.svg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/10" />
          <div className="relative z-10 w-full grid grid-cols-1 small:grid-cols-2 items-center gap-10">
            <div className="animate-fade-in-left">
              <span className="inline-block mb-4 rounded-full bg-brand/10 px-4 py-1.5 text-[12px] font-semibold text-brand uppercase tracking-wider">
                Ghana&apos;s #1 Tech Accessories
              </span>
              <h1 className="text-[32px] small:text-[52px] leading-[1.15] font-bold tracking-[-0.02em] text-grey-90 max-w-[560px]">
                Premium Cases &amp;
                <br />
                Accessories for
                <br />
                <span className="text-brand">Every Device</span>
              </h1>
              <p className="mt-5 text-[15px] text-grey-50 leading-[1.7] max-w-[460px]">
                100% authentic products with fast delivery across Ghana.
                Protect your devices with style — from phone cases to chargers
                and everything in between.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center gap-2 px-7 h-[48px] rounded-full bg-brand text-white text-[15px] font-semibold transition duration-300 hover:bg-brand-dark hover:scale-[1.02] shadow-md"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={16} />
                </LocalizedClientLink>

                <LocalizedClientLink
                  href="/custom-case"
                  className="inline-flex items-center gap-2 px-7 h-[48px] rounded-full bg-white border border-grey-20 text-grey-90 text-[15px] font-semibold transition duration-300 hover:border-brand hover:text-brand hover:scale-[1.02]"
                >
                  <Paintbrush size={16} />
                  <span>Design Your Case</span>
                </LocalizedClientLink>
              </div>

              {/* Quick category pills */}
              <div className="mt-8 hidden small:flex items-center gap-3">
                {QUICK_CATEGORIES.map((cat) => (
                  <LocalizedClientLink
                    key={cat.label}
                    href={cat.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-grey-20 bg-white/80 backdrop-blur-sm px-3.5 py-2 text-[12px] font-medium text-grey-60 hover:border-brand hover:text-brand transition"
                  >
                    <cat.icon size={13} />
                    <span>{cat.label}</span>
                  </LocalizedClientLink>
                ))}
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
