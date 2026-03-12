"use client"

import React from "react"
import Image from "next/image"
import { clx } from "@medusajs/ui"
import { Smartphone, CreditCard, Building2 } from "lucide-react"

export type PaystackChannel = "mobile_money" | "card" | "bank"

type Props = {
  selected: PaystackChannel | null
  onChange: (channel: PaystackChannel) => void
}

/** Paystack wordmark as an inline SVG — no external file needed */
const PaystackBadge = () => (
  <div className="flex items-center gap-1 rounded border border-[#0BA4DB]/30 bg-[#0BA4DB]/5 px-2 py-0.5">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.293-5.657 5.657a1 1 0 0 1-1.414 0L7.293 12.607a1 1 0 1 1 1.414-1.414L10.35 12.84l4.95-4.95a1 1 0 0 1 1.414 1.414z"
        fill="#0BA4DB"
      />
    </svg>
    <span className="text-[10px] font-semibold text-[#0BA4DB]">Paystack</span>
  </div>
)

/** Ghana bank name chips for the bank transfer option */
const GhanaBankChips = () => {
  const banks = ["GCB", "Ecobank", "Fidelity", "Stanbic", "Absa", "+more"]
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {banks.map((b) => (
        <span
          key={b}
          className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600"
        >
          {b}
        </span>
      ))}
    </div>
  )
}

const channels: {
  id: PaystackChannel
  label: string
  description: string
  icon: React.ReactNode
  logos: { src: string; alt: string; width: number; height: number }[]
  extra?: React.ReactNode
}[] = [
  {
    id: "mobile_money",
    label: "Mobile Money",
    description: "Pay with MTN MoMo, Telecel Cash or AT Money",
    icon: <Smartphone className="h-5 w-5 text-violet-600" />,
    logos: [
      { src: "/logos/mtn-momo.png", alt: "MTN MoMo", width: 80, height: 32 },
      { src: "/logos/telecel.png", alt: "Telecel Cash", width: 80, height: 32 },
      { src: "/logos/at.png", alt: "AT Money", width: 80, height: 32 },
    ],
  },
  {
    id: "card",
    label: "Card Payment",
    description: "Pay with Visa or Mastercard",
    icon: <CreditCard className="h-5 w-5 text-blue-600" />,
    logos: [
      { src: "/logos/visa.png", alt: "Visa", width: 60, height: 32 },
      { src: "/logos/mastercard.png", alt: "Mastercard", width: 50, height: 32 },
    ],
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "Pay directly from your Ghanaian bank account via Paystack",
    icon: <Building2 className="h-5 w-5 text-emerald-700" />,
    logos: [],
    extra: (
      <div className="mt-2 flex flex-col gap-1.5">
        <GhanaBankChips />
        <PaystackBadge />
      </div>
    ),
  },
]

export default function PaystackChannelPicker({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {channels.map((ch) => {
        const isSelected = selected === ch.id
        return (
          <button
            key={ch.id}
            type="button"
            onClick={() => onChange(ch.id)}
            className={clx(
              "flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200",
              isSelected
                ? "border-violet-600 bg-violet-50/50 shadow-sm"
                : "border-ui-border-base bg-white hover:border-ui-border-strong hover:shadow-sm"
            )}
          >
            {/* Radio indicator */}
            <div className="mt-0.5 flex-shrink-0">
              <div
                className={clx(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-violet-600" : "border-gray-300"
                )}
              >
                {isSelected && (
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {ch.icon}
                <span className="text-[15px] font-semibold text-ui-fg-base">
                  {ch.label}
                </span>
              </div>
              <p className="text-[13px] text-ui-fg-subtle mt-0.5">
                {ch.description}
              </p>
              {ch.logos.length > 0 ? (
                <div className="flex items-center gap-3 mt-2">
                  {ch.logos.map((logo) => (
                    <Image
                      key={logo.alt}
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      className="h-8 w-auto object-contain"
                    />
                  ))}
                </div>
              ) : null}
              {ch.extra ?? null}
            </div>
          </button>
        )
      })}
    </div>
  )
}
