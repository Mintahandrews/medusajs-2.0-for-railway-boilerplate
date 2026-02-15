import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  variants?: HttpTypes.StoreProductVariant[]
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

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {filteredOptions?.map((v) => {
          // determine if this option value maps to any purchasable variant
          let valueDisabled = false
          if (variants && variants.length) {
            const matching = variants.filter((varnt) =>
              (varnt.options || []).some((ov: any) => ov.option?.title === option.title && ov.value === v)
            )

            // If there are matching variants, check if any are purchasable
            const anyPurchasable = matching.some((m) => {
              if (!m.manage_inventory) return true
              if (m.allow_backorder) return true
              return (m.inventory_quantity || 0) > 0
            })

            valueDisabled = !anyPurchasable
          }

          return (
            <button
              onClick={() => updateOption(option.title ?? "", v ?? "")}
              key={v}
              className={clx(
                "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded px-3 py-2 whitespace-nowrap min-w-[3rem]",
                {
                  "opacity-50 cursor-not-allowed": valueDisabled,
                  "border-ui-border-interactive": v === current,
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    v !== current && !valueDisabled,
                }
              )}
              disabled={disabled || valueDisabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
