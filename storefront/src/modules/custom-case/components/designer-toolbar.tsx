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
  Undo2,
  Redo2,
  Smile,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react"
import { CASE_COLORS, GRADIENT_PRESETS, STICKER_PACKS, FONT_OPTIONS } from "../types"
import type { DesignerCanvasHandle } from "./designer-canvas"

type PanelType = "text" | "color" | "stickers" | "gradient" | null

type Props = {
  canvasRef: React.RefObject<DesignerCanvasHandle | null>
  backgroundColor: string
  onBackgroundChange: (color: string) => void
  onGradientChange: (colors: string[]) => void
  onExport: () => void
}

export default function DesignerToolbar({
  canvasRef,
  backgroundColor,
  onBackgroundChange,
  onGradientChange,
  onExport,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activePanel, setActivePanel] = useState<PanelType>(null)
  const [textInput, setTextInput] = useState("")
  const [textColor, setTextColor] = useState("#000000")
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0])
  const [stickerCategory, setStickerCategory] = useState(STICKER_PACKS[0].category)

  const togglePanel = (panel: PanelType) => {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }

  const handleAddText = () => {
    const trimmed = textInput.trim()
    if (!trimmed) return
    canvasRef.current?.addText(trimmed, {
      fill: textColor,
      fontFamily: selectedFont.family,
    })
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

  const handleFontChange = (fontId: string) => {
    const font = FONT_OPTIONS.find((f) => f.id === fontId)
    if (!font) return
    setSelectedFont(font)
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj && "fontFamily" in obj) {
      ;(obj as any).set("fontFamily", font.family)
      canvas.renderAll()
    }
  }

  const handleBringForward = () => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj) {
      canvas.bringObjectForward(obj)
      canvas.renderAll()
    }
  }

  const handleSendBackward = () => {
    const canvas = canvasRef.current?.getCanvas()
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj) {
      canvas.sendObjectBackwards(obj)
      canvas.renderAll()
    }
  }

  return (
    <div className="space-y-4">
      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => canvasRef.current?.undo()}
          className="h-8 w-8 rounded-lg border border-grey-20 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:border-grey-40 transition"
          title="Undo"
        >
          <Undo2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => canvasRef.current?.redo()}
          className="h-8 w-8 rounded-lg border border-grey-20 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:border-grey-40 transition"
          title="Redo"
        >
          <Redo2 size={14} />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleBringForward}
          className="h-8 w-8 rounded-lg border border-grey-20 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:border-grey-40 transition"
          title="Bring forward"
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          onClick={handleSendBackward}
          className="h-8 w-8 rounded-lg border border-grey-20 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:border-grey-40 transition"
          title="Send backward"
        >
          <ArrowDown size={14} />
        </button>
      </div>

      {/* Tool buttons */}
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
          icon={<Sparkles size={16} />}
          label="Gradient"
          active={activePanel === "gradient"}
          onClick={() => togglePanel("gradient")}
        />
        <ToolButton
          icon={<Smile size={16} />}
          label="Stickers"
          active={activePanel === "stickers"}
          onClick={() => togglePanel("stickers")}
        />
      </div>

      {/* Danger actions */}
      <div className="flex gap-2">
        <ToolButton
          icon={<Trash2 size={14} />}
          label="Delete"
          onClick={handleDeleteSelected}
          variant="danger"
        />
        <ToolButton
          icon={<RotateCcw size={14} />}
          label="Clear All"
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
        <div className="rounded-xl border border-grey-20 bg-white p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
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

          {/* Font selector */}
          <div>
            <label className="text-[11px] text-grey-50 uppercase tracking-wide mb-1.5 block">Font</label>
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleFontChange(font.id)}
                  className={`h-8 rounded-lg border px-2 text-[12px] truncate transition ${
                    selectedFont.id === font.id
                      ? "border-brand bg-brand/5 text-brand font-semibold"
                      : "border-grey-20 text-grey-60 hover:border-grey-40"
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </button>
              ))}
            </div>
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
        <div className="rounded-xl border border-grey-20 bg-white p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-[12px] font-semibold text-grey-90 uppercase tracking-wide">
            Solid Color
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

      {/* Gradient panel */}
      {activePanel === "gradient" && (
        <div className="rounded-xl border border-grey-20 bg-white p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-[12px] font-semibold text-grey-90 uppercase tracking-wide">
            Gradient Background
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onGradientChange(preset.colors)}
                className="group flex flex-col items-center gap-1"
                title={preset.name}
              >
                <div
                  className="h-10 w-full rounded-lg border border-grey-20 group-hover:ring-2 group-hover:ring-brand/30 transition"
                  style={{ background: preset.css }}
                />
                <span className="text-[10px] text-grey-50 truncate w-full text-center">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stickers panel */}
      {activePanel === "stickers" && (
        <div className="rounded-xl border border-grey-20 bg-white p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-[12px] font-semibold text-grey-90 uppercase tracking-wide">
            Stickers
          </h4>
          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {STICKER_PACKS.map((pack) => (
              <button
                key={pack.category}
                type="button"
                onClick={() => setStickerCategory(pack.category)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                  stickerCategory === pack.category
                    ? "bg-brand text-white"
                    : "bg-grey-10 text-grey-50 hover:text-grey-90"
                }`}
              >
                {pack.category}
              </button>
            ))}
          </div>
          {/* Sticker grid */}
          <div className="grid grid-cols-6 gap-1">
            {STICKER_PACKS.find((p) => p.category === stickerCategory)?.stickers.map(
              (sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => canvasRef.current?.addSticker(sticker.emoji)}
                  className="h-10 w-10 rounded-lg border border-grey-10 hover:border-grey-30 hover:bg-grey-5 flex items-center justify-center text-[22px] transition hover:scale-110"
                  title={sticker.label}
                >
                  {sticker.emoji}
                </button>
              )
            )}
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
        Save &amp; Preview
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
