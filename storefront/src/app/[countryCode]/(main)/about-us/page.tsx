import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Letscase",
}

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">About Letscase</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Letscase is a premium electronics and mobile accessories retailer based
        in Accra, Ghana.
      </p>
    </div>
  )
}
