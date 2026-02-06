"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import {
  DEVICE_TEMPLATES,
  GRID_LAYOUTS,
  CASE_TYPES,
  BG_COLORS,
  GRID_GAP_OPTIONS,
  type DeviceTemplate,
  type GridLayout,
  type PhotoItem,
  type CaseType,
} from "../types"
import GridCanvas from "./grid-canvas"
import PhotoPanel from "./photo-panel"
import LayoutSelector from "./layout-selector"
import { renderGridToCanvas } from "./grid-renderer"
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
  Grid3X3,
  ImageIcon,
  RotateCcw,
  Eye,
  Camera,
  Sparkles,
  Star,
  ChevronLeft,
} from "lucide-react"
import { CASE_MATERIALS, ENV_PRESETS, type CaseMaterial, type EnvironmentPreset, type CaseViewer3DHandle } from "../case-viewer-types"

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

type SidebarTab = "case" | "layout" | "photos" | "color"

const SIDEBAR_TABS: { id: SidebarTab; label: string; icon: typeof Shield }[] = [
  { id: "case", label: "Case", icon: Shield },
  { id: "layout", label: "Layout", icon: Grid3X3 },
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "color", label: "Color", icon: Palette },
]

export default function CaseDesigner() {
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "gh"

  // --- DESIGN STATE ---
  const [device, setDevice] = useState<DeviceTemplate>(DEVICE_TEMPLATES[0])
  const [caseType, setCaseType] = useState<CaseType>(CASE_TYPES[0])
  const [layout, setLayout] = useState<GridLayout>(GRID_LAYOUTS[0])
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [gridGap, setGridGap] = useState(0)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SidebarTab>("layout")

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

  const viewer3DRef = useRef<CaseViewer3DHandle>(null)
  const syncTimerRef = useRef<number | null>(null)
  const previewOpen = Boolean(preview)

  // --- SYNC LIVE 3D ---
  const syncPreviews = useCallback(async () => {
    if (!showLive3D && !previewOpen) return
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(async () => {
      try {
        const dataUrl = await renderGridToCanvas(device, layout, photos, backgroundColor, gridGap, performanceMode ? 1 : 2)
        if (showLive3D) setLiveTexture(dataUrl)
        if (previewOpen) setPreview(dataUrl)
      } catch (err) {
        console.error("Failed to render preview:", err)
      }
    }, 250)
  }, [device, layout, photos, backgroundColor, gridGap, performanceMode, previewOpen, showLive3D])

  useEffect(() => { syncPreviews() }, [syncPreviews])

  // --- HANDLERS ---
  const handleDeviceChange = useCallback((d: DeviceTemplate) => {
    setDevice(d)
    setDeviceDropdown(false)
    setPreview(null)
  }, [])

  const handleLayoutChange = useCallback((newLayout: GridLayout) => {
    setLayout(newLayout)
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        slotId: newLayout.slots.some((s) => s.id === p.slotId) ? p.slotId : null,
      }))
    )
  }, [])

  const handleUpload = useCallback((files: FileList) => {
    const newPhotos: PhotoItem[] = []
    const emptySlots = layout.slots.filter((s) => !photos.some((p) => p.slotId === s.id))
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const url = URL.createObjectURL(file)
      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url,
        slotId: emptySlots[i]?.id || null,
        zoom: 1,
        panX: 0,
        panY: 0,
        rotation: 0,
      })
    }
    setPhotos((prev) => [...prev, ...newPhotos])
    if (newPhotos.length > 0) setActiveTab("photos")
  }, [layout.slots, photos])

  const handleDeletePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId)
      if (photo) URL.revokeObjectURL(photo.url)
      return prev.filter((p) => p.id !== photoId)
    })
  }, [])

  const handleUpdatePhoto = useCallback((photoId: string, updates: Partial<PhotoItem>) => {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, ...updates } : p)))
  }, [])

  const handleSlotClick = useCallback(
    (slotId: string) => {
      setSelectedSlotId(slotId === selectedSlotId ? null : slotId)
    },
    [selectedSlotId]
  )

  const handleDropPhoto = useCallback((slotId: string, photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        slotId: p.id === photoId ? slotId : p.slotId === slotId ? null : p.slotId,
      }))
    )
  }, [])

  const handleRemoveFromSlot = useCallback((slotId: string) => {
    setPhotos((prev) => prev.map((p) => (p.slotId === slotId ? { ...p, slotId: null } : p)))
  }, [])

  const handleAssignToSlot = useCallback(
    (photoId: string) => {
      if (!selectedSlotId) return
      handleDropPhoto(selectedSlotId, photoId)
    },
    [selectedSlotId, handleDropPhoto]
  )

  const handleGeneratePreview = useCallback(async () => {
    try {
      const dataUrl = await renderGridToCanvas(device, layout, photos, backgroundColor, gridGap, 2)
      setPreview(dataUrl)
      if (showLive3D) setLiveTexture(dataUrl)
    } catch (err) {
      console.error("Preview generation failed:", err)
    }
  }, [device, layout, photos, backgroundColor, gridGap, showLive3D])

  const handleDownload = useCallback(() => {
    if (!preview) return
    const link = document.createElement("a")
    link.download = `custom-case-${device.id}.png`
    link.href = preview
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
      const designImage = await renderGridToCanvas(device, layout, photos, backgroundColor, gridGap, 2)
      if (!designImage) {
        setCartStatus("error")
        setCartError("Couldn't export design.")
        return
      }
      const result = await addCustomCaseToCart({
        countryCode,
        designImage,
        deviceName: `${device.brand} ${device.name}`,
        canvasJSON: null,
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
  }, [countryCode, device, layout, photos, backgroundColor, gridGap])

  const assignedCount = photos.filter((p) => p.slotId).length
  const totalSlots = layout.slots.length

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#f7f7f8] pb-24">
      {/* ─── TOP BAR ─── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-xl bg-white/95">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back + Product name */}
            <div className="flex items-center gap-3">
              <button type="button" className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
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
                    if (!v) renderGridToCanvas(device, layout, photos, backgroundColor, gridGap, 1).then(setLiveTexture)
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
          {/* ─── LEFT: Case Preview ─── */}
          <div className="flex-1 flex flex-col items-center">
            <div className={`flex gap-6 items-start w-full justify-center ${showLive3D ? "flex-col xl:flex-row" : ""}`}>
              {/* 2D Canvas Preview */}
              <div className="w-full max-w-[420px]">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <GridCanvas
                    device={device}
                    layout={layout}
                    photos={photos}
                    backgroundColor={backgroundColor}
                    gridGap={gridGap}
                    selectedSlotId={selectedSlotId}
                    onSlotClick={handleSlotClick}
                    onDropPhoto={handleDropPhoto}
                    onRemoveFromSlot={handleRemoveFromSlot}
                  />
                </div>
                {/* Status bar */}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-[11px] text-gray-400">
                    {assignedCount}/{totalSlots} photos placed
                  </span>
                  {assignedCount < totalSlots && (
                    <span className="text-[11px] text-amber-500 font-medium">
                      {totalSlots - assignedCount} slot{totalSlots - assignedCount > 1 ? "s" : ""} empty
                    </span>
                  )}
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
                        onClick={() => renderGridToCanvas(device, layout, photos, backgroundColor, gridGap, 1).then(setLiveTexture)}
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
                            className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
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

                {/* ── LAYOUT TAB ── */}
                {activeTab === "layout" && (
                  <div className="space-y-4">
                    <h3 className="text-[13px] font-bold text-gray-900">Choose Layout</h3>
                    <LayoutSelector selectedId={layout.id} onSelect={handleLayoutChange} />

                    {/* Grid Gap */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Border Width</h4>
                      <div className="flex gap-1.5">
                        {GRID_GAP_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setGridGap(opt.value)}
                            className={`flex-1 h-9 rounded-xl text-[11px] font-bold transition-all ${
                              gridGap === opt.value
                                ? "bg-black text-white shadow-sm"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PHOTOS TAB ── */}
                {activeTab === "photos" && (
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-gray-900">Your Photos</h3>
                    <PhotoPanel
                      photos={photos}
                      onUpload={handleUpload}
                      onDelete={handleDeletePhoto}
                      onUpdatePhoto={handleUpdatePhoto}
                      selectedSlotId={selectedSlotId}
                      onAssignToSlot={handleAssignToSlot}
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
              <p className="text-[11px] text-gray-500">{device.brand} {device.name} &middot; {layout.name} layout</p>
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
                onClick={handleGeneratePreview}
                className="flex-1 sm:flex-none h-12 px-6 rounded-2xl bg-green-600 text-white text-[14px] font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/25 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PREVIEW MODAL ─── */}
      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-4xl w-full space-y-5 relative max-h-[calc(100vh-2rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

            {/* 3D Controls */}
            {previewTab === "3d" && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  {CASE_MATERIALS.map((m) => (
                    <button key={m.id} type="button" onClick={() => setCaseMaterial(m.id)} className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${caseMaterial === m.id ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {ENV_PRESETS.map((e) => (
                    <button key={e.id} type="button" onClick={() => setEnvPreset(e.id)} className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${envPreset === e.id ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {e.label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={handleDownload3D} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-[11px] font-bold text-gray-600 hover:bg-gray-200 transition">
                  <Camera size={12} /> Save 3D
                </button>
              </div>
            )}

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
                  style={{ height: "min(480px, 55vh)" }}
                />
              ) : (
                <div className="flex items-center justify-center p-8 min-h-[400px]">
                  <div className="w-full max-w-[320px]" style={{ filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.25))" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="w-full h-auto rounded-[2.5rem]" />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={handleDownload} className="flex-1 h-12 rounded-2xl border-2 border-gray-200 text-gray-600 text-[14px] font-bold hover:border-gray-400 transition flex items-center justify-center gap-2">
                <Download size={16} /> Download
              </button>
              <button type="button" onClick={() => setPreview(null)} className="flex-1 h-12 rounded-2xl border-2 border-gray-200 text-gray-600 text-[14px] font-bold hover:border-gray-400 transition">
                Edit Design
              </button>
              <button
                type="button"
                disabled={cartStatus === "loading" || cartStatus === "success"}
                onClick={handleAddToCart}
                className={`flex-1 h-12 rounded-2xl text-[14px] font-bold transition flex items-center justify-center gap-2 ${
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
