"use client"

import React from "react"
import { Type } from "lucide-react"
import { useCustomizer } from "../../context"

const FONT_OPTIONS = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Impact",
  "Comic Sans MS",
]

const SIZE_OPTIONS = [16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 96]

export default function TextPanel() {
  const { state, dispatch, addText, canvasRef } = useCustomizer()
  const [inputText, setInputText] = React.useState("")

  function updateActiveText(prop: string, value: any) {
    const canvas = canvasRef.current
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active && (active.type === "i-text" || active.type === "text")) {
      ;(active as any).set(prop, value)
      canvas.renderAll()
    }
  }

  function handleAddText() {
    const text = inputText.trim() || "Your Text"
    addText(text)
    setInputText("")
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Text</h3>

      {/* Text input */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAddText()
            }
          }}
          placeholder="Type your text here…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
        />
        <button
          onClick={handleAddText}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                     bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          <Type className="w-4 h-4" />
          Add Text to Design
        </button>
        <p className="text-[10px] text-gray-400">Tap text on the canvas to select it. Double-tap to edit.</p>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Font</label>
        <select
          value={state.fontFamily}
          onChange={(e) => {
            dispatch({ type: "SET_FONT_FAMILY", family: e.target.value })
            updateActiveText("fontFamily", e.target.value)
          }}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Size</label>
        <select
          value={state.fontSize}
          onChange={(e) => {
            const size = Number(e.target.value)
            dispatch({ type: "SET_FONT_SIZE", size })
            updateActiveText("fontSize", size)
          }}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}px
            </option>
          ))}
        </select>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={state.textColor}
            onChange={(e) => {
              dispatch({ type: "SET_TEXT_COLOR", color: e.target.value })
              updateActiveText("fill", e.target.value)
            }}
            className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
          />
          <span className="text-xs text-gray-400 uppercase">
            {state.textColor}
          </span>
        </div>
      </div>
    </div>
  )
}
