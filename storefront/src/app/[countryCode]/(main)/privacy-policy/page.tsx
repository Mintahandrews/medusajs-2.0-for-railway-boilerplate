import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Letscase",
  description:
    "How Letscase collects, uses, and protects your personal information when you shop with us.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Privacy Policy</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        At Letscase, your privacy matters to us. This Privacy Policy explains how
        we collect, use, store, and protect your personal information when you
        visit our website, place an order, or interact with us in any way. By
        using our services you agree to the practices described below.
      </p>

      {/* Table of contents */}
      <div className="mt-8 rounded-[16px] border border-grey-20 bg-white p-6">
        <p className="text-[13px] font-semibold text-grey-90">On this page</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "Information we collect", href: "#information-we-collect" },
            { label: "How we use information", href: "#how-we-use" },
            { label: "Payment information", href: "#payment-information" },
            { label: "Custom designs", href: "#custom-designs" },
            { label: "Cookies & tracking", href: "#cookies" },
            { label: "Third-party services", href: "#third-party" },
            { label: "Data sharing", href: "#data-sharing" },
            { label: "Data retention", href: "#data-retention" },
            { label: "Data security", href: "#data-security" },
            { label: "Your rights", href: "#your-rights" },
            { label: "Children\u2019s privacy", href: "#children" },
            { label: "Policy changes", href: "#policy-changes" },
            { label: "Contact us", href: "#contact" },
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
          Last updated: February 13, 2026
        </p>
      </div>

      {/* Sections */}
      <div className="mt-10 space-y-10">
        {/* 1 — Information we collect */}
        <section id="information-we-collect">
          <h2 className="text-[18px] font-semibold text-grey-90">
            1. Information We Collect
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We collect different types of information depending on how you
            interact with Letscase:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              <strong className="text-grey-90">Personal details</strong> — full
              name, email address, phone number, and delivery address provided
              when you create an account or place an order.
            </li>
            <li>
              <strong className="text-grey-90">Order information</strong> —
              products purchased, order value, shipping method, order status, and
              transaction references.
            </li>
            <li>
              <strong className="text-grey-90">Account credentials</strong> —
              email and a securely hashed password if you choose to register.
            </li>
            <li>
              <strong className="text-grey-90">Device &amp; browser data</strong>{" "}
              — IP address, browser type, operating system, screen resolution,
              and referring URL collected automatically when you visit our site.
            </li>
            <li>
              <strong className="text-grey-90">
                Custom design uploads
              </strong>{" "}
              — images or files you upload when using our custom phone-case
              designer.
            </li>
            <li>
              <strong className="text-grey-90">Communication data</strong> —
              messages sent through our contact form, WhatsApp, or social-media
              channels.
            </li>
          </ul>
        </section>

        {/* 2 — How we use information */}
        <section id="how-we-use">
          <h2 className="text-[18px] font-semibold text-grey-90">
            2. How We Use Your Information
          </h2>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>Process and fulfil your orders, including printing custom designs.</li>
            <li>Send order confirmations, shipping updates, and delivery notifications via email or SMS.</li>
            <li>Provide customer support and respond to enquiries.</li>
            <li>Prevent fraudulent transactions and protect the security of our platform.</li>
            <li>Improve our website, product offerings, and overall shopping experience.</li>
            <li>Send promotional offers, discounts, and new-arrival announcements (only if you opt in).</li>
            <li>Comply with legal obligations and resolve disputes.</li>
          </ul>
        </section>

        {/* 3 — Payment information */}
        <section id="payment-information">
          <h2 className="text-[18px] font-semibold text-grey-90">
            3. Payment Information
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We accept payments through <strong className="text-grey-90">Mobile
            Money</strong> (MTN MoMo, Telecel Cash, AT Money),{" "}
            <strong className="text-grey-90">Visa</strong>,{" "}
            <strong className="text-grey-90">Mastercard</strong>, and{" "}
            <strong className="text-grey-90">bank transfers</strong> via our
            payment partner <strong className="text-grey-90">Paystack</strong>.
          </p>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Letscase does <strong className="text-grey-90">not</strong> store
            your card numbers, mobile money PINs, or bank account details on our
            servers. All payment data is processed directly by Paystack in a
            PCI-DSS-compliant environment. We only receive a transaction
            reference and confirmation status to match payments to your order.
          </p>
        </section>

        {/* 4 — Custom designs */}
        <section id="custom-designs">
          <h2 className="text-[18px] font-semibold text-grey-90">
            4. Custom Design Uploads
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            When you use our custom phone-case designer, the images you upload
            are stored securely on our cloud storage solely for the purpose of
            producing your order. Once your order is fulfilled or cancelled,
            uploaded design files are automatically deleted from our servers. We
            do not use, sell, or share your uploaded images for any other purpose.
          </p>
        </section>

        {/* 5 — Cookies */}
        <section id="cookies">
          <h2 className="text-[18px] font-semibold text-grey-90">
            5. Cookies &amp; Tracking Technologies
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We use cookies and similar technologies to:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>Keep you signed in and remember your shopping cart.</li>
            <li>Store your country/region preference for accurate pricing and shipping.</li>
            <li>Understand how visitors use our site so we can improve it (analytics cookies).</li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            You can manage your cookie preferences through the cookie banner
            shown on your first visit, or through your browser settings. Disabling
            cookies may affect certain site functionality such as maintaining your
            cart between visits.
          </p>
        </section>

        {/* 6 — Third-party services */}
        <section id="third-party">
          <h2 className="text-[18px] font-semibold text-grey-90">
            6. Third-Party Services
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We rely on trusted third-party providers to operate our store. These
            include:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              <strong className="text-grey-90">Paystack</strong> — payment
              processing (Mobile Money, cards, bank).
            </li>
            <li>
              <strong className="text-grey-90">Delivery partners</strong> —
              courier and logistics companies that handle shipping within Ghana
              and internationally.
            </li>
            <li>
              <strong className="text-grey-90">Cloud hosting</strong> — our
              website and data are hosted on secure, industry-standard cloud
              infrastructure.
            </li>
            <li>
              <strong className="text-grey-90">Email / SMS providers</strong> —
              to send transactional messages such as order confirmations and
              shipping updates.
            </li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            Each provider is contractually required to handle your data securely
            and only for the purposes we specify.
          </p>
        </section>

        {/* 7 — Data sharing */}
        <section id="data-sharing">
          <h2 className="text-[18px] font-semibold text-grey-90">
            7. Data Sharing &amp; Disclosure
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We <strong className="text-grey-90">never sell</strong> your personal
            information. We only share data in the following circumstances:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              With service providers listed above, strictly to fulfil your order.
            </li>
            <li>
              When required by law, regulation, or a valid legal process (e.g. a
              court order).
            </li>
            <li>
              To protect the rights, property, or safety of Letscase, our
              customers, or the public.
            </li>
            <li>
              In connection with a business merger, acquisition, or sale of
              assets — in which case you would be notified.
            </li>
          </ul>
        </section>

        {/* 8 — Data retention */}
        <section id="data-retention">
          <h2 className="text-[18px] font-semibold text-grey-90">
            8. Data Retention
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We retain your personal information only for as long as necessary to
            provide our services and meet legal obligations:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              <strong className="text-grey-90">Account data</strong> — kept until
              you delete your account or request removal.
            </li>
            <li>
              <strong className="text-grey-90">Order records</strong> — retained
              for up to 5 years for tax, accounting, and legal compliance.
            </li>
            <li>
              <strong className="text-grey-90">Design uploads</strong> —
              automatically deleted after order fulfilment or cancellation.
            </li>
            <li>
              <strong className="text-grey-90">Analytics data</strong> —
              aggregated and anonymized; individual session data is purged
              periodically.
            </li>
          </ul>
        </section>

        {/* 9 — Data security */}
        <section id="data-security">
          <h2 className="text-[18px] font-semibold text-grey-90">
            9. Data Security
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We take the security of your data seriously and implement
            industry-standard measures, including:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>HTTPS / TLS encryption for all data transmitted between your browser and our servers.</li>
            <li>Passwords stored using strong one-way hashing algorithms.</li>
            <li>Access controls that limit who within our team can view personal data.</li>
            <li>Regular security reviews of our hosting and third-party integrations.</li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            While no system is 100&nbsp;% secure, we continuously work to
            strengthen our defences. If you suspect any unauthorized access to
            your account, please contact us immediately.
          </p>
        </section>

        {/* 10 — Your rights */}
        <section id="your-rights">
          <h2 className="text-[18px] font-semibold text-grey-90">
            10. Your Rights
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Depending on your location, you may have the following rights
            regarding your personal data:
          </p>
          <ul className="mt-3 list-disc pl-6 text-[15px] leading-[1.9] text-grey-60 space-y-1">
            <li>
              <strong className="text-grey-90">Access</strong> — request a copy
              of the personal data we hold about you.
            </li>
            <li>
              <strong className="text-grey-90">Correction</strong> — ask us to
              update inaccurate or incomplete information.
            </li>
            <li>
              <strong className="text-grey-90">Deletion</strong> — request that
              we delete your personal data, subject to legal retention
              requirements.
            </li>
            <li>
              <strong className="text-grey-90">Opt-out</strong> — unsubscribe
              from marketing communications at any time using the link in our
              emails.
            </li>
            <li>
              <strong className="text-grey-90">Data portability</strong> —
              request your data in a commonly used electronic format.
            </li>
          </ul>
          <p className="mt-3 text-[15px] leading-[1.7] text-grey-60">
            To exercise any of these rights, contact us using the details below.
            We will respond within 30&nbsp;days.
          </p>
        </section>

        {/* 11 — Children */}
        <section id="children">
          <h2 className="text-[18px] font-semibold text-grey-90">
            11. Children&rsquo;s Privacy
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Our services are not directed at individuals under the age of 18. We
            do not knowingly collect personal information from children. If you
            believe a child has provided us with personal data, please contact us
            so we can promptly delete it.
          </p>
        </section>

        {/* 12 — Policy changes */}
        <section id="policy-changes">
          <h2 className="text-[18px] font-semibold text-grey-90">
            12. Changes to This Policy
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or legal requirements. When we make
            significant changes, we will update the &ldquo;Last updated&rdquo;
            date at the top and, where appropriate, notify you via email or a
            banner on our website.
          </p>
        </section>

        {/* 13 — Contact */}
        <section id="contact">
          <h2 className="text-[18px] font-semibold text-grey-90">
            13. Contact Us
          </h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or how we handle your data, please reach out:
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
                +233 54 045 1001
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
            <li>
              <strong className="text-grey-90">Snapchat:</strong>{" "}
              <a
                href="https://www.snapchat.com/add/letscase_gh"
                className="text-ui-fg-interactive hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @letscase_gh
              </a>
            </li>
            <li>
              <strong className="text-grey-90">TikTok:</strong>{" "}
              <a
                href="https://www.tiktok.com/@letscase_gh"
                className="text-ui-fg-interactive hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @letscase_gh
              </a>
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
            You can also visit our{" "}
            <a href="/contact" className="text-ui-fg-interactive hover:underline">
              Contact page
            </a>{" "}
            to send us a message directly.
          </p>
        </section>
      </div>
    </div>
  )
}
