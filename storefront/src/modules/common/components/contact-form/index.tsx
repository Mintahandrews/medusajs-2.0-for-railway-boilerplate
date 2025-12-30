"use client"

import { FormEvent, useMemo, useState } from "react"

const SUPPORT_EMAIL =
  (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim() || "support@letscase.com"

type ContactFormValues = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    phone: "",
    subject: "Order support",
    message: "",
  })

  const [copied, setCopied] = useState(false)

  const mailtoHref = useMemo(() => {
    const lines: string[] = []
    lines.push(`Name: ${values.name || "-"}`)
    lines.push(`Email: ${values.email || "-"}`)
    lines.push(`Phone: ${values.phone || "-"}`)
    lines.push("")
    lines.push(values.message || "")

    const subject = values.subject || "Customer support"
    const body = lines.join("\n")

    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [values])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    window.location.href = mailtoHref
  }

  const handleCopy = async () => {
    const text = `Subject: ${values.subject}\nName: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}\n\n${values.message}`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // If clipboard is unavailable (permissions), do nothing.
    }
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
            className="mt-2 h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
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
            className="mt-2 h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
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
            className="mt-2 h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
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
            className="mt-2 h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
          >
            <option>Order support</option>
            <option>Returns & refunds</option>
            <option>Product question</option>
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
            className="mt-2 min-h-[140px] w-full rounded-[16px] border border-grey-20 bg-white px-4 py-3 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
            placeholder="Tell us what you need help with. Include your order number if you have one."
            required
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col small:flex-row gap-3">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-ui-bg-interactive px-6 text-white text-[14px] font-semibold hover:bg-ui-bg-interactive-hover transition"
        >
          Send via email
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-ui-border-interactive hover:text-ui-fg-interactive transition"
        >
          {copied ? "Copied" : "Copy message"}
        </button>
      </div>

      <p className="mt-4 text-[12px] text-grey-50 leading-[1.6]">
        This form opens your default email app using <span className="font-semibold">{SUPPORT_EMAIL}</span>.
        Update the email address in this component if needed.
      </p>
    </form>
  )
}
