"use client"

import React from "react"
import { useCustomizer } from "../../context"

const PRESET_COLORS = [
  "#ffffff",
  "#000000",
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#e5e7eb",
  "#1e293b",
  "#7c3aed",
  "#0ea5e9",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
]

export default function BackgroundPanel() {
  const { state, setBackgroundColor } = useCustomizer()

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Background</h3>

      {/* Preset swatches */}
      <div className="grid grid-cols-5 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setBackgroundColor(color)}
            className={`w-full aspect-square rounded-lg border-2 transition-all ${
              state.backgroundColor === color
                ? "border-brand scale-110 shadow-md"
                : "border-gray-200 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Custom color picker */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Custom Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={state.backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
          />
          <span className="text-xs text-gray-400 uppercase">
            {state.backgroundColor}
          </span>
        </div>
      </div>
    </div>
  )
}
