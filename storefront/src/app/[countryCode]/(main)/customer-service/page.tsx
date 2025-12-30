import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Customer Service | Letscase",
  description:
    "Help and support for Letscase orders — FAQs, returns, and how to contact us.",
}

export default function CustomerServicePage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Customer Service</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Need help with an order, delivery, or returns? Start here and we’ll point you to
        the right place.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Quick help</h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-[1.7] text-grey-60">
            <li>
              <LocalizedClientLink href="/faq" className="text-ui-fg-interactive">
                Frequently Asked Questions
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink
                href="/returns-and-refunds"
                className="text-ui-fg-interactive"
              >
                Returns &amp; Refunds
              </LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink href="/contact" className="text-ui-fg-interactive">
                Contact support
              </LocalizedClientLink>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Order information</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            For the fastest support, include your order number and a brief description of
            the issue.
          </p>
        </section>
      </div>
    </div>
  )
}
