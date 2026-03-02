"use client"

import { FormEvent, useMemo, useState } from "react"

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidPhone(value: string) {
  return /^(\+?233|0)\d{9,}$/.test(value.replace(/[\s\-()]/g, ""))
}

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [error, setError] = useState<string | null>(null)

  const disabled = useMemo(() => status === "loading", [status])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedEmail && !trimmedPhone) {
      setError("Please enter your email or phone number.")
      return
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      setError("Please enter a valid Ghana phone number (e.g. 0241234567).")
      return
    }

    setStatus("loading")

    try {
      // Send to contact API (handles both email + SMS notification)
      const contactEmail = trimmedEmail || `subscriber@newsletter.letscase.com`
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedEmail
            ? trimmedEmail.split("@")[0]
            : trimmedPhone,
          email: contactEmail,
          phone: trimmedPhone || undefined,
          subject: "Newsletter subscription",
          message: `New newsletter subscription. Email: ${trimmedEmail || "N/A"}. Phone: ${trimmedPhone || "N/A"}.`,
        }),
      })

      // Also send SMS subscription confirmation if phone was provided
      if (trimmedPhone) {
        fetch("/api/sms/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinations: [trimmedPhone],
            text: "Subscribed to Letscase! You will get exclusive deals and new arrivals via SMS. Reply STOP to unsubscribe.",
          }),
        }).catch(() => {})
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "Something went wrong. Please try again.")
        setStatus("idle")
        return
      }

      setStatus("success")
    } catch {
      setError("Network error. Please check your connection and try again.")
      setStatus("idle")
    }
  }

  return (
    <div className="py-16 small:py-20 border-t border-grey-20">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-[28px] border border-grey-20 bg-grey-10 px-6 py-12 small:px-12 small:py-16 text-center">
          <h2 className="text-[28px] small:text-[36px] font-bold text-grey-90 mb-4">
            Stay Updated with the Latest Tech !
          </h2>
          <p className="text-[13px] leading-[1.6] text-grey-50 max-w-[560px] mx-auto">
            Get exclusive deals, new arrivals, and tech tips delivered to your
            inbox or phone.
          </p>

          {status === "success" ? (
            <div className="mt-8 rounded-[16px] border border-grey-20 bg-white px-6 py-5 text-[14px] text-grey-90 max-w-[520px] mx-auto">
              Thanks for subscribing! You&apos;ll hear from us soon.
            </div>
          ) : (
            <form
              className="mt-8 flex flex-col gap-3 max-w-[520px] mx-auto"
              onSubmit={onSubmit}
              noValidate
            >
              <div className="flex flex-col xsmall:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-[46px] w-full rounded-full bg-white border border-grey-20 px-5 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-grey-40"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (e.g. 0241234567)"
                  className="h-[46px] w-full rounded-full bg-white border border-grey-20 px-5 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-grey-40"
                />
              </div>

              {error ? (
                <div className="text-left text-[12px] text-red-500">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={disabled}
                className="h-[46px] w-full xsmall:w-auto xsmall:mx-auto px-8 rounded-full bg-brand text-white text-[14px] font-semibold whitespace-nowrap transition duration-300 hover:bg-brand-dark disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
              <p className="text-[11px] text-grey-40">
                Enter your email, phone number, or both to subscribe.
              </p>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
