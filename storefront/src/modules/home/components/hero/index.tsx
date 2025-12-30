import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="w-full border-b border-grey-20 bg-grey-10">
      <div className="relative mx-auto max-w-[1440px] px-5 small:px-10 py-10 small:py-20">
        <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] small:text-[180px] font-bold tracking-tight text-black/3">
            Geenzoe
          </div>
        </div>

        <div className="relative grid grid-cols-1 small:grid-cols-5 items-center gap-10 min-h-[520px]">
          <div className="small:col-span-3 animate-fade-in-left">
            <h1 className="text-[36px] small:text-[56px] leading-[1.15] font-bold tracking-[-0.02em] text-grey-90 max-w-[600px]">
              Transform Your Tech,
              <br />
              Boost Digital Journey!
            </h1>
            <p className="mt-5 text-base text-grey-50 leading-[1.6] max-w-[520px]">
              From ultra-fast charging to cutting-edge gaming accessories, find
              everything you need to power your devices with style and
              convenience.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center h-12 px-7 rounded-base bg-black text-white text-[15px] font-medium transition duration-300 hover:bg-brand hover:scale-[1.05]"
              >
                Shop Now <span className="ml-2">→</span>
              </LocalizedClientLink>

              <div className="h-14 w-14 rounded-full bg-white border-2 border-grey-20 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-grey-30" />
              </div>
            </div>
          </div>

          <div className="small:col-span-2 flex justify-center small:justify-end animate-fade-in-right">
            <div className="relative w-full max-w-[520px] h-[300px] small:h-[520px]">
              <Image
                src="https://images.unsplash.com/photo-1695048133142-1a2043614d6d?w=1200&auto=format&fit=crop&q=80"
                alt="Premium iPhone accessories by Letscase"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
