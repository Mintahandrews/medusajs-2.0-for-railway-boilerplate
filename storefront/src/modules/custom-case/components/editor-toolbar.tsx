"use client"

import { useState } from "react"
import {
  MousePointer2,
  Type,
  Pencil,
  Smile,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Eraser,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Minus,
  Plus,
  Palette,
  Bold,
  Italic,
  Underline,
  ChevronDown,
} from "lucide-react"
import { STICKER_PACKS, FONT_OPTIONS } from "../types"

export type EditorTool = "select" | "text" | "draw" | "sticker" | "shape" | "eraser"
export type ShapeType = "rect" | "circle" | "triangle" | "star" | "heart" | "line"

type EditorToolbarProps = {
  activeTool: EditorTool
  onToolChange: (tool: EditorTool) => void
  brushColor: string
  onBrushColorChange: (color: string) => void
  brushWidth: number
  onBrushWidthChange: (width: number) => void
  fillColor: string
  onFillColorChange: (color: string) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  fontFamily: string
  onFontFamilyChange: (family: string) => void
  textColor: string
  onTextColorChange: (color: string) => void
  textBold: boolean
  onTextBoldChange: (bold: boolean) => void
  textItalic: boolean
  onTextItalicChange: (italic: boolean) => void
  activeShape: ShapeType
  onShapeChange: (shape: ShapeType) => void
  onAddSticker: (emoji: string) => void
  onAddImage: () => void
  onDeleteSelected: () => void
  onDuplicateSelected: () => void
  onBringForward: () => void
  onSendBackward: () => void
  onUndo: () => void
  onRedo: () => void
  onClearAll: () => void
  canUndo: boolean
  canRedo: boolean
  hasSelection: boolean
}

const TOOL_COLORS = [
  "#000000", "#FFFFFF", "#FF3B30", "#FF9500", "#FFCC00",
  "#34C759", "#5AC8FA", "#007AFF", "#5856D6", "#AF52DE",
  "#FF2D55", "#A2845E", "#8E8E93", "#636366",
]

const TOOLS: { id: EditorTool; icon: typeof MousePointer2; label: string; shortcut?: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "text", icon: Type, label: "Text", shortcut: "T" },
  { id: "draw", icon: Pencil, label: "Draw", shortcut: "D" },
  { id: "sticker", icon: Smile, label: "Sticker", shortcut: "S" },
  { id: "shape", icon: Square, label: "Shape", shortcut: "R" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
]

const SHAPES: { id: ShapeType; icon: typeof Square; label: string }[] = [
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "triangle", icon: Triangle, label: "Triangle" },
  { id: "star", icon: Star, label: "Star" },
  { id: "heart", icon: Heart, label: "Heart" },
  { id: "line", icon: Minus, label: "Line" },
]

export default function EditorToolbar({
  activeTool,
  onToolChange,
  brushColor,
  onBrushColorChange,
  brushWidth,
  onBrushWidthChange,
  fillColor,
  onFillColorChange,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  textColor,
  onTextColorChange,
  textBold,
  onTextBoldChange,
  textItalic,
  onTextItalicChange,
  activeShape,
  onShapeChange,
  onAddSticker,
  onAddImage,
  onDeleteSelected,
  onDuplicateSelected,
  onBringForward,
  onSendBackward,
  onUndo,
  onRedo,
  onClearAll,
  canUndo,
  canRedo,
  hasSelection,
}: EditorToolbarProps) {
  const [showStickers, setShowStickers] = useState(false)
  const [showShapes, setShowShapes] = useState(false)
  const [showFonts, setShowFonts] = useState(false)

  return (
    <div className="space-y-3">
      {/* ── Primary Tool Buttons ── */}
      <div className="flex items-center gap-1 flex-wrap">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                onToolChange(tool.id)
                if (tool.id === "sticker") setShowStickers((v) => !v)
                else setShowStickers(false)
                if (tool.id === "shape") setShowShapes((v) => !v)
                else setShowShapes(false)
              }}
              title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
              className={`relative h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? "bg-black text-white shadow-md scale-105"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
            </button>
          )
        })}
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={onAddImage}
          title="Upload Image"
          className="h-9 w-9 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      {/* ── Shape Picker ── */}
      {activeTool === "shape" && showShapes && (
        <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-xl">
          {SHAPES.map((shape) => {
            const Icon = shape.icon
            return (
              <button
                key={shape.id}
                type="button"
                onClick={() => onShapeChange(shape.id)}
                title={shape.label}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                  activeShape === shape.id
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Icon size={14} />
              </button>
            )
          })}
        </div>
      )}

      {/* ── Sticker Picker ── */}
      {activeTool === "sticker" && showStickers && (
        <div className="bg-gray-50 rounded-xl p-3 max-h-[200px] overflow-y-auto space-y-2">
          {STICKER_PACKS.map((pack) => (
            <div key={pack.category}>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{pack.category}</p>
              <div className="flex flex-wrap gap-1">
                {pack.stickers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onAddSticker(s.emoji)}
                    title={s.label}
                    className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm flex items-center justify-center text-[18px] transition-all hover:scale-110"
                  >
                    {s.emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Draw / Eraser Options ── */}
      {(activeTool === "draw" || activeTool === "eraser") && (
        <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Brush Size
            </span>
            <span className="text-[11px] font-bold text-gray-600">{brushWidth}px</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBrushWidthChange(Math.max(1, brushWidth - 1))}
              className="h-6 w-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <Minus size={10} />
            </button>
            <input
              type="range"
              min={1}
              max={50}
              value={brushWidth}
              onChange={(e) => onBrushWidthChange(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 accent-black"
            />
            <button
              type="button"
              onClick={() => onBrushWidthChange(Math.min(50, brushWidth + 1))}
              className="h-6 w-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <Plus size={10} />
            </button>
          </div>
          {activeTool === "draw" && (
            <>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Color</span>
              <div className="flex flex-wrap gap-1.5">
                {TOOL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onBrushColorChange(color)}
                    className={`h-6 w-6 rounded-full border-2 transition-all ${
                      brushColor === color ? "border-black scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Text Options ── */}
      {activeTool === "text" && (
        <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setShowFonts((v) => !v)}
                className="w-full h-8 px-2 rounded-lg bg-white border border-gray-200 text-[11px] font-medium text-gray-700 flex items-center justify-between hover:border-gray-300 transition"
              >
                <span style={{ fontFamily }}>{FONT_OPTIONS.find((f) => f.family === fontFamily)?.name || "Inter"}</span>
                <ChevronDown size={10} />
              </button>
              {showFonts && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFonts(false)} />
                  <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-1 max-h-[160px] overflow-y-auto">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => { onFontFamilyChange(font.family); setShowFonts(false) }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition ${
                          fontFamily === font.family ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1 h-8">
              <button
                type="button"
                onClick={() => onFontSizeChange(Math.max(8, fontSize - 2))}
                className="h-5 w-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <Minus size={10} />
              </button>
              <span className="text-[11px] font-bold text-gray-600 w-6 text-center">{fontSize}</span>
              <button
                type="button"
                onClick={() => onFontSizeChange(Math.min(120, fontSize + 2))}
                className="h-5 w-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <Plus size={10} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onTextBoldChange(!textBold)}
              className={`h-7 w-7 rounded-md flex items-center justify-center transition ${
                textBold ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Bold size={12} />
            </button>
            <button
              type="button"
              onClick={() => onTextItalicChange(!textItalic)}
              className={`h-7 w-7 rounded-md flex items-center justify-center transition ${
                textItalic ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Italic size={12} />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <div className="flex flex-wrap gap-1">
              {TOOL_COLORS.slice(0, 8).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onTextColorChange(color)}
                  className={`h-5 w-5 rounded-full border-2 transition-all ${
                    textColor === color ? "border-black scale-110" : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Shape Fill Color ── */}
      {activeTool === "shape" && (
        <div className="space-y-1.5 p-3 bg-gray-50 rounded-xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fill Color</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onFillColorChange("transparent")}
              className={`h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center ${
                fillColor === "transparent" ? "border-black scale-110" : "border-gray-200 hover:border-gray-400"
              }`}
              style={{ background: "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px" }}
              title="No fill"
            />
            {TOOL_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onFillColorChange(color)}
                className={`h-6 w-6 rounded-full border-2 transition-all ${
                  fillColor === color ? "border-black scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Stroke Color</span>
          <div className="flex flex-wrap gap-1.5">
            {TOOL_COLORS.slice(0, 8).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onBrushColorChange(color)}
                className={`h-5 w-5 rounded-full border-2 transition-all ${
                  brushColor === color ? "border-black scale-110" : "border-gray-200 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Object Actions ── */}
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <Undo2 size={14} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
          className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <Redo2 size={14} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        {hasSelection && (
          <>
            <button
              type="button"
              onClick={onDuplicateSelected}
              title="Duplicate"
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
            >
              <Copy size={14} />
            </button>
            <button
              type="button"
              onClick={onBringForward}
              title="Bring Forward"
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              onClick={onSendBackward}
              title="Send Backward"
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
            >
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              onClick={onDeleteSelected}
              title="Delete"
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={onClearAll}
            title="Clear All"
            className="h-7 px-2 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}
