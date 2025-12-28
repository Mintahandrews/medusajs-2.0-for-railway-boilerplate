import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function HomePromotions() {
    return (
        <div className="content-container py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {/* Card 1: Popular Products */}
                <div className="bg-white p-6 flex flex-col justify-between h-[360px] group hover:shadow-lg transition-shadow border border-gray-100 items-start">
                    <div className="w-full flex items-center justify-center h-[180px] mb-4">
                        <img src="/images/ipad_pro.png" alt="Popular Products" className="h-[150px] w-auto object-contain" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-light mb-2">Popular Products</h3>
                        <p className="text-xs text-gray-500 mb-6 line-clamp-2">iPad combines a magnificent 10.2-inch Retina display, incredible performance, multitasking and ease of use.</p>
                        <div className="w-full">
                            <Button variant="secondary" className="w-full border-black border hover:bg-black hover:text-white transition-colors">Shop Now</Button>
                        </div>
                    </div>
                </div>

                {/* Card 2: Ipad Pro */}
                <div className="bg-[#F9F9F9] p-8 flex flex-col justify-between h-[360px] relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-2xl font-light mb-4">Ipad Pro</h3>
                        <p className="text-xs text-gray-500 font-medium line-clamp-3">iPad combines a magnificent 10.2-inch Retina display, incredible performance, multitasking and ease of use.</p>
                        <LocalizedClientLink href="/store" className="mt-6 inline-block font-medium underline decoration-1 underline-offset-4">Shop Now</LocalizedClientLink>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] w-[220px] h-[220px] flex items-center justify-center">
                        <img src="/images/ipad_pro.png" alt="iPad Pro" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Card 3: Samsung Galaxy */}
                <div className="bg-[#EAEAEA] p-8 flex flex-col justify-between h-[360px] relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-2xl font-light mb-4">Samsung Galaxy</h3>
                        <p className="text-xs text-gray-500 font-medium line-clamp-3">Unfold a whole new world of possibilities with the latest Galaxy Z Fold. Multitasking has never been easier.</p>
                        <LocalizedClientLink href="/store" className="mt-6 inline-block font-medium underline decoration-1 underline-offset-4">Shop Now</LocalizedClientLink>
                    </div>
                    <div className="absolute right-[-30px] bottom-0 w-[220px] h-[220px] flex items-center justify-center">
                        <img src="/images/galaxy_fold.png" alt="Samsung Galaxy" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Card 4: Macbook Pro */}
                <div className="bg-[#2C2C2C] text-white p-8 flex flex-col justify-between h-[360px] relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-2xl font-light mb-4 text-white">Macbook Pro</h3>
                        <p className="text-xs text-gray-400 font-medium line-clamp-3">The most powerful MacBook Pro ever is here. With the blazing-fast M2 Pro or M2 Max chip.</p>
                        <LocalizedClientLink href="/store" className="mt-6 inline-block font-medium underline decoration-1 underline-offset-4 text-white">Shop Now</LocalizedClientLink>
                    </div>
                    <div className="absolute right-[-20px] bottom-0 w-[250px] h-[200px] flex items-center justify-center">
                        <img src="/images/macbook_pro.png" alt="Macbook Pro" className="w-full h-full object-contain" />
                    </div>
                </div>
            </div>
        </div>
    )
}
