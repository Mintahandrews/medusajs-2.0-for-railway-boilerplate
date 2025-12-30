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

      <div className="mt-8 rounded-[16px] border border-grey-20 bg-white p-6">
        <p className="text-[13px] font-semibold text-grey-90">On this page</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "Eligibility", href: "#eligibility" },
            { label: "Return window", href: "#return-window" },
            { label: "Refunds", href: "#refunds" },
            { label: "Exchanges", href: "#exchanges" },
            { label: "Start a return", href: "#start-a-return" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex h-9 items-center rounded-full border border-grey-20 bg-white px-4 text-[13px] font-semibold text-grey-90 hover:border-ui-border-interactive hover:text-ui-fg-interactive transition"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-grey-50">
          Last updated: December 30, 2025
        </p>
      </div>

      <div className="mt-10 space-y-8">
        <section id="eligibility">
          <h2 className="text-[18px] font-semibold text-grey-90">Eligibility</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Items must be unused, in original packaging, and in resellable condition.
            Some items (for example, clearance items or hygiene-sensitive products) may be
            non-returnable.
          </p>
        </section>

        <section id="return-window">
          <h2 className="text-[18px] font-semibold text-grey-90">Return window</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Returns must be requested within a reasonable time after delivery. Update this
            section with your specific timeframe.
          </p>
        </section>

        <section id="refunds">
          <h2 className="text-[18px] font-semibold text-grey-90">Refunds</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Approved refunds are issued to the original payment method where possible.
            Processing time depends on your payment provider and bank.
          </p>
        </section>

        <section id="exchanges">
          <h2 className="text-[18px] font-semibold text-grey-90">Exchanges</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you need a different size, color, or model, contact us to confirm availability
            before sending anything back.
          </p>
        </section>

        <section id="start-a-return">
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
