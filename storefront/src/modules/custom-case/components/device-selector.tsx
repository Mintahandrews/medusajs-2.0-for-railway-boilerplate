"use client"

import { useMemo } from "react"
import { Smartphone } from "lucide-react"
import { DEVICE_TEMPLATES, type DeviceTemplate } from "../types"

type Props = {
  selected: DeviceTemplate
  onSelect: (device: DeviceTemplate) => void
}

export default function DeviceSelector({ selected, onSelect }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, DeviceTemplate[]>()
    for (const d of DEVICE_TEMPLATES) {
      const list = map.get(d.brand) || []
      list.push(d)
      map.set(d.brand, list)
    }
    return Array.from(map.entries())
  }, [])

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-semibold text-grey-90 uppercase tracking-wide">
        Choose Device
      </h3>
      {grouped.map(([brand, devices]) => (
        <div key={brand}>
          <p className="text-[11px] font-semibold text-grey-50 uppercase tracking-wider mb-2">
            {brand}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {devices.map((device) => {
              const active = device.id === selected.id
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => onSelect(device)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition text-[13px] ${
                    active
                      ? "border-brand bg-brand/5 text-brand font-semibold"
                      : "border-grey-20 text-grey-60 hover:border-grey-40 hover:text-grey-90"
                  }`}
                >
                  <Smartphone size={14} className={active ? "text-brand" : "text-grey-40"} />
                  <span className="truncate">{device.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
