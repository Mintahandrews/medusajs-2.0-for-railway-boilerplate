"use client"

import React, { useEffect, useCallback } from "react"
import { Type, Edit3 } from "lucide-react"
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
  const { state, dispatch, addText, canvasRef, pushHistory } = useCustomizer()
  const [inputText, setInputText] = React.useState("")
  const [selectedTextContent, setSelectedTextContent] = React.useState<string | null>(null)
  const [hasTextSelected, setHasTextSelected] = React.useState(false)

  /* ---- Sync panel with the currently selected text object ---- */
  const syncFromSelection = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active && (active.type === "i-text" || active.type === "text" || active.type === "textbox")) {
      setHasTextSelected(true)
      setSelectedTextContent((active as any).text || "")
      const family = (active as any).fontFamily || "Arial"
      const size = (active as any).fontSize || 32
      const color = (active as any).fill || "#000000"
      dispatch({ type: "SET_FONT_FAMILY", family })
      dispatch({ type: "SET_FONT_SIZE", size })
      dispatch({ type: "SET_TEXT_COLOR", color })
    } else {
      setHasTextSelected(false)
      setSelectedTextContent(null)
    }
  }, [canvasRef, dispatch])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onSelect = () => syncFromSelection()
    const onDeselect = () => {
      setHasTextSelected(false)
      setSelectedTextContent(null)
    }

    canvas.on("selection:created", onSelect)
    canvas.on("selection:updated", onSelect)
    canvas.on("selection:cleared", onDeselect)
    // Also sync on text editing changes
    canvas.on("text:changed", onSelect)

    // Sync on mount
    syncFromSelection()

    return () => {
      canvas.off("selection:created", onSelect)
      canvas.off("selection:updated", onSelect)
      canvas.off("selection:cleared", onDeselect)
      canvas.off("text:changed", onSelect)
    }
  }, [canvasRef, syncFromSelection])

  function updateActiveText(prop: string, value: any) {
    const canvas = canvasRef.current
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active && (active.type === "i-text" || active.type === "text" || active.type === "textbox")) {
      ;(active as any).set(prop, value)
      canvas.renderAll()
      pushHistory()
    }
  }

  function handleUpdateSelectedContent(newContent: string) {
    const canvas = canvasRef.current
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active && (active.type === "i-text" || active.type === "text" || active.type === "textbox")) {
      ;(active as any).set("text", newContent)
      setSelectedTextContent(newContent)
      canvas.renderAll()
      pushHistory()
    }
  }

  function handleAddText() {
    const text = inputText.trim() || "Your Text"
    addText(text)
    setInputText("")
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-bold text-gray-800">Text</h3>

      {/* Add new text */}
      <div className="flex flex-col gap-2">
        <label className="block text-xs font-semibold text-gray-600">Add New Text</label>
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand placeholder:text-gray-400"
        />
        <button
          onClick={handleAddText}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                     bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <Type className="w-4 h-4" />
          Add Text to Design
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Selected text editing — only shown when text object is selected */}
      {hasTextSelected ? (
        <div className="flex flex-col gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-brand" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Edit Selected Text
            </span>
          </div>

          {/* Edit content */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Content</label>
            <input
              type="text"
              value={selectedTextContent || ""}
              onChange={(e) => handleUpdateSelectedContent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Font</label>
            <select
              value={state.fontFamily}
              onChange={(e) => {
                dispatch({ type: "SET_FONT_FAMILY", family: e.target.value })
                updateActiveText("fontFamily", e.target.value)
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">Size</label>
            <select
              value={state.fontSize}
              onChange={(e) => {
                const size = Number(e.target.value)
                dispatch({ type: "SET_FONT_SIZE", size })
                updateActiveText("fontSize", size)
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={state.textColor}
                onChange={(e) => {
                  dispatch({ type: "SET_TEXT_COLOR", color: e.target.value })
                  updateActiveText("fill", e.target.value)
                }}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
              />
              <span className="text-xs font-medium text-gray-500 uppercase">
                {state.textColor}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Type className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 max-w-[200px]">
            Add text above, then <strong className="text-gray-600">tap it on the canvas</strong> to select and edit its font, size, and color.
          </p>
        </div>
      )}

      <p className="text-[10px] text-gray-400">
        Tip: Double-tap text on the canvas to edit it directly.
      </p>
    </div>
  )
}
