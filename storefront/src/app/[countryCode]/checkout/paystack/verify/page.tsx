import { placeOrder } from "@lib/data/cart"

export default async function PaystackVerifyPage({
  searchParams,
}: {
  searchParams?: { reference?: string }
}) {
  // Paystack redirects back with `?reference=...`
  if (!searchParams?.reference) {
    return (
      <div className="content-container py-10">
        <h1 className="text-2xl font-semibold">Missing Paystack reference</h1>
        <p className="mt-2 text-ui-fg-subtle">
          Please return to checkout and try again.
        </p>
      </div>
    )
  }

  // Cart completion will call the payment provider authorize flow.
  // For Paystack, the backend provider verifies the transaction by reference.
  await placeOrder()

  return null
}
