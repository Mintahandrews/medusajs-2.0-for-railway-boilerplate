"use client"

import { useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { DEVICE_TEMPLATES, type DeviceTemplate } from "../types"
import DesignerCanvas, { type DesignerCanvasHandle } from "./designer-canvas"
import DesignerToolbar from "./designer-toolbar"
import DeviceSelector from "./device-selector"
import { addCustomCaseToCart } from "@lib/data/custom-case"
import {
  ShoppingCart,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
  Smartphone,
  Box,
  Camera,
  Loader2,
  Check,
  Eye,
} from "lucide-react"
import { CASE_MATERIALS, ENV_PRESETS, type CaseMaterial, type EnvironmentPreset, type CaseViewer3DHandle } from "../case-viewer-types"

const CaseViewer3D = dynamic(() => import("./case-viewer-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[460px]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 border-2 border-grey-30 border-t-brand rounded-full animate-spin" />
        <span className="text-[12px] text-grey-40">Loading 3D viewer...</span>
      </div>
    </div>
  ),
})

export default function CaseDesigner() {
  const canvasRef = useRef<DesignerCanvasHandle>(null)
  const [device, setDevice] = useState<DeviceTemplate>(DEVICE_TEMPLATES[0])
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [preview, setPreview] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [cartStatus, setCartStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [cartError, setCartError] = useState<string | null>(null)
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "gh"

  // Preview tab state: "flat" or "3d"
  const [previewTab, setPreviewTab] = useState<"flat" | "3d">("3d")
  // 3D material, color & environment
  const [caseMaterial, setCaseMaterial] = useState<CaseMaterial>("glossy")
  const [caseColor, setCaseColor] = useState("#c0c0c0")
  const [envPreset, setEnvPreset] = useState<EnvironmentPreset>("studio")
  // Live 3D mini-preview
  const [showLive3D, setShowLive3D] = useState(false)
  const [liveTexture, setLiveTexture] = useState<string | null>(null)
  const [performanceMode, setPerformanceMode] = useState(false)
  const [showGuides, setShowGuides] = useState(false)
  // 3D viewer ref for screenshot
  const viewer3DRef = useRef<CaseViewer3DHandle>(null)

  const handleBackgroundChange = useCallback((color: string) => {
    setBgColor(color)
    canvasRef.current?.setBackgroundColor(color)
  }, [])

  const handleGradientChange = useCallback((colors: string[]) => {
    canvasRef.current?.setGradientBackground(colors)
  }, [])

  const handleDeviceChange = useCallback((d: DeviceTemplate) => {
    setDevice(d)
    setPreview(null)
  }, [])

  const handleExport = useCallback(() => {
    const dataUrl = canvasRef.current?.exportImage()
    if (dataUrl) {
      setPreview(dataUrl)
    }
  }, [])

  const handleDownload = useCallback(() => {
    const dataUrl = preview || canvasRef.current?.exportImage()
    if (!dataUrl) return
    const link = document.createElement("a")
    link.download = `letscase-${device.id}-design.png`
    link.href = dataUrl
    link.click()
  }, [device.id, preview])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.5))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5))
  const handleZoomReset = () => setZoom(1)

  const refreshLivePreview = useCallback(() => {
    if (!showLive3D) return
    const url = canvasRef.current?.exportImage({ multiplier: 1 })
    if (url) setLiveTexture(url)
  }, [showLive3D])

  const handleDownload3D = useCallback(() => {
    const url = viewer3DRef.current?.screenshot()
    if (!url) return
    const link = document.createElement("a")
    link.download = `letscase-${device.id}-3d-mockup.png`
    link.href = url
    link.click()
  }, [device.id])

  return (
    <div className="mx-auto max-w-[1440px] px-5 small:px-10 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Smartphone size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-[28px] small:text-[36px] font-bold text-grey-90 leading-tight">
              Design Your Custom Case
            </h1>
          </div>
        </div>
        <p className="mt-2 text-[15px] text-grey-50 max-w-[600px]">
          Create a one-of-a-kind phone case. Choose your device, pick colors &amp;
          gradients, add text, images, or stickers, then preview and add to cart.
        </p>
      </div>

      <div className="grid grid-cols-1 large:grid-cols-[280px_1fr_280px] gap-8">
        {/* Left sidebar — Device selector */}
        <div className="order-2 large:order-1">
          <div className="large:hidden">
            <details className="rounded-2xl border border-grey-20 bg-white">
              <summary className="cursor-pointer select-none px-5 py-4 text-[13px] font-semibold text-grey-90">
                Choose device
              </summary>
              <div className="px-5 pb-5 pt-1 space-y-6">
                <DeviceSelector selected={device} onSelect={handleDeviceChange} />
              </div>
            </details>
          </div>
          <div className="hidden large:block">
            <div className="large:sticky large:top-[90px] rounded-2xl border border-grey-20 bg-white p-5 space-y-6 large:max-h-[calc(100vh-120px)] large:overflow-y-auto">
              <DeviceSelector selected={device} onSelect={handleDeviceChange} />
            </div>
          </div>
        </div>

        {/* Center — Canvas */}
        <div className="order-1 large:order-2 flex flex-col items-center">
          {/* Zoom controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={handleZoomOut}
              className="h-8 w-8 rounded-lg border border-grey-20 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:border-grey-40 transition"
              aria-label="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[12px] font-medium text-grey-50 min-w-[48px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="h-8 w-8 rounded-lg border border-grey-20 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:border-grey-40 transition"
              aria-label="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="h-8 w-8 rounded-lg border border-grey-20 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:bg-grey-10 transition"
              aria-label="Reset zoom"
            >
              <RotateCcw size={12} />
            </button>
            <div className="hidden small:block w-px h-5 bg-grey-20 mx-1" />
            <span className="hidden small:inline-flex text-[11px] text-grey-40 font-medium px-2 py-1 rounded bg-grey-5">
              {device.brand} {device.name}
            </span>
            <div className="hidden small:block w-px h-5 bg-grey-20 mx-1" />
            <button
              type="button"
              onClick={() => {
                setShowLive3D((v) => {
                  if (!v) {
                    const url = canvasRef.current?.exportImage({ multiplier: 1 })
                    if (url) setLiveTexture(url)
                  }
                  return !v
                })
              }}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[11px] font-medium transition ${
                showLive3D
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-grey-20 text-grey-50 hover:text-grey-90 hover:border-grey-40"
              }`}
            >
              <Eye size={12} />
              3D Preview
            </button>
            <button
              type="button"
              onClick={() => setShowGuides((v) => !v)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[11px] font-medium transition ${
                showGuides
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-grey-20 text-grey-50 hover:text-grey-90 hover:border-grey-40"
              }`}
            >
              Guides
            </button>
            <button
              type="button"
              onClick={() => setPerformanceMode((v) => !v)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[11px] font-medium transition ${
                performanceMode
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-grey-20 text-grey-50 hover:text-grey-90 hover:border-grey-40"
              }`}
            >
              Performance
            </button>
          </div>

          {/* Canvas + optional live 3D preview side by side */}
          <div className={`flex gap-4 items-start ${showLive3D ? "flex-col xlarge:flex-row" : ""}`}>
            {/* Canvas wrapper with zoom */}
            <div
              className="rounded-2xl border border-grey-20 bg-gradient-to-br from-grey-5 to-white p-6 small:p-10 overflow-auto flex items-center justify-center"
              style={{ maxHeight: "80vh" }}
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease",
                }}
              >
                <DesignerCanvas
                  ref={canvasRef}
                  device={device}
                  backgroundColor={bgColor}
                />
              </div>
            </div>

            {/* Live 3D mini-preview */}
            {showLive3D && (
              <div className="w-full xlarge:w-[300px] flex-shrink-0">
                <div className="rounded-2xl border border-grey-20 bg-gradient-to-br from-grey-5 to-white overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-grey-10">
                    <span className="text-[11px] font-semibold text-grey-50 uppercase tracking-wider">Live 3D</span>
                    <button
                      type="button"
                      onClick={refreshLivePreview}
                      className="flex items-center gap-1 text-[10px] text-brand font-medium hover:underline"
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
                    showGuides={showGuides}
                    style={{ height: 280 }}
                  />
                </div>
              </div>
            )}
          </div>

          <p className="mt-3 text-[12px] text-grey-40 text-center">
            Click objects to select &bull; Drag to move &bull; Corners to resize &bull; Delete key to remove
          </p>
        </div>

        {/* Right sidebar — Toolbar */}
        <div className="order-3">
          <div className="large:hidden">
            <details className="rounded-2xl border border-grey-20 bg-white">
              <summary className="cursor-pointer select-none px-5 py-4 text-[13px] font-semibold text-grey-90">
                Tools
              </summary>
              <div className="px-5 pb-5 pt-1 space-y-5">
                <DesignerToolbar
                  canvasRef={canvasRef}
                  backgroundColor={bgColor}
                  onBackgroundChange={handleBackgroundChange}
                  onGradientChange={handleGradientChange}
                  onExport={handleExport}
                />
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-grey-20 text-grey-60 text-[13px] font-medium hover:border-grey-40 hover:text-grey-90 transition"
                >
                  <Download size={14} />
                  Download PNG
                </button>
              </div>
            </details>
          </div>
          <div className="hidden large:block">
            <div className="large:sticky large:top-[90px] rounded-2xl border border-grey-20 bg-white p-5 space-y-5 large:max-h-[calc(100vh-120px)] large:overflow-y-auto">
              <DesignerToolbar
                canvasRef={canvasRef}
                backgroundColor={bgColor}
                onBackgroundChange={handleBackgroundChange}
                onGradientChange={handleGradientChange}
                onExport={handleExport}
              />
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-grey-20 text-grey-60 text-[13px] font-medium hover:border-grey-40 hover:text-grey-90 transition"
              >
                <Download size={14} />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal — interactive 3D */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl p-4 small:p-6 max-w-3xl w-full space-y-5 relative max-h-[calc(100vh-2rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-grey-5 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:bg-grey-10 transition z-10"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-[20px] font-bold text-grey-90">
                Your Custom Case Preview
              </h3>
              <p className="text-[13px] text-grey-50 mt-1">
                {device.brand} {device.name} — Custom designed case
              </p>
            </div>

            {/* Tab switcher: Flat / 3D */}
            <div className="flex items-center gap-1 p-1 bg-grey-5 rounded-xl w-fit max-w-full mx-auto">
              <button
                type="button"
                onClick={() => setPreviewTab("3d")}
                className={`flex items-center gap-1.5 px-3 small:px-4 py-2 rounded-lg text-[12px] small:text-[13px] font-medium transition ${
                  previewTab === "3d"
                    ? "bg-white text-grey-90 shadow-sm"
                    : "text-grey-50 hover:text-grey-70"
                }`}
              >
                <Box size={14} />
                3D View
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("flat")}
                className={`flex items-center gap-1.5 px-3 small:px-4 py-2 rounded-lg text-[12px] small:text-[13px] font-medium transition ${
                  previewTab === "flat"
                    ? "bg-white text-grey-90 shadow-sm"
                    : "text-grey-50 hover:text-grey-70"
                }`}
              >
                <Smartphone size={14} />
                Flat View
              </button>
            </div>

            {/* Material & color picker (visible in 3D tab) */}
            {previewTab === "3d" && (
              <div className="flex flex-col small:flex-row small:flex-wrap items-start small:items-center gap-4">
                {/* Material picker */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Finish</span>
                  <div className="flex flex-wrap gap-1">
                    {CASE_MATERIALS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setCaseMaterial(m.id)}
                        title={m.desc}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition border ${
                          caseMaterial === m.id
                            ? "border-brand bg-brand/5 text-brand"
                            : "border-grey-20 text-grey-50 hover:border-grey-40 hover:text-grey-70"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Case edge color */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Edge</span>
                  <div className="flex flex-wrap gap-1">
                    {["#c0c0c0", "#1a1a1a", "#f5e6d3", "#e8d5e0", "#d4e5f7", "#d5e8d4"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCaseColor(c)}
                        className={`h-7 w-7 rounded-full border-2 transition ${
                          caseColor === c ? "border-brand scale-110" : "border-grey-20 hover:border-grey-40"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                {/* Environment preset */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Scene</span>
                  <div className="flex flex-wrap gap-1">
                    {ENV_PRESETS.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setEnvPreset(e.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                          envPreset === e.id
                            ? "border-brand bg-brand/5 text-brand"
                            : "border-grey-20 text-grey-50 hover:border-grey-40"
                        }`}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 3D Screenshot */}
                <button
                  type="button"
                  onClick={handleDownload3D}
                  className="w-full small:w-auto small:ml-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-grey-20 text-[12px] font-medium text-grey-50 hover:border-grey-40 hover:text-grey-70 transition"
                >
                  <Camera size={12} />
                  Save 3D Mockup
                </button>
              </div>
            )}

            {/* Preview content */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#f0f1f3] to-[#dcdee2]">
              {previewTab === "3d" ? (
                /* === Three.js 3D interactive viewer === */
                <CaseViewer3D
                  ref={viewer3DRef}
                  device={device}
                  textureUrl={preview}
                  caseMaterial={caseMaterial}
                  caseColor={caseColor}
                  envPreset={envPreset}
                  performanceMode={performanceMode}
                  showGuides={showGuides}
                  style={{ height: "min(460px, 60vh)" }}
                />
              ) : (
                /* === Flat case back view === */
                <div className="flex items-center justify-center p-6 small:p-10 min-h-[60vh] small:min-h-[460px]">
                  <div className="w-full max-w-[420px]" style={{ filter: "drop-shadow(0 12px 35px rgba(0,0,0,0.22))" }}>
                    <svg
                      className="w-full h-auto"
                      viewBox={`0 0 ${device.width} ${device.height}`}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <clipPath id={`preview-body-${device.id}`}>
                          <rect
                            x={0}
                            y={0}
                            width={device.width}
                            height={device.height}
                            rx={device.borderRadius}
                            ry={device.borderRadius}
                          />
                        </clipPath>
                      </defs>

                      <g clipPath={`url(#preview-body-${device.id})`}>
                        <image
                          href={preview}
                          x={0}
                          y={0}
                          width={device.width}
                          height={device.height}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </g>

                      <rect
                        x={device.inset.left}
                        y={device.inset.top}
                        width={device.width - device.inset.left - device.inset.right}
                        height={device.height - device.inset.top - device.inset.bottom}
                        rx={Math.max(device.borderRadius - Math.max(device.inset.left, device.inset.top), 4)}
                        ry={Math.max(device.borderRadius - Math.max(device.inset.left, device.inset.top), 4)}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="10 7"
                        opacity={showGuides ? 0.6 : 0}
                      />

                      {device.cameraCutout && device.cameraStyle !== "individual" && (
                        <rect
                          x={device.cameraCutout.x}
                          y={device.cameraCutout.y}
                          width={device.cameraCutout.width}
                          height={device.cameraCutout.height}
                          rx={device.cameraCutout.radius}
                          ry={device.cameraCutout.radius}
                          fill="none"
                          stroke="#888"
                          strokeWidth={2}
                        />
                      )}

                      {device.cameraLenses?.map((lens, i) => (
                        <g key={`preview-lens-${i}`}>
                          <circle
                            cx={lens.cx}
                            cy={lens.cy}
                            r={lens.r + 2}
                            fill={device.cameraStyle === "individual" ? "#1a1a1e" : "none"}
                            stroke={device.cameraStyle === "individual" ? "#888" : "rgba(40,40,45,0.7)"}
                            strokeWidth={device.cameraStyle === "individual" ? 2 : 1}
                          />
                          <circle
                            cx={lens.cx}
                            cy={lens.cy}
                            r={lens.r}
                            fill={device.cameraStyle === "individual" ? "#111114" : "#0a0a0e"}
                            stroke="rgba(100,100,110,0.5)"
                            strokeWidth={0.5}
                          />
                          <circle
                            cx={lens.cx - lens.r * 0.25}
                            cy={lens.cy - lens.r * 0.25}
                            r={lens.r * 0.18}
                            fill="rgba(255,255,255,0.08)"
                          />
                        </g>
                      ))}

                      <rect
                        x={0}
                        y={0}
                        width={device.width}
                        height={device.height}
                        rx={device.borderRadius}
                        ry={device.borderRadius}
                        fill="none"
                        stroke="#b8b8b8"
                        strokeWidth={6}
                      />

                      <rect
                        x={3}
                        y={3}
                        width={device.width - 6}
                        height={device.height - 6}
                        rx={Math.max(device.borderRadius - 2, 0)}
                        ry={Math.max(device.borderRadius - 2, 0)}
                        fill="none"
                        stroke="rgba(255,255,255,0.28)"
                        strokeWidth={1}
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-grey-40 text-center">
              {previewTab === "3d" ? "Drag to rotate \u2022 Scroll to zoom \u2022 Auto-rotates" : "Flat preview of your case back design"}
            </p>

            <div className="flex flex-col small:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-11 rounded-xl border border-grey-20 text-grey-60 text-[14px] font-semibold hover:border-grey-40 hover:text-grey-90 transition flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PNG
              </button>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 h-11 rounded-xl border border-grey-20 text-grey-60 text-[14px] font-semibold hover:border-grey-40 hover:text-grey-90 transition"
              >
                Continue Editing
              </button>
              <button
                type="button"
                disabled={cartStatus === "loading" || cartStatus === "success"}
                onClick={async () => {
                  if (!preview) {
                    setCartStatus("error")
                    setCartError("Please generate a preview first.")
                    return
                  }
                  setCartStatus("loading")
                  setCartError(null)
                  try {
                    const canvasJSON = canvasRef.current?.exportJSON()
                    if (!canvasJSON) {
                      setCartStatus("error")
                      setCartError("Couldn't read your design. Please try again.")
                      return
                    }

                    const designImageForCart =
                      canvasRef.current?.exportImage({ multiplier: 1 }) || preview
                    if (!designImageForCart) {
                      setCartStatus("error")
                      setCartError("Couldn't export your design. Please try again.")
                      return
                    }

                    const result = await addCustomCaseToCart({
                      countryCode,
                      designImage: designImageForCart,
                      deviceName: `${device.brand} ${device.name}`,
                      canvasJSON,
                    })
                    if (result.success) {
                      setCartStatus("success")
                      setTimeout(() => {
                        setPreview(null)
                        setCartStatus("idle")
                      }, 1500)
                    } else {
                      setCartStatus("error")
                      setCartError(result.error || "Failed to add to cart")
                    }
                  } catch {
                    setCartStatus("error")
                    setCartError("Something went wrong. Please try again.")
                  }
                }}
                className={`flex-1 h-11 rounded-xl text-[14px] font-semibold transition flex items-center justify-center gap-2 ${
                  cartStatus === "success"
                    ? "bg-green-600 text-white"
                    : cartStatus === "error"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-brand text-white hover:bg-brand-dark"
                } disabled:opacity-70`}
              >
                {cartStatus === "loading" ? (
                  <><Loader2 size={16} className="animate-spin" /> Adding...</>
                ) : cartStatus === "success" ? (
                  <><Check size={16} /> Added!</>
                ) : (
                  <><ShoppingCart size={16} /> Add to Cart</>
                )}
              </button>
              {cartError && (
                <p className="text-[12px] text-red-500 mt-1 text-center col-span-full">
                  {cartError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
