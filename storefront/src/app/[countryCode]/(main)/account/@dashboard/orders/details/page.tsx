import { redirect } from "next/navigation"

export default async function OrderDetailsIndexPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  // Redirect to orders list if no order ID is provided
  redirect(`/${countryCode}/account/orders`)
}
