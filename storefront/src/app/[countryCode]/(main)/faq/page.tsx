import { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ | Letscase",
  description:
    "Answers to common questions about ordering, delivery, returns, and support at Letscase.",
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Frequently Asked Questions</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Quick answers to help you shop with confidence. If you can’t find what you need,
        reach out via our Contact page.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Where do you deliver?</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We deliver across Ghana. Delivery timelines and fees vary by location.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">How long does delivery take?</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Orders are typically processed quickly, then dispatched based on your delivery
            location. You’ll see delivery details during checkout.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Can I return an item?</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Yes. Please see our Returns &amp; Refunds policy for eligibility and steps.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Do you offer warranties?</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Warranty coverage depends on the product. If applicable, it will be described on
            the product page or included with your purchase.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">How do I contact support?</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Use the Contact page and we’ll get back to you as soon as possible.
          </p>
        </section>
      </div>
    </div>
  )
}
