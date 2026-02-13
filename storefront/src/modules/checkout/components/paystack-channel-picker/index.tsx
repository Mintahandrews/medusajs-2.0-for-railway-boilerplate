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

const channels: {
  id: PaystackChannel
  label: string
  description: string
  icon: React.ReactNode
  logos: { src: string; alt: string; width: number; height: number }[]
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
    label: "Bank Payment",
    description: "Pay directly from your bank account",
    icon: <Building2 className="h-5 w-5 text-green-700" />,
    logos: [],
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
                  isSelected
                    ? "border-violet-600"
                    : "border-gray-300"
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
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <div className="rounded bg-green-50 border border-green-200 px-2 py-1">
                    <span className="text-[11px] font-medium text-green-700">
                      All major banks supported
                    </span>
                  </div>
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
