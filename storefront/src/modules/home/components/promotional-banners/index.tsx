import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@medusajs/ui"

export default function PromotionalBanners() {
    return (
        <div className="w-full bg-white content-container py-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
                {/* PlayStation 5 Banner */}
                <div className="flex flex-col-reverse small:flex-row bg-white py-10 px-8 items-center justify-between gap-8 small:gap-0">
                    <div className="flex flex-col gap-4 max-w-full small:max-w-[200px] z-10 text-center small:text-left items-center small:items-start">
                        <div className="flex items-center gap-2">
                            {/*  <img src="/images/ps_logo.png" alt="" className="h-6 w-auto object-contain" /> */}
                            {/* No logo file yet, sticking to text/image */}
                        </div>
                        <h3 className="text-4xl font-light">PlayStation 5</h3>
                        <p className="text-gray-500 text-sm">Incredibly powerful CPUs, GPUs, and an SSD with integrated I/O will rewrite your PlayStation experience.</p>
                    </div>
                    <div className="w-full small:w-[200px] h-[200px] flex items-center justify-center relative">
                        <img src="/images/ps5.png" alt="PlayStation 5" className="object-contain h-full w-full" />
                    </div>
                </div>

                {/* Macbook Air Banner */}
                <div className="flex flex-col-reverse small:flex-row bg-[#EDEDED] py-10 px-8 items-center justify-between gap-8 small:gap-0">
                    <div className="flex flex-col gap-4 max-w-full small:max-w-[200px] z-10 text-center small:text-left items-center small:items-start">
                        <h3 className="text-4xl font-light">Macbook <br /> <span className="font-bold">Air</span></h3>
                        <p className="text-gray-500 text-sm">The new 15-inch MacBook Air makes room for more of what you love with a spacious Liquid Retina display.</p>
                        <Button variant="secondary" className="w-fit border-black border px-8 py-2 rounded-md hover:bg-black hover:text-white transition-colors bg-white">Shop Now</Button>
                    </div>
                    <div className="w-full small:w-[250px] h-[200px] flex items-center justify-center relative">
                        <img src="/images/macbook_air.png" alt="MacBook Air" className="object-contain h-full w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
