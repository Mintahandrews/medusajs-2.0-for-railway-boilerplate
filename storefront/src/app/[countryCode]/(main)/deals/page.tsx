import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Deals | Letscase",
  description: "Shop discounted products and limited-time offers.",
}

type Params = {
  params: {
    countryCode: string
  }
}

export default async function DealsPage({ params }: Params) {
  return <StoreTemplate onSale page={"1"} countryCode={params.countryCode} />
}
