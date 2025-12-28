import { Heading, Text } from "@medusajs/ui"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn more about Letscase.",
}

export default function AboutPage() {
    return (
        <div className="content-container py-12 small:py-24">
            <div className="flex flex-col gap-y-12 max-w-2xl mx-auto text-center">
                <Heading level="h1" className="text-5xl font-bold tracking-tight">
                    About Letscase
                </Heading>
                <Text className="text-lg text-ui-fg-subtle leading-relaxed">
                    Letscase is a premier technology retailer dedicated to bringing you the most advanced and desirable electronics on the market. From the latest smartphones to high-performance computing, we curate a selection of products that define the future.
                </Text>
                <div className="grid grid-cols-1 small:grid-cols-3 gap-8 mt-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-bold text-xl mb-2">Quality</h3>
                        <p className="text-sm text-gray-600">Only the best brands and original products.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-bold text-xl mb-2">Service</h3>
                        <p className="text-sm text-gray-600">24/7 support for all your technical needs.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-bold text-xl mb-2">Delivery</h3>
                        <p className="text-sm text-gray-600">Fast and secure shipping worldwide.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
