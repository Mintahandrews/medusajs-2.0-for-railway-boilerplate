"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"

import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"

const GHANA_REGIONS = [
  "Ahafo Region",
  "Ashanti Region",
  "Bono East Region",
  "Bono Region",
  "Central Region",
  "Eastern Region",
  "Greater Accra Region",
  "North East Region",
  "Northern Region",
  "Oti Region",
  "Savannah Region",
  "Upper East Region",
  "Upper West Region",
  "Volta Region",
  "Western North Region",
  "Western Region",
]

const RegionSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Region", ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    return (
      <NativeSelect
        ref={innerRef}
        placeholder={placeholder}
        {...props}
      >
        {GHANA_REGIONS.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </NativeSelect>
    )
  }
)

RegionSelect.displayName = "RegionSelect"

export default RegionSelect
