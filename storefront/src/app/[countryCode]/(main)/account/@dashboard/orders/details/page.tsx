import { redirect } from "next/navigation"

export default function OrderDetailsIndexPage({
  params,
}: {
  params: { countryCode: string }
}) {
  // Redirect to orders list if no order ID is provided
  redirect(`/${params.countryCode}/account/orders`)
}
