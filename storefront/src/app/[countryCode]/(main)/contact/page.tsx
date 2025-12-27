import { Button, Heading, Input, Text, Textarea } from "@medusajs/ui"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with Cyber support.",
}

export default function ContactPage() {
    return (
        <div className="content-container py-12 small:py-24">
            <div className="flex flex-col small:flex-row gap-16">
                <div className="flex-1 flex flex-col gap-y-8">
                    <Heading level="h1" className="text-5xl font-bold tracking-tight">
                        Contact Us
                    </Heading>
                    <Text className="text-lg text-ui-fg-subtle">
                        Have a question or need assistance? Our team is here to help. Fill out the form or reach us via email at support@cyber.com.
                    </Text>

                    <div className="flex flex-col gap-4 mt-4">
                        <div>
                            <span className="font-bold block">Address</span>
                            <span className="text-ui-fg-subtle">123 Tech Boulevard, Silicon Valley, CA</span>
                        </div>
                        <div>
                            <span className="font-bold block">Phone</span>
                            <span className="text-ui-fg-subtle">+1 (555) 123-4567</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-gray-50 p-8 rounded-lg">
                    <form className="flex flex-col gap-y-6">
                        <div className="flex flex-col gap-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <input className="w-full bg-white border border-gray-200 rounded-md h-10 px-4 focus:border-cyber-accent outline-none transition-colors" placeholder="Your Name" />
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input className="w-full bg-white border border-gray-200 rounded-md h-10 px-4 focus:border-cyber-accent outline-none transition-colors" placeholder="your@email.com" />
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <textarea className="w-full bg-white border border-gray-200 rounded-md p-4 min-h-[150px] focus:border-cyber-accent outline-none transition-colors" placeholder="How can we help?" />
                        </div>
                        <Button className="w-full h-12 bg-cyber-accent text-white hover:bg-cyber-accent/80 rounded-md">Send Message</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
