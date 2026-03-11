"use client"

import { useEffect } from "react"

export default function ExtensionErrorGuard() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message =
        typeof reason === "string"
          ? reason
          : typeof reason?.message === "string"
          ? reason.message
          : ""

      if (
        message.includes(
          "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
        )
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener("unhandledrejection", handler)
    return () => window.removeEventListener("unhandledrejection", handler)
  }, [])

  return null
}
