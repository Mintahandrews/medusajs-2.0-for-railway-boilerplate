import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "New Arrivals | Letscase",
  description: "Discover the latest products added to our store.",
}

type Params = {
  params: {
    countryCode: string
  }
}

export default async function NewArrivalsPage({ params }: Params) {
  return (
    <StoreTemplate sortBy="created_at" page={"1"} countryCode={params.countryCode} />
  )
}
