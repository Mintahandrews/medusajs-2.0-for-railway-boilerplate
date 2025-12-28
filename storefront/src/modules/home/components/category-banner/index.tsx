import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CategoryBanner() {
    const categories = [
        {
            name: "Phones",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                </svg>
            )
        },
        {
            name: "Smart Watches",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="13" x="4" y="9" rx="2" />
                    <path d="M8 2.2V9" />
                    <path d="M16 2.2V9" />
                    <path d="M8 22v-6.2" />
                    <path d="M16 22v-6.2" />
                </svg>
            )
        },
        {
            name: "Cameras",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                </svg>
            )
        },
        {
            name: "Headphones",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 14v3a2 2 0 0 0 2 2h2v-5H3z" />
                    <path d="M17 14v5h2a2 2 0 0 0 2-2v-3" />
                    <path d="M21 14h-4v5h4" />
                    <path d="M3 14h4v5H3" />
                    <path d="M4 14v-3a8 8 0 1 1 16 0v3" />
                </svg>
            )
        },
        {
            name: "Computers",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
                    <line x1="2" x2="22" y1="20" y2="20" />
                </svg>
            )
        },
        {
            name: "Gaming",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" x2="10" y1="12" y2="12" />
                    <line x1="8" x2="8" y1="10" y2="14" />
                    <line x1="15" x2="15.01" y1="13" y2="13" />
                    <line x1="18" x2="18.01" y1="11" y2="11" />
                    <rect width="20" height="12" x="2" y="6" rx="2" />
                </svg>
            )
        },
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
                <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-4 small:gap-8">
                    {categories.map((cat) => (
                        <LocalizedClientLink key={cat.name} href={`/categories/${cat.name.toLowerCase().replace(" ", "-")}`} className="flex flex-col items-center justify-center gap-4 bg-[#EDEDED] py-6 rounded-xl hover:bg-black hover:text-white transition-colors group">
                            <span className="text-gray-900 group-hover:text-white">{cat.icon}</span>
                            <span className="text-base font-medium">{cat.name}</span>
                        </LocalizedClientLink>
                    ))}
                </div>
            </div>
        </div>
    )
}
