import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact | Letscase",
  description:
    "Contact Letscase for order support, product questions, and partnership inquiries.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Contact Letscase</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        For the fastest support, include your order number and the item(s) you’re contacting
        us about.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Customer support</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Update this section with your preferred support channels (email, phone, WhatsApp,
            store address) and hours.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Business enquiries</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you’re interested in bulk orders or partnerships, reach out and we’ll respond
            with next steps.
          </p>
        </section>
      </div>
    </div>
  )
}
