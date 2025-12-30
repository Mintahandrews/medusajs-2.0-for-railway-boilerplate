import { Metadata } from "next"

import FaqAccordion, { FaqItem } from "@modules/common/components/faq-accordion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "FAQ | Letscase",
  description:
    "Answers to common questions about ordering, delivery, returns, and support at Letscase.",
}

export default function FaqPage() {
  const items: FaqItem[] = [
    {
      category: "Delivery",
      question: "Where do you deliver?",
      answer:
        "We deliver across Ghana. Delivery timelines and fees vary by location and will be shown during checkout.",
    },
    {
      category: "Delivery",
      question: "How long does delivery take?",
      answer:
        "Orders are typically processed quickly, then dispatched based on your delivery location. If you need an urgent delivery, contact support before ordering.",
    },
    {
      category: "Orders",
      question: "How can I track my order?",
      answer:
        "You can track your order from your account Orders page. If you need help, use the Order Tracking page or contact support with your order number.",
    },
    {
      category: "Returns",
      question: "Can I return an item?",
      answer:
        "Yes. Please review our Returns & Refunds policy for eligibility and the steps to start a return.",
    },
    {
      category: "Products",
      question: "Do you offer warranties?",
      answer:
        "Warranty coverage depends on the product. If applicable, it will be described on the product page or included with your purchase.",
    },
    {
      category: "Support",
      question: "How do I contact support?",
      answer:
        "Use the Contact page and include your order number (if you have one). We’ll get back to you as soon as possible.",
    },
  ]

  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Frequently Asked Questions</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Quick answers to help you shop with confidence. If you can’t find what you need,
        reach out via our Contact page.
      </p>

      <FaqAccordion items={items} />

      <div className="mt-12 rounded-[16px] border border-grey-20 bg-white p-6">
        <h2 className="text-[16px] font-semibold text-grey-90">Still need help?</h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
          Contact our support team and include your order number (if available).
        </p>
        <div className="mt-4 flex flex-col small:flex-row gap-3">
          <LocalizedClientLink
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full bg-ui-bg-interactive px-6 text-white text-[14px] font-semibold hover:bg-ui-bg-interactive-hover transition"
          >
            Contact us
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/order-tracking"
            className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-ui-border-interactive hover:text-ui-fg-interactive transition"
          >
            Order tracking
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
