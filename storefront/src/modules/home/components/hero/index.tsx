import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="min-h-[632px] w-full relative bg-[#211c24] overflow-hidden flex flex-col md:block">
      <div className="content-container h-full flex flex-col justify-center items-center md:items-start text-white gap-6 relative z-10 pt-10 md:pt-0 text-center md:text-left">
        <span className="text-white/40 text-lg xsmall:text-xl small:text-2xl font-semibold">Pro. Beyond.</span>
        <Heading
          level="h1"
          className="text-5xl small:text-8xl font-thin tracking-tighter"
        >
          iPhone 14 <span className="font-bold">Pro</span>
        </Heading>
        <Text className="text-lg text-[#909090] max-w-[400px]">
          Created to change everything for the better. For everyone.
        </Text>

        <LocalizedClientLink href="/store" className="mt-6">
          <Button variant="secondary" className="px-12 py-3 bg-transparent border border-white text-white rounded-md hover:bg-white hover:text-black transition-colors text-base font-medium">
            Shop Now
          </Button>
        </LocalizedClientLink>
      </div>

      <div className="relative md:absolute right-0 bottom-0 h-[400px] md:h-full w-full md:w-1/2 flex items-end justify-center pointer-events-none mt-10 md:mt-0">
        <div className="relative w-full h-full flex items-end justify-center">
          <img
            src="/images/hero_iphone.png"
            alt="iPhone 14 Pro"
            className="object-contain h-[90%] w-auto z-10"
          />
        </div>
      </div>
    </div>
  )
}

export default Hero
