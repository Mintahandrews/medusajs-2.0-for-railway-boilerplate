import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function SummerSaleBanner() {
    return (
        <div className="w-full bg-gradient-to-r from-teal-900 via-teal-800 to-teal-700 text-white py-0 my-16 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between py-12 gap-8 md:gap-0">
                <div className="hidden md:block w-1/4">
                    <img src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&h=300&fit=crop&auto=format" alt="Tablet" className="w-[80%] h-auto rounded object-contain transform -rotate-6 opacity-80" />
                </div>

                <div className="text-center flex-1 z-10">
                    <h2 className="text-5xl md:text-6xl font-thin tracking-tighter mb-4">
                        Big Summer <span className="font-bold">Sale</span>
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-md mx-auto">Commodo fames vitae vitae leo mauris in. Eu consequat.</p>
                    <LocalizedClientLink href="/store">
                        <Button className="px-10 py-3 bg-transparent border border-white text-white rounded hover:bg-white hover:text-teal-900 transition-colors text-base font-medium">Shop Now</Button>
                    </LocalizedClientLink>
                </div>

                <div className="hidden md:block w-1/4 flex justify-end">
                    <img src="https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop&auto=format" alt="Watch" className="w-[80%] h-auto rounded object-contain transform rotate-12 opacity-80" />
                </div>
            </div>
        </div>
    )
}
