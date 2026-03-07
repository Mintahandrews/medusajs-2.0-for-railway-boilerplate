import { useEffect, useState } from "react"

export function usePaystack() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (window.PaystackPop) {
      setIsReady(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => setIsReady(true)
    document.body.appendChild(script)

    return () => {
      // Don't remove the script on unmount so it's cached for future use,
      // but you can if needed. We'll leave it for performance.
    }
  }, [])

  return isReady
}
