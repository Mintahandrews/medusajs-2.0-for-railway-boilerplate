"use client"

import { FormEvent, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

type ContactFormValues = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

type FormStatus = "idle" | "submitting" | "success" | "error"

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    phone: "",
    subject: "Order support",
    message: "",
  })

  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data?.error || "Something went wrong. Please try again.")
        setStatus("error")
        return
      }

      setStatus("success")
      setValues({ name: "", email: "", phone: "", subject: "Order support", message: "" })
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-[16px] border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600 mb-3" />
        <h3 className="text-[16px] font-semibold text-grey-90">Message sent!</h3>
        <p className="mt-2 text-[14px] text-grey-60 leading-[1.6] max-w-md">
          Thank you for reaching out. We&rsquo;ll get back to you within 24 hours
          by email, or faster on WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 inline-flex h-10 items-center rounded-full border border-grey-20 bg-white px-5 text-[13px] font-semibold text-grey-90 hover:border-brand hover:text-brand transition"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6" aria-label="Contact form">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] font-semibold text-grey-90" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className="mt-2 h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="Your full name"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-grey-90" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            className="mt-2 h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-grey-90" htmlFor="phone">
            Phone (optional)
          </label>
          <input
            id="phone"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            className="mt-2 h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="+233…"
            autoComplete="tel"
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-grey-90" htmlFor="subject">
            Subject
          </label>
          <select
            id="subject"
            value={values.subject}
            onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
            className="mt-2 h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option>Order support</option>
            <option>Returns & refunds</option>
            <option>Product question</option>
            <option>Custom design help</option>
            <option>Bulk / wholesale order</option>
            <option>Business enquiry</option>
            <option>Other</option>
          </select>
        </div>

        <div className="small:col-span-2">
          <label className="text-[13px] font-semibold text-grey-90" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            value={values.message}
            onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
            className="mt-2 min-h-[140px] w-full rounded-[16px] border border-grey-20 bg-white px-4 py-3 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="Tell us what you need help with. Include your order number if you have one."
            required
          />
        </div>
      </div>

      {status === "error" && errorMsg && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="mt-5">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-white text-[14px] font-semibold hover:bg-brand-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending…
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </div>
    </form>
  )
}
