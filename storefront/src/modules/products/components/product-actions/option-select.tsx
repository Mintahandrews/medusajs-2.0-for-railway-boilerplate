import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const getColor = (title: string) => {
  const t = title.toLowerCase()
  switch (t) {
    case "deep purple": return "#4B3D52"
    case "gold": return "#F9E5C9"
    case "silver": return "#F5F5F0"
    case "space black": return "#323232"
    case "purple": return "#A020F0" // Fallback
    default: return t
  }
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = option.values?.map((v) => v.value)
  const isColor = title.toLowerCase() === "color"

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-medium text-gray-500">Select {title}</span>
      <div
        className="flex flex-wrap gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions?.map((v) => {
          const isSelected = v === current
          const colorCode = isColor ? getColor(v ?? "") : ""

          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              className={clx(
                "transition-all duration-200",
                isColor
                  ? `w-8 h-8 rounded-full border border-gray-200 ${isSelected ? "ring-2 ring-offset-2 ring-black" : "hover:scale-110"}`
                  : `px-6 py-3 rounded-lg border text-sm ${isSelected ? "border-black font-semibold text-black" : "border-gray-200 text-gray-600 hover:border-gray-400"}`,
              )}
              style={isColor ? { backgroundColor: colorCode } : {}}
              disabled={disabled}
              data-testid="option-button"
            >
              {!isColor && v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
