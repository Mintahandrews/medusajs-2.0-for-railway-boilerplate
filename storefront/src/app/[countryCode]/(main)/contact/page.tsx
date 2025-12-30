import { Metadata } from "next"

import ContactForm from "@modules/common/components/contact-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

      <div className="mt-8 grid grid-cols-1 small:grid-cols-3 gap-4">
        <div className="rounded-[16px] border border-grey-20 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-grey-90">Order support</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Track orders, update delivery details, and get help with checkout.
          </p>
          <div className="mt-3">
            <LocalizedClientLink
              href="/order-tracking"
              className="text-[14px] font-semibold text-ui-fg-interactive hover:underline"
            >
              Go to Order Tracking
            </LocalizedClientLink>
          </div>
        </div>

        <div className="rounded-[16px] border border-grey-20 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-grey-90">Returns &amp; refunds</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Review eligibility and steps before starting a return.
          </p>
          <div className="mt-3">
            <LocalizedClientLink
              href="/returns-and-refunds"
              className="text-[14px] font-semibold text-ui-fg-interactive hover:underline"
            >
              View policy
            </LocalizedClientLink>
          </div>
        </div>

        <div className="rounded-[16px] border border-grey-20 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-grey-90">Product questions</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Not sure what fits your device? We’ll help you pick.
          </p>
          <div className="mt-3">
            <LocalizedClientLink
              href="/faq"
              className="text-[14px] font-semibold text-ui-fg-interactive hover:underline"
            >
              Read FAQs
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-[16px] border border-grey-20 bg-white p-6">
        <h2 className="text-[18px] font-semibold text-grey-90">Send a message</h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
          Fill out the form below. It will open your email app with a pre-filled message.
        </p>
        <ContactForm />
      </div>
    </div>
  )
}
