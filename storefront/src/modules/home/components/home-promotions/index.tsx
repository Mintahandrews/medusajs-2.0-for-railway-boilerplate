import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HomePromotions() {
    return (
        <div className="content-container py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Card 1: Popular Products */}
                <div className="bg-white p-6 flex flex-col justify-between h-[360px] group hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="flex gap-4">
                        <div className="w-1/2 h-24 bg-[#F5F5F5] flex items-center justify-center"><img src="https://raw.githubusercontent.com/medusajs/nextjs-starter-medusa/main/public/us-flag.png" className="h-12 opacity-0" alt="placeholder" /></div> {/* Placeholder */}
                        <div className="w-1/2 h-24 bg-[#F5F5F5] flex items-center justify-center"></div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-light mb-2">Popular Products</h3>
                        <p className="text-xs text-gray-500 mb-6">iPad combines a magnificent 10.2-inch Retina display, incredible performance, multitasking and ease of use.</p>
                        <div className="w-full">
                            <Button variant="secondary" className="w-full border-black border hover:bg-black hover:text-white transition-colors">Shop Now</Button>
                        </div>
                    </div>
                </div>

                {/* Card 2: Ipad Pro */}
                <div className="bg-[#F9F9F9] p-8 flex flex-col justify-between h-[360px] relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-2xl font-light mb-4">Ipad Pro</h3>
                        <p className="text-xs text-gray-500 font-medium">iPad combines a magnificent 10.2-inch Retina display, incredible performance, multitasking and ease of use.</p>
                        <LocalizedClientLink href="/store" className="mt-6 inline-block font-medium underline decoration-1 underline-offset-4">Shop Now</LocalizedClientLink>
                    </div>
                    <div className="absolute overflow-hidden right-[-50px] bottom-0 w-[200px] h-[200px] bg-gray-200 rounded-full opacity-50"></div> {/* Visual placeholder */}
                </div>

                {/* Card 3: Samsung Galaxy */}
                <div className="bg-[#EAEAEA] p-8 flex flex-col justify-between h-[360px] relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-2xl font-light mb-4">Samsung Galaxy</h3>
                        <p className="text-xs text-gray-500 font-medium">Unfold a whole new world of possibilities with the latest Galaxy Z Fold. Multitasking has never been easier.</p>
                        <LocalizedClientLink href="/store" className="mt-6 inline-block font-medium underline decoration-1 underline-offset-4">Shop Now</LocalizedClientLink>
                    </div>
                    <div className="absolute right-[-40px] bottom-[-40px] w-[200px] h-[200px] bg-gray-300 rounded-full opacity-50"></div>
                </div>

                {/* Card 4: Macbook Pro */}
                <div className="bg-[#2C2C2C] text-white p-8 flex flex-col justify-between h-[360px] relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-2xl font-light mb-4 text-white">Macbook Pro</h3>
                        <p className="text-xs text-gray-400 font-medium">The most powerful MacBook Pro ever is here. With the blazing-fast M2 Pro or M2 Max chip.</p>
                        <LocalizedClientLink href="/store" className="mt-6 inline-block font-medium underline decoration-1 underline-offset-4 text-white">Shop Now</LocalizedClientLink>
                    </div>
                    <div className="absolute right-[-40px] bottom-0 w-[200px] h-[150px] bg-gray-600 rounded-md opacity-50"></div>
                </div>
            </div>
        </div>
    )
}
