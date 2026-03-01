import { Metadata } from "next"

import FaqAccordion, { FaqItem } from "@modules/common/components/faq-accordion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about ordering, delivery, returns, custom phone cases, and support at Letscase Ghana.",
}

export default function FaqPage() {
  const items: FaqItem[] = [
    // ── Orders ──
    {
      category: "Orders",
      question: "How do I place an order?",
      answer:
        "Browse our store, add the items you want to your cart, and proceed to checkout. You can check out as a guest or create an account to track your orders and save your details for next time.",
    },
    {
      category: "Orders",
      question: "Can I modify or cancel my order after placing it?",
      answer:
        "We process orders quickly, so changes aren't always possible. If you need to modify or cancel, contact us on WhatsApp (+233 540 451 001) as soon as possible and we'll do our best to help.",
    },
    {
      category: "Orders",
      question: "How can I track my order?",
      answer:
        "Log in to your account and visit the Orders page, or use our Order Tracking page. You'll also receive updates via email or SMS as your order progresses.",
    },
    {
      category: "Orders",
      question: "I placed an order but didn't receive a confirmation email.",
      answer:
        "Check your spam or junk folder first. If you still can't find it, contact us with your name and phone number so we can look up your order.",
    },

    // ── Delivery ──
    {
      category: "Delivery",
      question: "Where do you deliver?",
      answer:
        "We deliver across Ghana. Delivery fees and estimated timelines vary by location and are displayed at checkout before you pay.",
    },
    {
      category: "Delivery",
      question: "How long does delivery take?",
      answer:
        "Orders within Accra are typically delivered within 1–3 business days. Other regions may take 3–7 business days depending on your location. Custom phone cases may take an additional 1–2 days for production.",
    },
    {
      category: "Delivery",
      question: "Do you offer in-store pickup?",
      answer:
        "Yes! You can choose in-store pickup during checkout for eligible orders. We'll notify you via SMS or WhatsApp when your order is ready for collection.",
    },
    {
      category: "Delivery",
      question: "What happens if I'm not available when my order arrives?",
      answer:
        "Our delivery partner will attempt to reach you by phone. If delivery cannot be completed, the package will be held and a re-delivery arranged. Please ensure your phone number is correct at checkout.",
    },

    // ── Payment ──
    {
      category: "Payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept Mobile Money (MTN MoMo, Telecel Cash), Visa and Mastercard debit/credit cards, and bank transfers — all processed securely through Paystack.",
    },
    {
      category: "Payment",
      question: "Is it safe to pay online on your website?",
      answer:
        "Absolutely. All payments are processed by Paystack, a PCI-DSS-compliant payment provider. We never store your card numbers or Mobile Money PINs on our servers.",
    },
    {
      category: "Payment",
      question: "My payment failed. What should I do?",
      answer:
        "Double-check that you have sufficient balance/funds and that your details are entered correctly. If the issue persists, try a different payment method or contact us for assistance.",
    },

    // ── Returns & Refunds ──
    {
      category: "Returns & Refunds",
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return window from the date of delivery or in-store pickup. Items must be unused, in original packaging, and in resalable condition. Visit our Returns & Refunds page for full details.",
    },
    {
      category: "Returns & Refunds",
      question: "Which items cannot be returned?",
      answer:
        "Custom-designed phone cases, opened screen protectors, used earphones/earbuds, clearance or final-sale items, and gift cards are non-returnable.",
    },
    {
      category: "Returns & Refunds",
      question: "How do I start a return?",
      answer:
        "Contact us on WhatsApp (+233 540 451 001) or via the Contact page with your order number, the item(s) you'd like to return, and the reason. We'll guide you through the process.",
    },
    {
      category: "Returns & Refunds",
      question: "How long do refunds take?",
      answer:
        "Once we receive and inspect the returned item, refunds are processed within 24–48 hours for Mobile Money and 5–10 business days for card or bank payments. Refunds are issued to the original payment method.",
    },
    {
      category: "Returns & Refunds",
      question: "Can I exchange an item instead of returning it?",
      answer:
        "Yes, subject to stock availability. Contact us within 7 days of receiving your order to arrange an exchange. If the replacement item has a different price, we'll adjust accordingly.",
    },
    {
      category: "Returns & Refunds",
      question: "What if I receive a damaged or wrong item?",
      answer:
        "Contact us within 48 hours of delivery with clear photos of the damage or incorrect item. We'll arrange a replacement or full refund at no extra cost to you.",
    },

    // ── Products ──
    {
      category: "Products",
      question: "Are your phone cases compatible with my phone model?",
      answer:
        "Each product listing specifies compatible phone models. Use the search or filter options on our store page to find cases for your exact model. If you're unsure, send us your phone model on WhatsApp and we'll help.",
    },
    {
      category: "Products",
      question: "What types of phone cases do you sell?",
      answer:
        "We offer a wide range including silicone cases, hard cases, clear cases, leather cases, and custom-designed cases. We also carry screen protectors, chargers, earphones, speakers, and laptop bags.",
    },
    {
      category: "Products",
      question: "Do your screen protectors come with an installation guide?",
      answer:
        "Yes, most of our screen protectors include an installation kit and step-by-step instructions. If you need help, visit our store for free professional installation.",
    },
    {
      category: "Products",
      question: "Do you offer warranties on your products?",
      answer:
        "Warranty coverage varies by product. Where applicable, warranty details are listed on the product page. Earphones and chargers typically come with a manufacturer's warranty of 3–6 months.",
    },
    {
      category: "Products",
      question: "Are your products original/authentic?",
      answer:
        "Yes. We source our products from trusted suppliers and authorized distributors. All branded items sold on Letscase are 100% genuine.",
    },

    // ── Custom Phone Cases ──
    {
      category: "Custom Phone Cases",
      question: "How do I design a custom phone case?",
      answer:
        "Use our custom case designer on the website — upload your image, adjust the design, and add it to your cart. You can also send us your design on WhatsApp and we'll create it for you.",
    },
    {
      category: "Custom Phone Cases",
      question: "What image quality do I need for a custom case?",
      answer:
        "For the best print quality, we recommend images with a resolution of at least 1000×1000 pixels. Higher resolution images produce sharper, more vibrant results.",
    },
    {
      category: "Custom Phone Cases",
      question: "How long does a custom case take to make?",
      answer:
        "Custom cases are typically produced within 1–2 business days after your order is confirmed, plus standard delivery time to your location.",
    },
    {
      category: "Custom Phone Cases",
      question: "Can I return a custom phone case?",
      answer:
        "Custom cases are made-to-order and cannot be returned unless they arrive damaged or with a printing defect. Contact us within 48 hours of delivery if there's an issue.",
    },

    // ── Account ──
    {
      category: "Account",
      question: "Do I need an account to place an order?",
      answer:
        "No, you can check out as a guest. However, creating an account lets you track orders, save your wishlist, store delivery addresses, and check out faster in the future.",
    },
    {
      category: "Account",
      question: "How do I reset my password?",
      answer:
        "Click 'Sign In' and then 'Forgot password?' to receive a password reset link via email. If you don't receive it, check your spam folder or contact support.",
    },

    // ── Support ──
    {
      category: "Support",
      question: "How do I contact Letscase support?",
      answer:
        "You can reach us via WhatsApp at +233 540 451 001, through our Contact page, or on Instagram @letscase_gh. We typically respond within a few hours during business hours.",
    },
    {
      category: "Support",
      question: "What are your business hours?",
      answer:
        "Our online store is open 24/7. Customer support is available Monday to Saturday, 9:00 AM – 6:00 PM GMT. Messages received outside these hours will be responded to the next business day.",
    },
    {
      category: "Support",
      question: "Do you have a physical store I can visit?",
      answer:
        "Yes! You can visit us in-store for purchases, pickups, and free screen protector installations. Contact us on WhatsApp for our current location and directions.",
    },
  ]

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
