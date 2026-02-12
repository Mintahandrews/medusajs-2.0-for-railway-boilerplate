"use client"

import React from "react"
import { Shield, Feather, Eye, Magnet } from "lucide-react"
import { useCustomizer, type CaseType } from "../../context"

const CASE_TYPES: {
  id: CaseType
  label: string
  description: string
  icon: React.ReactNode
  features: string[]
  priceTag: string
}[] = [
  {
    id: "slim",
    label: "Slim",
    description: "Ultra-thin profile, minimal bulk",
    icon: <Feather className="w-5 h-5" />,
    features: ["0.8mm thin", "Lightweight", "Scratch resistant"],
    priceTag: "Base price",
  },
  {
    id: "tough",
    label: "Tough",
    description: "Military-grade drop protection",
    icon: <Shield className="w-5 h-5" />,
    features: ["4X drop tested", "Raised bezels", "Shock absorbing"],
    priceTag: "+25%",
  },
  {
    id: "clear",
    label: "Clear",
    description: "Show off your phone's color",
    icon: <Eye className="w-5 h-5" />,
    features: ["Crystal clear", "Anti-yellowing", "UV resistant"],
    priceTag: "+15%",
  },
  {
    id: "magsafe",
    label: "MagSafe",
    description: "Built-in magnet ring for MagSafe",
    icon: <Magnet className="w-5 h-5" />,
    features: ["Strong magnets", "Wireless charging", "MagSafe compatible"],
    priceTag: "+50%",
  },
]

export default function CaseTypePanel() {
  const { state, dispatch } = useCustomizer()

  return (
    <div className="flex flex-col gap-3 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Case Type</h3>
      <p className="text-xs text-gray-400">Choose the protection level for your case.</p>

      <div className="flex flex-col gap-2">
        {CASE_TYPES.map((ct) => {
          const selected = state.caseType === ct.id
          return (
            <button
              key={ct.id}
              onClick={() => dispatch({ type: "SET_CASE_TYPE", caseType: ct.id })}
              className={`relative flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                selected
                  ? "border-brand bg-brand/10"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  selected
                    ? "bg-brand text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {ct.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      selected ? "text-brand-dark" : "text-gray-900"
                    }`}
                  >
                    {ct.label}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    selected
                      ? "text-brand-dark bg-brand/20"
                      : "text-gray-500 bg-gray-100"
                  }`}>
                    {ct.priceTag}
                  </span>
                  {selected && (
                    <span className="text-[10px] font-bold text-brand-dark bg-brand/20 px-1.5 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{ct.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ct.features.map((f) => (
                    <span
                      key={f}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        selected
                          ? "bg-brand/20 text-brand-dark"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
