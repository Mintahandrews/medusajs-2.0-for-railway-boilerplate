"use client"

import React from "react"
import { Shield, Feather, Eye, Magnet, Check } from "lucide-react"
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
      <h3 className="text-sm font-bold text-gray-800">Case Type</h3>
      <p className="text-xs text-gray-500">Choose the protection level for your case.</p>

      {/* 2-column grid for compact, scannable layout */}
      <div className="grid grid-cols-2 gap-2">
        {CASE_TYPES.map((ct) => {
          const selected = state.caseType === ct.id
          return (
            <button
              key={ct.id}
              onClick={() => dispatch({ type: "SET_CASE_TYPE", caseType: ct.id })}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all ${
                selected
                  ? "border-brand bg-brand/10 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {/* Selected checkmark */}
              {selected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selected
                    ? "bg-brand text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {ct.icon}
              </div>

              {/* Label + price */}
              <div>
                <div
                  className={`text-sm font-bold ${
                    selected ? "text-gray-900" : "text-gray-800"
                  }`}
                >
                  {ct.label}
                </div>
                <div className={`text-[11px] font-semibold mt-0.5 ${
                  selected ? "text-brand" : "text-gray-500"
                }`}>
                  {ct.priceTag}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Expanded details for selected case type */}
      {CASE_TYPES.filter((ct) => ct.id === state.caseType).map((ct) => (
        <div key={ct.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 mt-1">
          <p className="text-xs font-semibold text-gray-700 mb-2">{ct.description}</p>
          <div className="flex flex-col gap-1.5">
            {ct.features.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-brand" strokeWidth={3} />
                </div>
                <span className="text-xs font-medium text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
