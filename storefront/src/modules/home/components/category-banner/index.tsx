import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Smartphone, Watch, Camera, Headphones, Monitor, Gamepad, ChevronLeft, ChevronRight } from "lucide-react"

export default function CategoryBanner() {
    const categories = [
        {
            name: "Phones",
            icon: Smartphone
        },
        {
            name: "Smart Watches",
            icon: Watch
        },
        {
            name: "Cameras",
            icon: Camera
        },
        {
            name: "Headphones",
            icon: Headphones
        },
        {
            name: "Computers",
            icon: Monitor
        },
        {
            name: "Gaming",
            icon: Gamepad
        },
    ]

    return (
        <div className="w-full bg-[#FAFAFA] py-12">
            <div className="content-container">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Browse By Category</h2>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-gray-200 border border-transparent hover:border-gray-300 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-gray-200 border border-transparent hover:border-gray-300 transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-4 small:gap-4">
                    {categories.map((cat) => (
                        <LocalizedClientLink key={cat.name} href={`/categories/${cat.name.toLowerCase().replace(" ", "-")}`} className="flex flex-col items-center justify-center gap-4 bg-[#EDEDED] py-6 rounded-xl hover:bg-gray-200 transition-colors group cursor-pointer h-[128px]">
                            <cat.icon className="w-8 h-8 text-black" strokeWidth={1.5} />
                            <span className="text-base font-medium text-black">{cat.name}</span>
                        </LocalizedClientLink>
                    ))}
                </div>
            </div>
        </div>
    )
}
