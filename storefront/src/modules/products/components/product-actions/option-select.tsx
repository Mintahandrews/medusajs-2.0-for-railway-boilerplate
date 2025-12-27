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
          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              className={clx(
                "transition-all duration-200",
                isColor
                  ? `w-8 h-8 rounded-full border-2 ${isSelected ? "border-black scale-110" : "border-transparent hover:scale-110"}`
                  : `px-6 py-3 rounded-lg border font-medium ${isSelected ? "border-black bg-black text-white" : "border-gray-200 bg-white text-black hover:border-black"}`,
              )}
              style={isColor ? { backgroundColor: v?.toLowerCase() } : {}}
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
