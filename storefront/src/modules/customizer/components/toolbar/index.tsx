"use client"

import React from "react"
import {
  MousePointer2,
  Upload,
  Type,
  Palette,
  ShoppingCart,
  Undo2,
  Redo2,
  Trash2,
  Download,
} from "lucide-react"
import { useCustomizer, type ActiveTool } from "../../context"
import UploadPanel from "./upload-panel"
import TextPanel from "./text-panel"
import BackgroundPanel from "./background-panel"
import AddToCartPanel from "./add-to-cart-panel"
import { HttpTypes } from "@medusajs/types"

const TOOLS: { id: ActiveTool; label: string; icon: React.ReactNode }[] = [
  { id: "select", label: "Select", icon: <MousePointer2 className="w-5 h-5" /> },
  { id: "upload", label: "Uploads", icon: <Upload className="w-5 h-5" /> },
  { id: "text", label: "Text", icon: <Type className="w-5 h-5" /> },
  { id: "background", label: "Background", icon: <Palette className="w-5 h-5" /> },
  { id: "cart", label: "Cart", icon: <ShoppingCart className="w-5 h-5" /> },
]

interface ToolbarProps {
  product?: HttpTypes.StoreProduct | null
  region?: HttpTypes.StoreRegion | null
}

export default function Toolbar({ product, region }: ToolbarProps) {
  const {
    state,
    dispatch,
    canvasRef,
    undo,
    redo,
    exportPrintFile,
    exportPreview,
  } = useCustomizer()

  function deleteSelected() {
    const canvas = canvasRef.current
    if (!canvas) return
    const active = canvas.getActiveObjects()
    if (active?.length) {
      active.forEach((obj: any) => canvas.remove(obj))
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }

  function handleDownload() {
    const dataUrl = exportPreview()
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "case-preview.png"
    a.click()
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Tool tabs */}
      <div className="flex border-b border-gray-200">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => dispatch({ type: "SET_TOOL", tool: tool.id })}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              state.activeTool === tool.id
                ? "text-black border-b-2 border-black bg-gray-50"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div className="flex-1 overflow-y-auto">
        {state.activeTool === "upload" && <UploadPanel />}
        {state.activeTool === "text" && <TextPanel />}
        {state.activeTool === "background" && <BackgroundPanel />}
        {state.activeTool === "select" && (
          <div className="p-4 text-sm text-gray-400">
            <p className="mb-2">Click an object on the canvas to select it.</p>
            <p>Use the tools above to add images, text, or change the background.</p>
          </div>
        )}
        {state.activeTool === "cart" && product && region && (
          <AddToCartPanel product={product} region={region} />
        )}
        {state.activeTool === "cart" && (!product || !region) && (
          <div className="p-4 text-sm text-gray-400">
            <p>Product data not available. Add to cart from the product page.</p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-gray-200 p-3 flex flex-col gap-2">
        {/* Undo / Redo / Delete row */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!state.canUndo}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs
                       border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!state.canRedo}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs
                       border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={deleteSelected}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs
                       border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                     bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Preview
        </button>
      </div>
    </div>
  )
}
