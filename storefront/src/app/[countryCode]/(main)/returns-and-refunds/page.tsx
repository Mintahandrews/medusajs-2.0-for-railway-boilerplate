import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Returns & Refunds | Letscase",
  description:
    "Returns, exchanges, and refunds policy for Letscase orders. Review eligibility, timeframes, and how to start a return.",
}

export default function ReturnsAndRefundsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Returns &amp; Refunds</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        This page is a template policy you can customize for your business.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Eligibility</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Items must be unused, in original packaging, and in resellable condition.
            Some items (for example, clearance items or hygiene-sensitive products) may be
            non-returnable.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Return window</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Returns must be requested within a reasonable time after delivery. Update this
            section with your specific timeframe.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Refunds</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Approved refunds are issued to the original payment method where possible.
            Processing time depends on your payment provider and bank.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Exchanges</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you need a different size, color, or model, contact us to confirm availability
            before sending anything back.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">How to start a return</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Contact us with your order number and the item(s) you want to return. We’ll share
            the next steps and return instructions.
          </p>
        </section>
      </div>
    </div>
  )
}
