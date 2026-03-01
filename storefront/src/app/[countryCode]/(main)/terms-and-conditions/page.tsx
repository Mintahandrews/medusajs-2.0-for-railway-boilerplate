import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions | Letscase",
  description:
    "Terms and conditions for using the Letscase website and purchasing products.",
}

export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Terms &amp; Conditions</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Welcome to Letscase. By accessing or using our website and services, you
        agree to be bound by these Terms &amp; Conditions. Please read them
        carefully before placing an order or using any features on our site.
      </p>

      <div className="mt-8 rounded-[16px] border border-grey-20 bg-white p-6">
        <p className="text-[13px] font-semibold text-grey-90">On this page</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "General", href: "#general" },
            { label: "Using our site", href: "#using-our-site" },
            { label: "Accounts", href: "#accounts" },
            { label: "Orders & pricing", href: "#orders-and-pricing" },
            { label: "Payment", href: "#payment" },
            { label: "Delivery & pickup", href: "#delivery" },
            { label: "Custom products", href: "#custom-products" },
            { label: "Returns & refunds", href: "#returns" },
            { label: "Intellectual property", href: "#intellectual-property" },
            { label: "Limitation of liability", href: "#liability" },
            { label: "Privacy", href: "#privacy" },
            { label: "Changes to terms", href: "#changes" },
            { label: "Governing law", href: "#governing-law" },
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
        <section id="general">
          <h2 className="text-[18px] font-semibold text-grey-90">
            1. General
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use
            of the Letscase website (letscase.com) and all related services,
            including our online store, custom phone-case designer, and in-store
            pickup service. By using our services, you confirm that you are at
            least 18&nbsp;years old or have parental/guardian consent.
          </p>
        </section>

        <section id="using-our-site">
          <h2 className="text-[18px] font-semibold text-grey-90">
            2. Using Our Site
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            You agree to use our website lawfully and responsibly. You must not:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>Use the site for any fraudulent or illegal purpose.</li>
            <li>Attempt to gain unauthorized access to our systems or data.</li>
            <li>Interfere with the proper functioning of the website.</li>
            <li>Upload harmful code, viruses, or malicious content.</li>
            <li>
              Scrape, copy, or redistribute our content without written
              permission.
            </li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            We reserve the right to suspend or terminate access for anyone who
            violates these Terms.
          </p>
        </section>

        <section id="accounts">
          <h2 className="text-[18px] font-semibold text-grey-90">
            3. Accounts
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            You may create an account to track orders, save addresses, and
            manage your wishlist. You are responsible for keeping your login
            credentials secure. If you suspect unauthorized access to your
            account, contact us immediately. We reserve the right to disable
            accounts that violate these Terms.
          </p>
        </section>

        <section id="orders-and-pricing">
          <h2 className="text-[18px] font-semibold text-grey-90">
            4. Orders &amp; Pricing
          </h2>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              All prices are displayed in{" "}
              <strong className="text-grey-90">Ghana Cedis (GH&#8373;)</strong>{" "}
              and include applicable taxes unless otherwise stated.
            </li>
            <li>
              We strive for accuracy, but product descriptions, images, and
              prices are subject to change without prior notice.
            </li>
            <li>
              Placing an order constitutes an offer to purchase. We may accept or
              decline your order at our discretion.
            </li>
            <li>
              We reserve the right to cancel orders in cases of pricing errors,
              suspected fraud, stock unavailability, or payment issues.
            </li>
            <li>
              Promotional offers and discounts are subject to their stated terms
              and may be modified or withdrawn at any time.
            </li>
          </ul>
        </section>

        <section id="payment">
          <h2 className="text-[18px] font-semibold text-grey-90">
            5. Payment
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We accept the following payment methods via our payment partner{" "}
            <strong className="text-grey-90">Paystack</strong>:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              <strong className="text-grey-90">Mobile Money</strong> &mdash; MTN
              MoMo, Telecel Cash
            </li>
            <li>
              <strong className="text-grey-90">Cards</strong> &mdash; Visa,
              Mastercard
            </li>
            <li>
              <strong className="text-grey-90">Bank transfer</strong>
            </li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            Payment must be completed before your order is processed. We do not
            store your card numbers or Mobile Money PINs. All payment data is
            handled securely by Paystack in a PCI-DSS-compliant environment.
          </p>
        </section>

        <section id="delivery">
          <h2 className="text-[18px] font-semibold text-grey-90">
            6. Delivery &amp; Pickup
          </h2>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              We deliver across Ghana. Delivery timelines and fees vary by
              location and are displayed during checkout.
            </li>
            <li>
              <strong className="text-grey-90">In-store pickup</strong> is
              available for eligible orders. You will be notified when your order
              is ready for collection.
            </li>
            <li>
              Delivery estimates are approximate and may be affected by factors
              outside our control (weather, logistics delays, public holidays).
            </li>
            <li>
              Risk of loss transfers to you upon delivery or pickup of the
              product.
            </li>
          </ul>
        </section>

        <section id="custom-products">
          <h2 className="text-[18px] font-semibold text-grey-90">
            7. Custom Products
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            When you use our custom phone-case designer, you confirm that:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              You own or have the right to use all images and content you upload.
            </li>
            <li>
              The content does not infringe any third-party intellectual property
              rights.
            </li>
            <li>
              The content does not contain offensive, defamatory, or illegal
              material.
            </li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            We reserve the right to refuse production of any custom design that
            violates these conditions. Custom-designed products are
            non-returnable (see our{" "}
            <a
              href="/returns-and-refunds"
              className="text-ui-fg-interactive hover:underline"
            >
              Returns &amp; Refunds
            </a>{" "}
            policy).
          </p>
        </section>

        <section id="returns">
          <h2 className="text-[18px] font-semibold text-grey-90">
            8. Returns &amp; Refunds
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Returns and refunds are handled in accordance with our{" "}
            <a
              href="/returns-and-refunds"
              className="text-ui-fg-interactive hover:underline"
            >
              Returns &amp; Refunds policy
            </a>
            . Key points include a 7-day return window, specific non-returnable
            items (custom cases, opened screen protectors, used earphones), and
            refund processing via the original payment method.
          </p>
        </section>

        <section id="intellectual-property">
          <h2 className="text-[18px] font-semibold text-grey-90">
            9. Intellectual Property
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            All content on this website &mdash; including logos, text, images,
            graphics, UI design, and software &mdash; is the property of
            Letscase or its licensors and is protected by intellectual property
            laws. You may not reproduce, distribute, or create derivative works
            from our content without prior written consent.
          </p>
        </section>

        <section id="liability">
          <h2 className="text-[18px] font-semibold text-grey-90">
            10. Limitation of Liability
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            To the fullest extent permitted by law:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              Our products are provided &ldquo;as is.&rdquo; While we strive for
              quality, we do not warrant that all products will meet your
              specific expectations.
            </li>
            <li>
              Letscase is not liable for any indirect, incidental, or
              consequential damages arising from your use of our website or
              products.
            </li>
            <li>
              Our total liability for any claim shall not exceed the amount you
              paid for the specific product or order in question.
            </li>
            <li>
              We are not responsible for delays or failures caused by events
              beyond our reasonable control (force majeure).
            </li>
          </ul>
        </section>

        <section id="privacy">
          <h2 className="text-[18px] font-semibold text-grey-90">
            11. Privacy
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Your use of our services is also governed by our{" "}
            <a
              href="/privacy-policy"
              className="text-ui-fg-interactive hover:underline"
            >
              Privacy Policy
            </a>
            , which explains how we collect, use, and protect your personal
            information.
          </p>
        </section>

        <section id="changes">
          <h2 className="text-[18px] font-semibold text-grey-90">
            12. Changes to These Terms
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We may update these Terms from time to time. Changes take effect
            when posted on this page. Continued use of our website after changes
            are posted constitutes acceptance of the updated Terms. We encourage
            you to review this page periodically.
          </p>
        </section>

        <section id="governing-law">
          <h2 className="text-[18px] font-semibold text-grey-90">
            13. Governing Law
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            These Terms are governed by and construed in accordance with the
            laws of the Republic of Ghana. Any disputes arising from these Terms
            shall be subject to the exclusive jurisdiction of the courts of
            Ghana.
          </p>
        </section>

        <section id="contact">
          <h2 className="text-[18px] font-semibold text-grey-90">
            14. Contact Us
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you have any questions about these Terms &amp; Conditions, please
            contact us:
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
          <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
            You can also reach us via our{" "}
            <a
              href="/contact"
              className="text-ui-fg-interactive hover:underline"
            >
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
