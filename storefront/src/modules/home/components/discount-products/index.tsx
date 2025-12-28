import { Button, Text, Heading } from "@medusajs/ui"
import { Heart } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const products = [
    {
        id: 9,
        name: 'Apple iPhone 14 Pro 512GB Gold (MQ233)',
        price: 1437,
        image: 'https://images.unsplash.com/photo-1678652985731-e5656c6f3f8b?w=400&h=400&fit=crop&auto=format'
    },
    {
        id: 10,
        name: 'AirPods Max Silver Starlight Aluminium',
        price: 549,
        image: 'https://images.unsplash.com/photo-1625135516593-2677578ded3f?w=400&h=400&fit=crop&auto=format'
    },
    {
        id: 11,
        name: 'Apple Watch Series 9 GPS 41mm',
        price: 399,
        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop&auto=format'
    },
    {
        id: 12,
        name: 'Apple iPhone 14 Pro 1TB Gold (MQ2V3)',
        price: 1499,
        image: 'https://images.unsplash.com/photo-1678911820864-e5c67c6e21d5?w=400&h=400&fit=crop&auto=format'
    }
]

const DiscountProducts = () => {
    return (
        <div className="content-container py-12">
            <Heading level="h2" className="text-2xl font-bold mb-8">Discounts up to -50%</Heading>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map(product => (
                    <div key={product.id} className="bg-[#F6F6F6] rounded-lg p-6 relative group flex flex-col justify-between h-[400px]">
                        <div>
                            <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors z-10">
                                <Heart className="w-6 h-6" />
                            </button>
                            <div className="w-full h-48 flex items-center justify-center mb-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                            <Text className="text-base font-medium mb-2 line-clamp-2 text-center h-[50px] flex items-center justify-center">
                                {product.name}
                            </Text>
                            <Heading level="h3" className="text-xl font-bold mb-4 text-center">
                                ${product.price}
                            </Heading>
                        </div>
                        <LocalizedClientLink href={`/products/${product.id}`}>
                            <Button className="w-full bg-black text-white hover:bg-black/80 h-[48px] rounded-lg">
                                Buy Now
                            </Button>
                        </LocalizedClientLink>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DiscountProducts
