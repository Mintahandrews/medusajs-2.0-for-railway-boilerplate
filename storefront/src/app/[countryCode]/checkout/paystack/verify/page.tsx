"use client"

import { placeOrder } from "@lib/data/cart"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PaystackVerifyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const countryCode = (params.countryCode as string) || "gh"
  const reference = searchParams.get("reference") || searchParams.get("trxref")
  
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      setErrorMessage("Missing Paystack reference")
      return
    }

    const completeOrder = async () => {
      try {
        await placeOrder()
        setStatus("success")
        router.push(`/${countryCode}/order/confirmed`)
      } catch (error: any) {
        // NEXT_REDIRECT is thrown by Next.js redirect() - this is expected behavior
        if (error?.message?.includes("NEXT_REDIRECT") || error?.digest?.includes("NEXT_REDIRECT")) {
          setStatus("success")
          return
        }
        console.error("Paystack verify - placeOrder failed:", error)
        setStatus("error")
        setErrorMessage(error?.message || "An error occurred while completing your order.")
      }
    }

    completeOrder()
  }, [reference, countryCode, router])

  if (status === "loading") {
    return (
      <div className="content-container py-10 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-fg-base mb-4"></div>
        <h1 className="text-xl font-semibold">Verifying your payment...</h1>
        <p className="mt-2 text-ui-fg-subtle">Please wait while we confirm your order.</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="content-container py-10">
        <h1 className="text-2xl font-semibold text-red-600">Payment Verification Failed</h1>
        <p className="mt-2 text-ui-fg-subtle">{errorMessage}</p>
        {reference && <p className="mt-2 text-sm text-gray-500">Reference: {reference}</p>}
        <Link href={`/${countryCode}/checkout`} className="text-blue-600 underline mt-4 block">
          Return to Checkout
        </Link>
      </div>
    )
  }

  return (
    <div className="content-container py-10 flex flex-col items-center">
      <h1 className="text-xl font-semibold text-green-600">Payment Successful!</h1>
      <p className="mt-2 text-ui-fg-subtle">Redirecting to your order confirmation...</p>
    </div>
  )
}
