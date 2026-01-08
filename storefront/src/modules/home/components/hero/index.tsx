import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const Hero = () => {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10 py-8 small:py-10">
        <div
          className="relative overflow-hidden rounded-[28px] border border-grey-20 bg-cover bg-center px-6 py-10 small:px-12 small:py-0 small:h-[560px] flex items-center"
          style={{ backgroundImage: "url('/hero.svg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/45 to-white/5" />
          <div className="relative z-10 w-full grid grid-cols-1 small:grid-cols-2 items-center gap-10">
            <div className="animate-fade-in-left">
              <h1 className="text-[36px] small:text-[56px] leading-[1.2] font-bold tracking-[-0.02em] text-grey-90 max-w-[600px]">
                Transform Your Tech,
                <br />
                Boost Digital Journey!
              </h1>
              <p className="mt-5 text-base text-grey-50 leading-[1.6] max-w-[500px]">
                From ultra-fast charging to cutting-edge gaming accessories,
                find everything you need to power your devices with style and
                convenience.
              </p>

              <div className="mt-8 flex items-center gap-6">
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center justify-between px-6 h-[48px] w-[140px] rounded-full bg-white border border-grey-20 text-grey-90 text-[15px] font-medium transition duration-300 hover:border-grey-40 hover:scale-[1.02]"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={16} />
                </LocalizedClientLink>

                <LocalizedClientLink
                  href="/store"
                  aria-label="Open shop"
                  className="h-14 w-14 rounded-full bg-white border border-grey-20 flex items-center justify-center text-grey-90 transition hover:border-grey-40"
                >
                  <ArrowUpRight size={20} />
                </LocalizedClientLink>
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
