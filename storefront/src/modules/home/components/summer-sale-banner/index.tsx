import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function SummerSaleBanner() {
    return (
        <div className="w-full bg-gradient-to-r from-[#211c24] to-[#211c24] text-white py-24 relative overflow-hidden mt-16 mb-16">
            <div className="content-container flex flex-col items-center justify-center text-center z-10 relative gap-6">
                <h2 className="text-6xl font-thin tracking-tighter">Big Summer <span className="font-bold">Sale</span></h2>
                <p className="text-gray-400 max-w-md">Commodo fames justo risus id aliquet. Sed aliquet sit ipsum viverra sit eros. Magna diam amet risus wisi semper. Arcu nulla sed.</p>
                <LocalizedClientLink href="/store">
                    <Button className="px-10 py-3 bg-transparent border border-white text-white rounded-md hover:bg-white hover:text-cyber-accent transition-colors">Shop Now</Button>
                </LocalizedClientLink>
            </div>

            {/* Background visual elements placeholders */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {/* Example floating elements */}
            </div>
        </div>
    )
}
