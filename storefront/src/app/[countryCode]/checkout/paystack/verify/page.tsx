import { placeOrder } from "@lib/data/cart"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function PaystackVerifyPage({
  params,
  searchParams,
}: {
  params: { countryCode: string }
  searchParams?: { reference?: string; trxref?: string }
}) {
  const countryCode = params.countryCode || "gh"
  const reference = searchParams?.reference || searchParams?.trxref

  // Paystack redirects back with `?reference=...` or `?trxref=...`
  if (!reference) {
    return (
      <div className="content-container py-10">
        <h1 className="text-2xl font-semibold">Missing Paystack reference</h1>
        <p className="mt-2 text-ui-fg-subtle">
          Please return to checkout and try again.
        </p>
        <Link href={`/${countryCode}/checkout`} className="text-blue-600 underline mt-4 block">
          Return to Checkout
        </Link>
      </div>
    )
  }

  try {
    // Cart completion will call the payment provider authorize flow.
    // For Paystack, the backend provider verifies the transaction by reference.
    await placeOrder()
  } catch (error: any) {
    console.error("Paystack verify - placeOrder failed:", error)
    return (
      <div className="content-container py-10">
        <h1 className="text-2xl font-semibold text-red-600">Payment Verification Failed</h1>
        <p className="mt-2 text-ui-fg-subtle">
          {error?.message || "An error occurred while completing your order. Please contact support."}
        </p>
        <p className="mt-2 text-sm text-gray-500">Reference: {reference}</p>
        <Link href={`/${countryCode}/checkout`} className="text-blue-600 underline mt-4 block">
          Return to Checkout
        </Link>
      </div>
    )
  }

  // If placeOrder doesn't redirect (shouldn't happen), redirect manually
  redirect(`/${countryCode}/order/confirmed`)
}
