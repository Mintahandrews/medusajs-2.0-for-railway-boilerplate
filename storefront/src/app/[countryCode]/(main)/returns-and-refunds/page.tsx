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
        At Letscase, we want you to be completely satisfied with your purchase.
        If something isn&rsquo;t right, we&rsquo;re here to help. Please review
        our policy below to understand your options for returns, exchanges, and
        refunds.
      </p>

      <div className="mt-8 rounded-[16px] border border-grey-20 bg-white p-6">
        <p className="text-[13px] font-semibold text-grey-90">On this page</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "Eligibility", href: "#eligibility" },
            { label: "Non-returnable items", href: "#non-returnable" },
            { label: "Return window", href: "#return-window" },
            { label: "Condition of returns", href: "#condition" },
            { label: "Refunds", href: "#refunds" },
            { label: "Exchanges", href: "#exchanges" },
            { label: "Damaged or defective items", href: "#damaged" },
            { label: "How to start a return", href: "#start-a-return" },
            { label: "Contact", href: "#contact" },
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
          Last updated: March 1, 2026
        </p>
      </div>

      <div className="mt-10 space-y-8">
        <section id="eligibility">
          <h2 className="text-[18px] font-semibold text-grey-90">
            1. Eligibility
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Most items purchased from Letscase are eligible for a return or
            exchange provided they meet the conditions outlined below. To
            qualify, the return must be initiated within the applicable return
            window and the item must be in its original condition.
          </p>
        </section>

        <section id="non-returnable">
          <h2 className="text-[18px] font-semibold text-grey-90">
            2. Non-Returnable Items
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            The following items cannot be returned or exchanged:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              <strong className="text-grey-90">Custom-designed phone cases</strong>{" "}
              &mdash; cases made with your own uploaded images or personalised
              text are produced specifically for you and cannot be resold.
            </li>
            <li>
              <strong className="text-grey-90">Screen protectors</strong> that
              have been applied or opened from their sealed packaging.
            </li>
            <li>
              <strong className="text-grey-90">Earphones and earbuds</strong>{" "}
              that have been opened or used, for hygiene reasons.
            </li>
            <li>
              <strong className="text-grey-90">Clearance / final-sale items</strong>{" "}
              &mdash; items marked as final sale at the time of purchase.
            </li>
            <li>
              <strong className="text-grey-90">Gift cards</strong> and digital
              vouchers.
            </li>
          </ul>
        </section>

        <section id="return-window">
          <h2 className="text-[18px] font-semibold text-grey-90">
            3. Return Window
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            You have <strong className="text-grey-90">7 days</strong> from the
            date of delivery (or in-store pickup) to request a return. After
            this period, we are unable to accept return requests unless the item
            is defective or damaged (see Section&nbsp;7 below).
          </p>
        </section>

        <section id="condition">
          <h2 className="text-[18px] font-semibold text-grey-90">
            4. Condition of Returned Items
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            To be eligible for a return, items must be:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>Unused and in the same condition as when you received them.</li>
            <li>In the original packaging, including any tags, manuals, and accessories.</li>
            <li>Free from scratches, dents, or any signs of use.</li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            Items that do not meet these conditions may be returned to you or a
            partial refund may be offered at our discretion.
          </p>
        </section>

        <section id="refunds">
          <h2 className="text-[18px] font-semibold text-grey-90">
            5. Refunds
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Once we receive and inspect your returned item, we will notify you
            of the approval or rejection of your refund. If approved:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              Refunds are processed to your{" "}
              <strong className="text-grey-90">original payment method</strong>{" "}
              (Mobile Money, card, or bank transfer via Paystack).
            </li>
            <li>
              Mobile Money refunds are typically reflected within{" "}
              <strong className="text-grey-90">24&ndash;48 hours</strong>.
            </li>
            <li>
              Card and bank refunds may take{" "}
              <strong className="text-grey-90">5&ndash;10 business days</strong>{" "}
              depending on your bank or card issuer.
            </li>
            <li>
              Original shipping or delivery fees are{" "}
              <strong className="text-grey-90">non-refundable</strong> unless
              the return is due to our error or a defective product.
            </li>
          </ul>
        </section>

        <section id="exchanges">
          <h2 className="text-[18px] font-semibold text-grey-90">
            6. Exchanges
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you need a different colour, model, or variant, please contact us
            before sending the item back so we can confirm availability. If the
            replacement item has a different price, we will advise you on any
            additional payment or partial refund.
          </p>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            For in-store pickup orders, exchanges can be done directly at our
            store location, subject to stock availability.
          </p>
        </section>

        <section id="damaged">
          <h2 className="text-[18px] font-semibold text-grey-90">
            7. Damaged or Defective Items
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you receive an item that is damaged, defective, or different from
            what you ordered, please contact us within{" "}
            <strong className="text-grey-90">48 hours</strong> of delivery with:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>Your order number.</li>
            <li>A clear photo or video showing the issue.</li>
            <li>A brief description of the problem.</li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            We will arrange a replacement or full refund (including shipping) at
            no extra cost to you. Do not discard the item or packaging until we
            have resolved the issue.
          </p>
        </section>

        <section id="start-a-return">
          <h2 className="text-[18px] font-semibold text-grey-90">
            8. How to Start a Return
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            To initiate a return, follow these steps:
          </p>
          <ol className="mt-3 list-decimal pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              Contact us via{" "}
              <a
                href="https://wa.me/233540451001"
                className="text-ui-fg-interactive hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp (+233 540 451 001)
              </a>{" "}
              or through our{" "}
              <a
                href="/contact"
                className="text-ui-fg-interactive hover:underline"
              >
                Contact page
              </a>{" "}
              with your order number and reason for the return.
            </li>
            <li>
              Our team will review your request and respond within{" "}
              <strong className="text-grey-90">24 hours</strong> with
              instructions.
            </li>
            <li>
              Ship the item back to us or drop it off at our store (if you
              picked up in store). The cost of return shipping is the
              customer&rsquo;s responsibility unless the return is due to our
              error.
            </li>
            <li>
              Once we receive and inspect the item, we will process your refund
              or exchange.
            </li>
          </ol>
        </section>

        <section id="contact">
          <h2 className="text-[18px] font-semibold text-grey-90">
            9. Questions?
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you have any questions about our returns and refunds policy,
            please don&rsquo;t hesitate to reach out:
          </p>
          <ul className="mt-3 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              <strong className="text-grey-90">WhatsApp:</strong>{" "}
              <a
                href="https://wa.me/233540451001"
                className="text-ui-fg-interactive hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                +233 540 451 001
              </a>
            </li>
            <li>
              <strong className="text-grey-90">Instagram:</strong>{" "}
              <a
                href="https://www.instagram.com/letscase_gh"
                className="text-ui-fg-interactive hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @letscase_gh
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
