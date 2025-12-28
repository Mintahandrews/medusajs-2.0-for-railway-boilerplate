import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@medusajs/ui"

export default function PromotionalBanners() {
    return (
        <div className="w-full bg-white content-container py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. PlayStation 5 */}
                <div className="col-span-1 lg:col-span-1 bg-gray-100 p-8 rounded-lg flex flex-col items-center justify-between h-[360px]">
                    <div className="w-full flex justify-center flex-1 items-center">
                        <img src="/images/ps5.png" alt="PlayStation 5" className="h-[200px] w-auto object-contain" />
                    </div>
                    <div className="w-full">
                        <h3 className="text-2xl font-bold mb-2 text-black">Playstation 5</h3>
                        <p className="text-sm text-gray-500 line-clamp-3">Incredibly powerful CPUs, GPUs, and an SSD with integrated I/O will redefine your PlayStation experience.</p>
                    </div>
                </div>

                {/* 2. MacBook Air (Span 2) */}
                <div className="col-span-1 md:col-span-2 bg-[#EDEDED] p-8 rounded-lg flex flex-col-reverse sm:flex-row items-center justify-between gap-8 h-[360px]">
                    <div className="flex flex-col gap-4 max-w-[50%] items-start">
                        <h3 className="text-3xl font-light text-black">Macbook <span className="font-bold">Air</span></h3>
                        <p className="text-sm text-gray-500 line-clamp-3">The new 15-inch MacBook Air makes room for more of what you love with a spacious Liquid Retina display.</p>
                        <Button variant="secondary" className="w-fit border-black border px-8 py-2 rounded-md hover:bg-black hover:text-white transition-colors bg-transparent text-black">Shop Now</Button>
                    </div>
                    <div className="flex-1 h-full flex items-center justify-center">
                        <img src="/images/macbook_air.png" alt="MacBook Air" className="h-[200px] w-auto object-contain" />
                    </div>
                </div>

                {/* 3. iPhone */}
                <div className="col-span-1 bg-[#EDEDED] p-8 rounded-lg flex items-center justify-center h-[360px] overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=400&h=300&fit=crop&auto=format" alt="iPhone" className="h-full w-auto object-contain mix-blend-multiply" />
                </div>

                {/* 4. AirPods Max */}
                <div className="col-span-1 bg-[#EDEDED] p-6 rounded-lg flex flex-col-reverse sm:flex-row lg:flex-col items-center justify-between h-[360px]">
                    <div className="w-full mt-4 lg:mt-0">
                        <h3 className="text-xl font-bold mb-1 text-black">Apple AirPods Max</h3>
                        <p className="text-xs text-gray-500">Computational audio. Listen, it's powerful</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <img src="https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=300&h=300&fit=crop&auto=format" alt="AirPods Max" className="h-[180px] w-auto object-contain mix-blend-multiply" />
                    </div>
                </div>

                {/* 5. Apple Vision Pro (Dark) */}
                <div className="col-span-1 bg-[#353535] p-6 rounded-lg flex flex-col justify-between h-[360px]">
                    <div className="w-full text-white">
                        <h3 className="text-xl font-bold mb-1">Apple Vision Pro</h3>
                        <p className="text-xs text-gray-400">An immersive way to experience entertainment</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <img src="https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=300&h=200&fit=crop&auto=format" alt="Vision Pro" className="w-[90%] h-auto object-contain" />
                    </div>
                </div>

                {/* 6. MacBook Pro (Span 2) */}
                <div className="col-span-1 md:col-span-2 bg-[#EDEDED] p-8 rounded-lg flex items-center justify-center relative overflow-hidden h-[360px]">
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="w-full h-full relative">
                            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop&auto=format" alt="MacBook Pro" className="w-full h-full object-cover rounded-lg" />
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-8 z-10">
                        <Button variant="secondary" className="border-white border px-8 py-2 rounded-md hover:bg-white hover:text-black transition-colors bg-black/50 text-white backdrop-blur-sm">Shop Now</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
