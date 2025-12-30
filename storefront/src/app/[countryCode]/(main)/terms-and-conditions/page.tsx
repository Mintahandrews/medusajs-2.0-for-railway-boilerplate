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
        This page is a template. Please review and customize it to fit your business and
        local requirements.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Using our site</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            By accessing this website, you agree to use it lawfully and not to misuse our
            services.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Orders &amp; pricing</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Product availability, pricing, and promotions may change. We may cancel orders in
            cases such as suspected fraud, pricing errors, or stock issues.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Returns</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Returns are handled according to our Returns &amp; Refunds policy.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Liability</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            We are not liable for indirect losses. Our liability is limited to the extent
            permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Contact</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            If you have questions about these terms, please contact us via the Contact page.
          </p>
        </section>
      </div>
    </div>
  )
}
