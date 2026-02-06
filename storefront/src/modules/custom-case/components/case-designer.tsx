"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  DEVICE_TEMPLATES,
  CASE_TYPES,
  BG_COLORS,
  type DeviceTemplate,
  type CaseType,
} from "../types"
import type { FabricCaseEditorHandle } from "./fabric-case-editor"
import EditorToolbar, { type EditorTool, type ShapeType } from "./editor-toolbar"
import { addCustomCaseToCart } from "@lib/data/custom-case"
import {
  ShoppingCart,
  Download,
  X,
  Smartphone,
  Box,
  Loader2,
  Check,
  ChevronDown,
  Shield,
  Palette,
  Wand2,
  RotateCcw,
  Eye,
  Camera,
  Sparkles,
  Star,
  ChevronLeft,
} from "lucide-react"
import { CASE_MATERIALS, ENV_PRESETS, type CaseMaterial, type EnvironmentPreset, type CaseViewer3DHandle } from "../case-viewer-types"

const FabricCaseEditor = dynamic(() => import("./fabric-case-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        <span className="text-[12px] text-gray-400">Loading editor...</span>
      </div>
    </div>
  ),
})

const CaseViewer3D = dynamic(() => import("./case-viewer-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[460px]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        <span className="text-[12px] text-gray-400">Loading 3D viewer...</span>
      </div>
    </div>
  ),
})

type SidebarTab = "case" | "design" | "color"

const SIDEBAR_TABS: { id: SidebarTab; label: string; icon: typeof Shield }[] = [
  { id: "case", label: "Case", icon: Shield },
  { id: "design", label: "Design", icon: Wand2 },
  { id: "color", label: "Color", icon: Palette },
]

export default function CaseDesigner() {
  const params = useParams()
  const router = useRouter()
  const countryCode = (params?.countryCode as string) || "gh"

  // --- DEVICE & CASE STATE ---
  const [device, setDevice] = useState<DeviceTemplate>(DEVICE_TEMPLATES[0])
  const [caseType, setCaseType] = useState<CaseType>(CASE_TYPES[0])
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [activeTab, setActiveTab] = useState<SidebarTab>("design")

  // --- EDITOR TOOL STATE ---
  const [activeTool, setActiveTool] = useState<EditorTool>("select")
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushWidth, setBrushWidth] = useState(4)
  const [fillColor, setFillColor] = useState("#FF3B30")
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif")
  const [textColor, setTextColor] = useState("#000000")
  const [textBold, setTextBold] = useState(false)
  const [textItalic, setTextItalic] = useState(false)
  const [activeShape, setActiveShape] = useState<ShapeType>("rect")
  const [hasSelection, setHasSelection] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // --- 3D / PREVIEW STATE ---
  const [preview, setPreview] = useState<string | null>(null)
  const [previewTab, setPreviewTab] = useState<"flat" | "3d">("3d")
  const [caseMaterial, setCaseMaterial] = useState<CaseMaterial>("glossy")
  const [caseColor, setCaseColor] = useState("#c0c0c0")
  const [envPreset, setEnvPreset] = useState<EnvironmentPreset>("studio")
  const [showLive3D, setShowLive3D] = useState(false)
  const [liveTexture, setLiveTexture] = useState<string | null>(null)
  const [performanceMode] = useState(false)
  const [cartStatus, setCartStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [cartError, setCartError] = useState<string | null>(null)
  const [deviceDropdown, setDeviceDropdown] = useState(false)

  const fabricEditorRef = useRef<FabricCaseEditorHandle>(null)
  const viewer3DRef = useRef<CaseViewer3DHandle>(null)
  const syncTimerRef = useRef<number | null>(null)
  const previewOpen = Boolean(preview)

  // --- SYNC: Export Fabric canvas to 3D texture ---
  const syncFabricTo3D = useCallback(() => {
    if (!showLive3D && !previewOpen) return
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(() => {
      try {
        const dataUrl = fabricEditorRef.current?.exportToDataURL(performanceMode ? 1 : 2)
        if (dataUrl) {
          if (showLive3D) setLiveTexture(dataUrl)
          if (previewOpen) setPreview(dataUrl)
        }
      } catch (err) {
        console.error("Failed to sync texture:", err)
      }
    }, 200)
  }, [showLive3D, previewOpen, performanceMode])

  // --- HANDLERS ---
  const handleDeviceChange = useCallback((d: DeviceTemplate) => {
    setDevice(d)
    setDeviceDropdown(false)
    setPreview(null)
  }, [])

  const handleCanvasChange = useCallback(() => {
    syncFabricTo3D()
  }, [syncFabricTo3D])

  const handleHistoryChange = useCallback((undo: boolean, redo: boolean) => {
    setCanUndo(undo)
    setCanRedo(redo)
  }, [])

  const handleGeneratePreview = useCallback(() => {
    try {
      const dataUrl = fabricEditorRef.current?.exportToDataURL(2)
      if (dataUrl) {
        setPreview(dataUrl)
        if (showLive3D) setLiveTexture(dataUrl)
      }
    } catch (err) {
      console.error("Preview generation failed:", err)
    }
  }, [showLive3D])

  const handleDownload = useCallback(() => {
    const dataUrl = preview || fabricEditorRef.current?.exportToDataURL(2)
    if (!dataUrl) return
    const link = document.createElement("a")
    link.download = `custom-case-${device.id}.png`
    link.href = dataUrl
    link.click()
  }, [device.id, preview])

  const handleDownload3D = useCallback(() => {
    const url = viewer3DRef.current?.screenshot()
    if (!url) return
    const link = document.createElement("a")
    link.download = `custom-case-${device.id}-3d.png`
    link.href = url
    link.click()
  }, [device.id])

  const handleAddToCart = useCallback(async () => {
    setCartStatus("loading")
    setCartError(null)
    try {
      const designImage = fabricEditorRef.current?.exportToDataURL(2)
      if (!designImage) {
        setCartStatus("error")
        setCartError("Couldn't export design.")
        return
      }
      const canvas = fabricEditorRef.current?.getCanvas()
      const designState = JSON.stringify({
        deviceId: device.id,
        backgroundColor,
        caseTypeId: caseType.id,
        caseColor,
        canvasJSON: canvas ? JSON.stringify(canvas.toJSON()) : null,
      })
      const result = await addCustomCaseToCart({
        countryCode,
        designImage,
        deviceName: `${device.brand} ${device.name} - ${caseType.name}`,
        canvasJSON: designState,
      })
      if (result.success) {
        setCartStatus("success")
        setTimeout(() => { setCartStatus("idle"); setPreview(null) }, 1800)
      } else {
        setCartStatus("error")
        setCartError(result.error || "Failed to add to cart")
      }
    } catch {
      setCartStatus("error")
      setCartError("Something went wrong.")
    }
  }, [countryCode, device, backgroundColor, caseType, caseColor])

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#f7f7f8] pb-24">
      {/* ─── TOP BAR ─── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-xl bg-white/95">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back + Product name */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <ChevronLeft size={18} />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-[15px] font-bold text-gray-900 leading-tight">Photo Custom Case</h1>
                <p className="text-[11px] text-gray-400">{device.brand} {device.name}</p>
              </div>
            </div>

            {/* Center: Device selector dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDeviceDropdown((v) => !v)}
                className="flex items-center gap-2 h-9 px-4 rounded-full bg-gray-100 text-[13px] font-semibold text-gray-700 hover:bg-gray-200 transition"
              >
                <Smartphone size={14} />
                {device.name}
                <ChevronDown size={12} />
              </button>
              {deviceDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDeviceDropdown(false)} />
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 w-[320px] max-h-[400px] overflow-y-auto">
                    {Array.from(new Set(DEVICE_TEMPLATES.map((d) => d.brand))).map((brand) => (
                      <div key={brand} className="mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">{brand}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {DEVICE_TEMPLATES.filter((d) => d.brand === brand).map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleDeviceChange(d)}
                              className={`text-left px-3 py-2 rounded-xl text-[12px] font-medium transition ${
                                d.id === device.id
                                  ? "bg-black text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {d.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowLive3D((v) => {
                    if (!v) {
                      const tex = fabricEditorRef.current?.exportToDataURL(1)
                      if (tex) setLiveTexture(tex)
                    }
                    return !v
                  })
                }}
                className={`hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] font-semibold transition ${
                  showLive3D ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Eye size={13} />
                3D
              </button>
              <button
                type="button"
                onClick={handleGeneratePreview}
                className="h-9 px-5 rounded-full bg-black text-white text-[13px] font-bold hover:bg-gray-800 transition flex items-center gap-2"
              >
                <Sparkles size={14} />
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT: Two-panel layout ─── */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── LEFT: Fabric Canvas Editor ─── */}
          <div className="flex-1 flex flex-col items-center">
            <div className={`flex gap-6 items-start w-full justify-center ${showLive3D ? "flex-col xl:flex-row" : ""}`}>
              {/* Real-time editable case canvas */}
              <div className="w-full max-w-[420px]">
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center justify-center">
                  <FabricCaseEditor
                    ref={fabricEditorRef}
                    device={device}
                    backgroundColor={backgroundColor}
                    caseColor={caseColor}
                    caseMaterial={caseMaterial}
                    activeTool={activeTool}
                    brushColor={brushColor}
                    brushWidth={brushWidth}
                    fillColor={fillColor}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    textColor={textColor}
                    textBold={textBold}
                    textItalic={textItalic}
                    activeShape={activeShape}
                    onSelectionChange={setHasSelection}
                    onCanvasChange={handleCanvasChange}
                    onHistoryChange={handleHistoryChange}
                  />
                </div>
                {/* Hint bar */}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-[11px] text-gray-400">
                    {activeTool === "text" ? "Double-click to add text" :
                     activeTool === "draw" ? "Draw freely on the case" :
                     activeTool === "shape" ? "Double-click to place shape" :
                     activeTool === "sticker" ? "Pick a sticker from the panel" :
                     activeTool === "eraser" ? "Draw to erase" :
                     "Select & transform objects"}
                  </span>
                </div>
              </div>

              {/* Live 3D mini-viewer */}
              {showLive3D && (
                <div className="w-full xl:w-[320px] flex-shrink-0">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Live 3D</span>
                      <button
                        type="button"
                        onClick={() => {
                          const tex = fabricEditorRef.current?.exportToDataURL(1)
                          if (tex) setLiveTexture(tex)
                        }}
                        className="text-[10px] text-black font-semibold hover:underline flex items-center gap-1"
                      >
                        <RotateCcw size={10} /> Refresh
                      </button>
                    </div>
                    <CaseViewer3D
                      device={device}
                      textureUrl={liveTexture}
                      caseMaterial={caseMaterial}
                      caseColor={caseColor}
                      envPreset={envPreset}
                      compact
                      performanceMode={performanceMode}
                      showGuides={false}
                      style={{ height: 300 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Customization Panel ─── */}
          <div className="w-full lg:w-[400px] xl:w-[420px] flex-shrink-0">
            <div className="lg:sticky lg:top-[82px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100 bg-gray-50/50 px-1 pt-1">
                {SIDEBAR_TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold uppercase tracking-wider transition-all relative ${
                        isActive
                          ? "text-black bg-white rounded-t-xl shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="p-5 space-y-5">
                {/* ── CASE TYPE TAB ── */}
                {activeTab === "case" && (
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-gray-900">Choose Your Case</h3>
                    <div className="space-y-2">
                      {CASE_TYPES.map((ct) => {
                        const active = caseType.id === ct.id
                        return (
                          <button
                            key={ct.id}
                            type="button"
                            onClick={() => setCaseType(ct)}
                            className={`relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                              active
                                ? "border-black bg-gray-50 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[14px] font-bold ${active ? "text-black" : "text-gray-800"}`}>
                                    {ct.name}
                                  </span>
                                  {ct.badge && (
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                                      ct.badge === "NEW"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-amber-100 text-amber-700"
                                    }`}>
                                      {ct.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5">{ct.description}</p>
                              </div>
                              <span className="text-[15px] font-black text-gray-900">${ct.price}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {ct.features.map((f, i) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                  {f}
                                </span>
                              ))}
                            </div>
                            {active && (
                              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-black flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── DESIGN TOOLS TAB ── */}
                {activeTab === "design" && (
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-gray-900">Design Tools</h3>
                    <EditorToolbar
                      activeTool={activeTool}
                      onToolChange={setActiveTool}
                      brushColor={brushColor}
                      onBrushColorChange={setBrushColor}
                      brushWidth={brushWidth}
                      onBrushWidthChange={setBrushWidth}
                      fillColor={fillColor}
                      onFillColorChange={setFillColor}
                      fontSize={fontSize}
                      onFontSizeChange={setFontSize}
                      fontFamily={fontFamily}
                      onFontFamilyChange={setFontFamily}
                      textColor={textColor}
                      onTextColorChange={setTextColor}
                      textBold={textBold}
                      onTextBoldChange={setTextBold}
                      textItalic={textItalic}
                      onTextItalicChange={setTextItalic}
                      activeShape={activeShape}
                      onShapeChange={setActiveShape}
                      onAddSticker={(emoji) => fabricEditorRef.current?.addSticker(emoji)}
                      onAddImage={() => fabricEditorRef.current?.triggerImageUpload()}
                      onDeleteSelected={() => fabricEditorRef.current?.deleteSelected()}
                      onDuplicateSelected={() => fabricEditorRef.current?.duplicateSelected()}
                      onBringForward={() => fabricEditorRef.current?.bringForward()}
                      onSendBackward={() => fabricEditorRef.current?.sendBackward()}
                      onUndo={() => fabricEditorRef.current?.undo()}
                      onRedo={() => fabricEditorRef.current?.redo()}
                      onClearAll={() => fabricEditorRef.current?.clearAll()}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      hasSelection={hasSelection}
                    />
                  </div>
                )}

                {/* ── COLOR TAB ── */}
                {activeTab === "color" && (
                  <div className="space-y-4">
                    <h3 className="text-[13px] font-bold text-gray-900">Background Color</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {BG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setBackgroundColor(color)}
                          className={`aspect-square rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            backgroundColor === color
                              ? "border-black scale-105 shadow-md"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {backgroundColor === color && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Check size={16} className={`${color === "#000000" || color === "#1A1A2E" ? "text-white" : "text-black"}`} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Case Edge Color (for 3D) */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Case Edge Color</h4>
                      <div className="flex gap-2">
                        {["#c0c0c0", "#1a1a1a", "#f5e6d3", "#e8d5e0", "#d4e5f7", "#d5e8d4", "#f5d5d5", "#e8e4d0"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCaseColor(c)}
                            className={`h-8 w-8 rounded-full border-2 transition-all ${
                              caseColor === c ? "border-black scale-110" : "border-gray-200 hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STICKY BOTTOM BAR ─── */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            <div className="hidden sm:block">
              <p className="text-[13px] font-bold text-gray-900">{caseType.name}</p>
              <p className="text-[11px] text-gray-500">{device.brand} {device.name}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="hidden sm:flex items-center gap-1.5 mr-2">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-[11px] text-gray-500 ml-1">4.8 (2.4k)</span>
              </div>
              <span className="text-[22px] font-black text-gray-900">${caseType.price}</span>
              <button
                type="button"
                disabled={cartStatus === "loading" || cartStatus === "success"}
                onClick={handleAddToCart}
                className={`flex-1 sm:flex-none h-12 px-6 rounded-2xl text-white text-[14px] font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  cartStatus === "success"
                    ? "bg-green-600 shadow-green-600/25"
                    : cartStatus === "loading"
                    ? "bg-green-600/80 shadow-green-600/20"
                    : cartStatus === "error"
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/25"
                    : "bg-green-600 hover:bg-green-700 shadow-green-600/25"
                } disabled:opacity-70`}
              >
                {cartStatus === "loading" ? (
                  <><Loader2 size={16} className="animate-spin" /> Adding...</>
                ) : cartStatus === "success" ? (
                  <><Check size={16} /> Added!</>
                ) : cartStatus === "error" ? (
                  <><ShoppingCart size={16} /> Retry</>
                ) : (
                  <><ShoppingCart size={16} /> Add to Bag</>
                )}
              </button>
            </div>
          </div>
          {cartError && (
            <div className="pb-2 px-4 sm:px-0">
              <p className="text-[11px] text-red-500 text-center sm:text-right">{cartError}</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── PREVIEW MODAL ─── */}
      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-5xl w-full space-y-5 relative max-h-[calc(100vh-2rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button type="button" onClick={() => setPreview(null)} className="absolute top-4 right-4 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition z-10">
              <X size={16} />
            </button>

            <div>
              <h3 className="text-[22px] font-black text-gray-900">Preview Your Case</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">{device.brand} {device.name} &middot; {caseType.name}</p>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-fit mx-auto">
              <button type="button" onClick={() => setPreviewTab("3d")} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold transition ${previewTab === "3d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                <Box size={14} /> 3D View
              </button>
              <button type="button" onClick={() => setPreviewTab("flat")} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold transition ${previewTab === "flat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                <Smartphone size={14} /> Flat
              </button>
            </div>

            {/* Customization Controls — visible for BOTH tabs */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Material selector */}
              <div className="flex gap-1">
                {CASE_MATERIALS.map((m) => (
                  <button key={m.id} type="button" onClick={() => setCaseMaterial(m.id)} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${caseMaterial === m.id ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
              {/* Case color swatches */}
              <div className="flex gap-1.5 items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Color</span>
                {["#c0c0c0", "#1a1a1a", "#f5e6d3", "#e8d5e0", "#d4e5f7", "#d5e8d4", "#f5d5d5", "#e8e4d0"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCaseColor(c)}
                    className={`h-6 w-6 rounded-full border-2 transition-all ${
                      caseColor === c ? "border-black scale-125 shadow-md" : "border-gray-200 hover:border-gray-400 hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              {/* Environment presets (3D only) */}
              {previewTab === "3d" && (
                <div className="flex gap-1">
                  {ENV_PRESETS.map((e) => (
                    <button key={e.id} type="button" onClick={() => setEnvPreset(e.id)} className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${envPreset === e.id ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {e.label}
                    </button>
                  ))}
                </div>
              )}
              {/* Download buttons */}
              <div className="ml-auto flex gap-1.5">
                {previewTab === "3d" && (
                  <button type="button" onClick={handleDownload3D} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-[11px] font-bold text-gray-600 hover:bg-gray-200 transition">
                    <Camera size={12} /> Save 3D
                  </button>
                )}
                <button type="button" onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-[11px] font-bold text-gray-600 hover:bg-gray-200 transition">
                  <Download size={12} /> Save Flat
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {previewTab === "3d" ? (
                <CaseViewer3D
                  ref={viewer3DRef}
                  device={device}
                  textureUrl={preview}
                  caseMaterial={caseMaterial}
                  caseColor={caseColor}
                  envPreset={envPreset}
                  performanceMode={performanceMode}
                  showGuides={false}
                  style={{ height: "min(500px, 58vh)" }}
                />
              ) : (
                /* Flat preview — just show the exported design */
                <div className="flex items-center justify-center p-6 sm:p-10 min-h-[420px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Case design preview"
                    className="max-h-[400px] rounded-2xl shadow-lg"
                    draggable={false}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => setPreview(null)} className="flex-1 h-12 rounded-2xl border-2 border-gray-200 text-gray-600 text-[14px] font-bold hover:border-gray-400 transition flex items-center justify-center gap-2">
                <RotateCcw size={15} /> Edit Design
              </button>
              <button
                type="button"
                disabled={cartStatus === "loading" || cartStatus === "success"}
                onClick={handleAddToCart}
                className={`flex-[2] h-12 rounded-2xl text-[14px] font-bold transition flex items-center justify-center gap-2 ${
                  cartStatus === "success"
                    ? "bg-green-600 text-white"
                    : cartStatus === "error"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/25"
                } disabled:opacity-70`}
              >
                {cartStatus === "loading" ? (
                  <><Loader2 size={16} className="animate-spin" /> Adding...</>
                ) : cartStatus === "success" ? (
                  <><Check size={16} /> Added!</>
                ) : (
                  <><ShoppingCart size={16} /> Add to Bag &mdash; ${caseType.price}</>
                )}
              </button>
            </div>
            {cartError && <p className="text-[12px] text-red-500 text-center">{cartError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
