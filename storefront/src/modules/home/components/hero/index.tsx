import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[632px] w-full relative bg-[#211c24] overflow-hidden">
      <div className="content-container h-full flex flex-col justify-center items-start text-white gap-6 relative z-10">
        <span className="text-white/40 text-2xl font-semibold">Pro. Beyond.</span>
        <Heading
          level="h1"
          className="text-8xl font-thin tracking-tighter"
        >
          IPhone 14 <span className="font-bold">Pro</span>
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

      <div className="absolute right-0 bottom-0 h-[90%] w-1/2 flex items-end justify-center pointer-events-none">
        {/* Placeholder for Hero Image - simulating the iPhone */}
        <div className="relative w-full h-full">
          <img
            src="https://raw.githubusercontent.com/medusajs/nextjs-starter-medusa/main/public/us.png"
            alt="iPhone 14 Pro"
            className="object-contain h-full w-full opacity-0"
          // Using opacity 0 because we don't have the actual iPhone asset, relying on background or future asset.
          // For now, let's render a gradient or placeholder.
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#211c24] to-transparent bg-opacity-50"></div>
        </div>
        {/* Simple Svg placeholder if image fails/is missing */}
        <svg className="absolute bottom-0 right-20 h-[500px] w-auto text-[#4a4a4a]" viewBox="0 0 300 600" fill="currentColor">
          <rect x="20" y="20" width="260" height="560" rx="30" />
        </svg>
      </div>
    </div>
  )
}

export default Hero
