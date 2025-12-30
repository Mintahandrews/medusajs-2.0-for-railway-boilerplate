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
        This page is a template policy. Please review and customize it to match your data
        handling and legal requirements.
      </p>

      <div className="mt-8 rounded-[16px] border border-grey-20 bg-white p-6">
        <p className="text-[13px] font-semibold text-grey-90">On this page</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "Information we collect", href: "#information-we-collect" },
            { label: "How we use information", href: "#how-we-use" },
            { label: "Sharing", href: "#sharing" },
            { label: "Data security", href: "#data-security" },
            { label: "Your choices", href: "#your-choices" },
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
        <section id="information-we-collect">
          <h2 className="text-[18px] font-semibold text-grey-90">Information we collect</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We may collect contact details (such as name, phone number, and address), order
            details, and technical data needed to operate the site.
          </p>
        </section>

        <section id="how-we-use">
          <h2 className="text-[18px] font-semibold text-grey-90">How we use information</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We use information to process orders, deliver products, provide customer support,
            prevent fraud, and improve the shopping experience.
          </p>
        </section>

        <section id="sharing">
          <h2 className="text-[18px] font-semibold text-grey-90">Sharing</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We share information only with service providers necessary to fulfill your order
            (for example payment processors and delivery partners), and as required by law.
          </p>
        </section>

        <section id="data-security">
          <h2 className="text-[18px] font-semibold text-grey-90">Data security</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We take reasonable measures to protect your information. No method of
            transmission or storage is 100% secure.
          </p>
        </section>

        <section id="your-choices">
          <h2 className="text-[18px] font-semibold text-grey-90">Your choices</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            You may request access, updates, or deletion of your personal information.
            Contact us to make a request.
          </p>
        </section>
      </div>
    </div>
  )
}
