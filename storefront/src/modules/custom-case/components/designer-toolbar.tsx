"use client"

import { useRef, useState } from "react"
import {
  Type,
  ImagePlus,
  Palette,
  Trash2,
  Download,
  RotateCcw,
  Bold,
  Italic,
} from "lucide-react"
import { CASE_COLORS } from "../types"
import type { DesignerCanvasHandle } from "./designer-canvas"

type Props = {
  canvasRef: React.RefObject<DesignerCanvasHandle | null>
  backgroundColor: string
  onBackgroundChange: (color: string) => void
  onExport: () => void
}

export default function DesignerToolbar({
  canvasRef,
  backgroundColor,
  onBackgroundChange,
  onExport,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activePanel, setActivePanel] = useState<"text" | "color" | null>(null)
  const [textInput, setTextInput] = useState("")
  const [textColor, setTextColor] = useState("#000000")

  const togglePanel = (panel: "text" | "color") => {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }

  const handleAddText = () => {
    const trimmed = textInput.trim()
    if (!trimmed) return
    canvasRef.current?.addText(trimmed, { fill: textColor })
    setTextInput("")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      canvasRef.current?.addImage(url)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleDeleteSelected = () => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return
    const active = canvas.getActiveObjects()
    if (active.length) {
      active.forEach((obj) => canvas.remove(obj))
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }

  const handleClearAll = () => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return
    canvas.clear()
    canvas.backgroundColor = backgroundColor
    canvas.renderAll()
  }

  const handleBoldToggle = () => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj && "fontWeight" in obj) {
      ;(obj as any).set("fontWeight", (obj as any).fontWeight === "bold" ? "normal" : "bold")
      canvas.renderAll()
    }
  }

  const handleItalicToggle = () => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj && "fontStyle" in obj) {
      ;(obj as any).set("fontStyle", (obj as any).fontStyle === "italic" ? "normal" : "italic")
      canvas.renderAll()
    }
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <ToolButton
          icon={<Type size={16} />}
          label="Text"
          active={activePanel === "text"}
          onClick={() => togglePanel("text")}
        />
        <ToolButton
          icon={<ImagePlus size={16} />}
          label="Image"
          onClick={() => fileInputRef.current?.click()}
        />
        <ToolButton
          icon={<Palette size={16} />}
          label="Color"
          active={activePanel === "color"}
          onClick={() => togglePanel("color")}
        />
        <ToolButton
          icon={<Trash2 size={16} />}
          label="Delete"
          onClick={handleDeleteSelected}
          variant="danger"
        />
        <ToolButton
          icon={<RotateCcw size={16} />}
          label="Clear"
          onClick={handleClearAll}
          variant="danger"
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Text panel */}
      {activePanel === "text" && (
        <div className="rounded-xl border border-grey-20 bg-white p-4 space-y-3">
          <h4 className="text-[12px] font-semibold text-grey-90 uppercase tracking-wide">
            Add Text
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddText()}
              placeholder="Type your text..."
              className="flex-1 h-9 rounded-lg border border-grey-20 px-3 text-[13px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={handleAddText}
              className="h-9 px-4 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition"
            >
              Add
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[12px] text-grey-50">Color:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border border-grey-20"
            />
            <button
              type="button"
              onClick={handleBoldToggle}
              className="h-7 w-7 rounded border border-grey-20 flex items-center justify-center text-grey-60 hover:text-grey-90 hover:border-grey-40 transition"
              title="Bold"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onClick={handleItalicToggle}
              className="h-7 w-7 rounded border border-grey-20 flex items-center justify-center text-grey-60 hover:text-grey-90 hover:border-grey-40 transition"
              title="Italic"
            >
              <Italic size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Color panel */}
      {activePanel === "color" && (
        <div className="rounded-xl border border-grey-20 bg-white p-4 space-y-3">
          <h4 className="text-[12px] font-semibold text-grey-90 uppercase tracking-wide">
            Case Background
          </h4>
          <div className="flex flex-wrap gap-2">
            {CASE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onBackgroundChange(color)}
                className={`h-8 w-8 rounded-full border-2 transition hover:scale-110 ${
                  backgroundColor === color
                    ? "border-brand ring-2 ring-brand/30"
                    : "border-grey-20"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Set background to ${color}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[12px] text-grey-50">Custom:</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundChange(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border border-grey-20"
            />
          </div>
        </div>
      )}

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-brand text-white text-[14px] font-semibold hover:bg-brand-dark transition"
      >
        <Download size={16} />
        Save &amp; Add to Cart
      </button>
    </div>
  )
}

function ToolButton({
  icon,
  label,
  active,
  onClick,
  variant = "default",
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
  variant?: "default" | "danger"
}) {
  const base =
    "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition"
  const styles =
    variant === "danger"
      ? "border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
      : active
        ? "border-brand bg-brand/5 text-brand"
        : "border-grey-20 text-grey-60 hover:border-grey-40 hover:text-grey-90"

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {icon}
      <span>{label}</span>
    </button>
  )
}
