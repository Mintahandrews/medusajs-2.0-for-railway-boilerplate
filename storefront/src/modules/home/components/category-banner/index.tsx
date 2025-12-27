import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CategoryBanner() {
    const categories = [
        { name: "Phones", icon: "📱" },
        { name: "Smart Watches", icon: "⌚" },
        { name: "Cameras", icon: "📷" },
        { name: "Headphones", icon: "🎧" },
        { name: "Computers", icon: "💻" },
        { name: "Gaming", icon: "🎮" },
    ]

    return (
        <div className="w-full bg-[#FAFAFA] py-16">
            <div className="content-container">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-medium">Browse By Category</h2>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-gray-200">{"<"}</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-gray-200">{">"}</button>
                    </div>
                </div>
                <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-8">
                    {categories.map((cat) => (
                        <LocalizedClientLink key={cat.name} href={`/categories/${cat.name.toLowerCase().replace(" ", "-")}`} className="flex flex-col items-center justify-center gap-4 bg-[#EDEDED] py-6 rounded-xl hover:bg-cyber-accent hover:text-white transition-colors group">
                            <span className="text-4xl">{cat.icon}</span>
                            <span className="text-base font-medium">{cat.name}</span>
                        </LocalizedClientLink>
                    ))}
                </div>
            </div>
        </div>
    )
}
