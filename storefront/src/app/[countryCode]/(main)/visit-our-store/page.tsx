import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Visit Our Store | Letscase",
  description:
    "Store location and opening hours for Letscase in Accra, Ghana.",
}

export default function VisitOurStorePage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Visit Our Store</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Prefer to shop in person? Visit our store in Accra. Update the details below with
        your exact location and hours.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Address</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Letscase — (add street address), Accra, Ghana
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Opening hours</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Mon–Sat: (add hours) <br />
            Sun: (add hours)
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-grey-90">Directions</h2>
          <p className="mt-2 text-[15px] leading-[1.7] text-grey-60">
            Add a Google Maps link or embedded map here.
          </p>
        </section>
      </div>
    </div>
  )
}
