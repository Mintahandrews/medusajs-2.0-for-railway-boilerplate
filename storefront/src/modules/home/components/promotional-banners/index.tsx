import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@medusajs/ui"

export default function PromotionalBanners() {
    return (
        <div className="w-full bg-white content-container py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
                {/* PlayStation 5 Banner */}
                <div className="flex bg-white py-16 px-8 items-center justify-between">
                    <div className="flex flex-col gap-4 max-w-[200px]">
                        <div className="flex items-center gap-2">
                            <img src="https://raw.githubusercontent.com/medusajs/nextjs-starter-medusa/main/public/ps5-logo-placeholder.png" alt="" className="h-10 w-auto object-contain invisible" /> {/* Placeholder/Invisible */}
                        </div>
                        <h3 className="text-4xl font-light">Playstation 5</h3>
                        <p className="text-gray-500 text-sm">Incredibly powerful CPUs, GPUs, and an SSD with integrated I/O will rewrite your PlayStation experience.</p>
                    </div>
                    <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center">
                        {/* Image Placeholder */}
                        <span className="text-gray-300">PS5 Image</span>
                    </div>
                </div>

                {/* Macbook Air Banner */}
                <div className="flex bg-[#EDEDED] py-16 px-8 items-center justify-between">
                    <div className="flex flex-col gap-4 max-w-[200px]">
                        <h3 className="text-4xl font-light">Macbook <br /> <span className="font-bold">Air</span></h3>
                        <p className="text-gray-500 text-sm">The new 15-inch MacBook Air makes room for more of what you love with a spacious Liquid Retina display.</p>
                        <Button variant="secondary" className="w-fit border-black border px-8 py-2 rounded-md hover:bg-black hover:text-white transition-colors">Shop Now</Button>
                    </div>
                    <div className="w-[200px] h-[150px] bg-white flex items-center justify-center">
                        {/* Image Placeholder */}
                        <span className="text-gray-300">MacBook Image</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
