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
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-[28px] border border-grey-20 bg-grey-10 px-6 py-12 small:px-12 small:py-16 text-center">
          <h2 className="text-[28px] small:text-[36px] font-bold text-grey-90 mb-4">
            Stay Updated with the Latest Tech !
          </h2>
          <p className="text-[13px] leading-[1.6] text-grey-50 max-w-[560px] mx-auto">
            Real and heartfelt experiences from our cherished customers who trust
            and rely on us
          </p>

          {status === "success" ? (
            <div className="mt-8 rounded-[16px] border border-grey-20 bg-white px-6 py-5 text-[14px] text-grey-90 max-w-[520px] mx-auto">
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
                  placeholder="Enter your email"
                  className="h-[46px] w-full rounded-full bg-white border border-grey-20 px-5 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-grey-40"
                  aria-invalid={error ? true : false}
                />
                {error ? (
                  <div className="mt-2 text-left text-[12px] text-red-500">
                    {error}
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={disabled}
                className="h-[46px] px-8 rounded-full bg-brand text-white text-[14px] font-semibold whitespace-nowrap transition duration-300 hover:bg-brand-dark disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
