"use client"

import { GRID_LAYOUTS, type GridLayout } from "../types"

type LayoutSelectorProps = {
  selectedId: string
  onSelect: (layout: GridLayout) => void
}

const SLOT_COLORS = [
  "bg-sky-200", "bg-rose-200", "bg-amber-200", "bg-emerald-200",
  "bg-violet-200", "bg-orange-200", "bg-teal-200", "bg-pink-200",
]

export default function LayoutSelector({ selectedId, onSelect }: LayoutSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {GRID_LAYOUTS.map((layout) => {
        const active = selectedId === layout.id
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onSelect(layout)}
            className={`group relative flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all duration-200 ${
              active
                ? "bg-black text-white shadow-lg scale-[1.02]"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:shadow-md"
            }`}
            title={layout.name}
          >
            <div
              className="w-full rounded-lg overflow-hidden relative"
              style={{ aspectRatio: "9 / 16", gap: "1px" }}
            >
              {layout.slots.map((slot, i) => (
                <div
                  key={slot.id}
                  className={`absolute ${
                    active ? "opacity-90" : "opacity-70 group-hover:opacity-90"
                  } ${SLOT_COLORS[i % SLOT_COLORS.length]} transition-opacity`}
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `calc(${slot.width}% - 1px)`,
                    height: `calc(${slot.height}% - 1px)`,
                    margin: "0.5px",
                    borderRadius: "2px",
                  }}
                />
              ))}
            </div>
            <span className={`text-[9px] font-semibold truncate w-full text-center leading-none ${
              active ? "text-white" : "text-gray-500"
            }`}>
              {layout.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
