import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-700 w-full relative overflow-hidden">
      <div className="content-container flex flex-col-reverse md:flex-row items-center justify-between py-20 text-white relative z-10">
        <div className="max-w-xl text-center md:text-left flex flex-col items-center md:items-start">
          <span className="text-gray-300 text-lg font-medium mb-2">Pro.Beyond.</span>
          <Heading
            level="h1"
            className="text-6xl small:text-8xl font-thin tracking-tighter mb-4"
          >
            iPhone 14 <span className="font-bold">Pro</span>
          </Heading>
          <Text className="text-lg text-gray-300 max-w-[400px] mb-8">
            Created to change everything for the better. For everyone.
          </Text>

          <LocalizedClientLink href="/store">
            <Button variant="secondary" className="px-8 py-3 bg-transparent border border-white text-white rounded hover:bg-white hover:text-teal-900 transition-colors text-base font-medium">
              Shop Now
            </Button>
          </LocalizedClientLink>
        </div>

        <div className="relative w-full md:w-1/2 flex items-center justify-center mb-10 md:mb-0">
          <img
            src="/images/hero_iphone.png"
            alt="iPhone 14 Pro"
            className="object-contain max-h-[500px] w-auto z-10"
          />
        </div>
      </div>
    </div>
  )
}

export default Hero
