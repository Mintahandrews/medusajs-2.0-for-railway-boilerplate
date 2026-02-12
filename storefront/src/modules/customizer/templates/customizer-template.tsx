"use client"

import React, { useState, useCallback } from "react"
import { ChevronUp, ChevronDown, Upload, Type, Palette, Shield, Smartphone, ShoppingCart } from "lucide-react"
import { CustomizerProvider, useCustomizer, type ActiveTool } from "../context"
import FabricCanvas from "../components/fabric-canvas"
import Toolbar from "../components/toolbar"
import type { DeviceConfig } from "@lib/device-assets"
import { HttpTypes } from "@medusajs/types"

interface Props {
  deviceConfig: DeviceConfig
  productHandle: string
  product?: HttpTypes.StoreProduct | null
  region?: HttpTypes.StoreRegion | null
}

export default function CustomizerTemplate({ deviceConfig, productHandle, product, region }: Props) {
  return (
    <CustomizerProvider deviceConfig={deviceConfig}>
      <CustomizerLayout
        deviceConfig={deviceConfig}
        product={product}
        region={region}
      />
    </CustomizerProvider>
  )
}

/** Inner layout — can use useCustomizer() since it's inside the provider */
function CustomizerLayout({
  deviceConfig,
  product,
  region,
}: {
  deviceConfig: DeviceConfig
  product?: HttpTypes.StoreProduct | null
  region?: HttpTypes.StoreRegion | null
}) {
  const { dispatch } = useCustomizer()
  const [mobileExpanded, setMobileExpanded] = useState(false)

  const toggleMobilePanel = useCallback(() => {
    setMobileExpanded((prev) => !prev)
  }, [])

  const openTool = useCallback((tool: ActiveTool) => {
    dispatch({ type: "SET_TOOL", tool })
    setMobileExpanded(true)
  }, [dispatch])

  return (
    <>
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-64px)] bg-gray-100 overflow-hidden">

        {/* ---- Desktop sidebar ---- */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[340px] shrink-0 overflow-y-auto border-r border-gray-200">
          <Toolbar product={product} region={region} />
        </aside>

        {/* ---- Canvas area ---- */}
        <main
          className={`relative flex-1 flex flex-col items-center justify-center p-2 lg:p-8 min-h-0 transition-all duration-300 ${
            mobileExpanded ? "h-[40dvh] lg:h-auto" : "flex-1 lg:h-auto"
          }`}
        >
          {/* Device label */}
          <div className="mb-1 lg:mb-4 text-center">
            <h1 className="text-sm lg:text-lg font-semibold text-gray-900">
              Design Your Case
            </h1>
            <p className="text-[11px] lg:text-sm text-gray-500">{deviceConfig.name}</p>
          </div>

          {/* Canvas wrapper — touch-action: none prevents browser scroll hijacking on canvas */}
          <div
            className="flex-1 flex items-center justify-center w-full max-w-lg min-h-0"
            style={{ touchAction: "none" }}
          >
            <FabricCanvas />
          </div>
        </main>

        {/* ---- Mobile bottom sheet toolbar ---- */}
        <div
          className={`lg:hidden flex flex-col bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out ${
            mobileExpanded ? "h-[60dvh]" : "h-auto"
          }`}
        >
          {/* Drag handle / toggle */}
          <button
            onClick={toggleMobilePanel}
            className="flex items-center justify-center gap-1 py-2 text-gray-400 active:text-gray-600 shrink-0"
            aria-label={mobileExpanded ? "Collapse tools" : "Expand tools"}
          >
            <div className="w-10 h-1 rounded-full bg-gray-300" />
            {mobileExpanded ? (
              <ChevronDown size={16} className="ml-1" />
            ) : (
              <ChevronUp size={16} className="ml-1" />
            )}
          </button>

          {/* Toolbar content — scrollable when expanded */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden ${mobileExpanded ? "" : "hidden"}`}>
            <Toolbar product={product} region={region} />
          </div>

          {/* Collapsed quick-access tabs — show tool icons when collapsed */}
          {!mobileExpanded && <MobileQuickBar onExpand={openTool} />}
        </div>
      </div>


      {/* Global touch-friendly styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @supports (height: 100dvh) {
          /* Dynamic viewport height for mobile browsers */
        }
      `}} />
    </>
  )
}

/**
 * Quick-access toolbar icons shown in the collapsed mobile bottom bar.
 * Tapping any icon expands the full toolbar and switches to that tool.
 */
const QUICK_TOOLS: { label: string; icon: any; tool: ActiveTool; highlight?: boolean }[] = [
  { label: "Upload", icon: Upload, tool: "upload" },
  { label: "Text", icon: Type, tool: "text" },
  { label: "Color", icon: Palette, tool: "background" },
  { label: "Case", icon: Shield, tool: "case-type" },
  { label: "Cart", icon: ShoppingCart, tool: "cart", highlight: true },
  { label: "Preview", icon: Smartphone, tool: "preview" },
]

function MobileQuickBar({ onExpand }: { onExpand: (tool: ActiveTool) => void }) {
  return (
    <div className="flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom,8px)]">
      {QUICK_TOOLS.map(({ label, icon: Icon, tool, highlight }) => (
        <button
          key={label}
          onClick={() => onExpand(tool)}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-1 min-w-[48px] min-h-[44px] justify-center ${
            highlight
              ? "text-white bg-black rounded-xl mx-0.5"
              : "text-gray-500 active:text-black"
          }`}
        >
          <Icon size={18} strokeWidth={1.8} />
          <span className="text-[9px] font-medium leading-none">{label}</span>
        </button>
      ))}
    </div>
  )
}
