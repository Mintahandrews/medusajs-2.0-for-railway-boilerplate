"use client"

import { FormEvent, useMemo, useState } from "react"

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [error, setError] = useState<string | null>(null)

  const disabled = useMemo(() => status === "loading", [status])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim()
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.")
      return
    }

    setStatus("loading")

    // UI-only template: simulate network request.
    window.setTimeout(() => {
      setStatus("success")
    }, 650)
  }

  return (
    <div className="py-16 small:py-20 border-t border-grey-20">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="text-[28px] small:text-[36px] font-bold text-grey-90">
            Stay Updated with the Latest Tech !
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-grey-50 max-w-[620px] mx-auto">
            Boost your favourite experiences from our cherished customers, who
            tried and only rely on us
          </p>

          {status === "success" ? (
            <div className="mt-8 rounded-[16px] border border-grey-20 bg-grey-5 px-6 py-5 text-[15px] text-grey-90">
              Thanks for subscribing. You’re on the list.
            </div>
          ) : (
            <form
              className="mt-8 flex flex-col xsmall:flex-row gap-3 max-w-[520px] mx-auto"
              onSubmit={onSubmit}
              noValidate
            >
              <div className="w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL"
                  className="h-[54px] w-full rounded-rounded bg-grey-5 border border-grey-20 px-5 text-[15px] text-grey-90 focus:outline-none focus:border-brand"
                  aria-invalid={error ? true : false}
                />
                {error ? (
                  <div className="mt-2 text-left text-[12px] text-[#EF4444]">
                    {error}
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={disabled}
                className="h-[54px] px-8 rounded-rounded bg-black text-white text-[15px] font-semibold whitespace-nowrap transition duration-300 hover:bg-brand hover:-translate-y-[2px] disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe Now"}
              </button>
            </form>
          )}

          <p className="mt-4 text-[12px] text-grey-40">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
