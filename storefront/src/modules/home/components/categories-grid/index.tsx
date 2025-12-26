
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight } from "@medusajs/icons"

const CategoriesGrid = () => {
    const categories = [
        {
            title: "Phone Cases",
            handle: "phone-cases",
            // Placeholder gradients/colors for aesthetics until real images are used
            bgClass: "bg-gradient-to-br from-blue-50 to-indigo-100",
            description: "Protection meets style for your device",
        },
        {
            title: "Audio",
            handle: "audio",
            bgClass: "bg-gradient-to-br from-purple-50 to-pink-100",
            description: "Immersive sound, wireless freedom",
        },
        {
            title: "Chargers",
            handle: "chargers",
            bgClass: "bg-gradient-to-br from-amber-50 to-orange-100",
            description: "Fast charging power for all devices",
        },
        {
            title: "Accessories",
            handle: "accessories",
            bgClass: "bg-gradient-to-br from-emerald-50 to-teal-100",
            description: "Essential add-ons for your ecosystem",
        },
    ]

    return (
        <div className="content-container py-16">
            <div className="flex flex-col mb-10 gap-4">
                <h2 className="text-3xl font-bold text-gray-900">
                    Shop by Category
                </h2>
                <p className="text-gray-600 max-w-lg">
                    Explore our wide range of premium tech accessories tailored to your needs.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <LocalizedClientLink
                        key={category.handle}
                        href={`/categories/${category.handle}`}
                        className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block"
                    >
                        <div className={`h-64 sm:h-80 w-full p-6 flex flex-col justify-between ${category.bgClass} relative z-0`}>

                            {/* Decorative Circle */}
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/30 blur-2xl group-hover:bg-white/40 transition-colors duration-500" />

                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-letscase-700 transition-colors">
                                    {category.title}
                                </h3>
                                <p className="text-sm font-medium text-gray-600 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {category.description}
                                </p>
                            </div>

                            <div className="self-end p-2 rounded-full bg-white/50 backdrop-blur-sm group-hover:bg-white group-hover:text-letscase-600 transition-all duration-300">
                                <ArrowRight className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                        </div>
                    </LocalizedClientLink>
                ))}
            </div>
        </div>
    )
}

export default CategoriesGrid

