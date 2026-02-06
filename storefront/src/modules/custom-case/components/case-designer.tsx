"use client"

import { useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
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
  Move3D,
  RotateCw,
  Loader2,
  Check,
} from "lucide-react"

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

  // 3D rotation state for interactive preview
  const [rotX, setRotX] = useState(4)
  const [rotY, setRotY] = useState(-18)
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

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
          <div className="sticky top-[90px] rounded-2xl border border-grey-20 bg-white p-5 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <DeviceSelector selected={device} onSelect={handleDeviceChange} />
          </div>
        </div>

        {/* Center — Canvas */}
        <div className="order-1 large:order-2 flex flex-col items-center">
          {/* Zoom controls */}
          <div className="flex items-center gap-2 mb-4">
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
              className="h-8 w-8 rounded-lg border border-grey-20 flex items-center justify-center text-grey-50 hover:text-grey-90 hover:border-grey-40 transition"
              aria-label="Reset zoom"
            >
              <RotateCcw size={12} />
            </button>
            <div className="w-px h-5 bg-grey-20 mx-1" />
            <span className="text-[11px] text-grey-40 font-medium px-2 py-1 rounded bg-grey-5">
              {device.brand} {device.name}
            </span>
          </div>

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

          <p className="mt-3 text-[12px] text-grey-40 text-center">
            Click objects to select &bull; Drag to move &bull; Corners to resize &bull; Delete key to remove
          </p>
        </div>

        {/* Right sidebar — Toolbar */}
        <div className="order-3">
          <div className="sticky top-[90px] rounded-2xl border border-grey-20 bg-white p-5 space-y-5 max-h-[calc(100vh-120px)] overflow-y-auto">
            <DesignerToolbar
              canvasRef={canvasRef}
              backgroundColor={bgColor}
              onBackgroundChange={handleBackgroundChange}
              onGradientChange={handleGradientChange}
              onExport={handleExport}
            />

            {/* Download button */}
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

      {/* Preview modal — interactive 3D */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-3xl w-full space-y-5 relative"
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

            {/* Side-by-side: Front + Interactive 3D */}
            <div className="flex flex-col medium:flex-row gap-6 items-stretch justify-center">
              {/* Front flat view — phone case mockup */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Case Back</span>
                <div className="flex-1 bg-gradient-to-br from-[#f0f1f3] to-[#dcdee2] rounded-2xl p-8 flex items-center justify-center min-h-[380px]">
                  <div className="relative" style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.2))" }}>
                    {/* Case shell border */}
                    <div
                      className="relative overflow-hidden"
                      style={{
                        border: "3px solid #b0b0b0",
                        borderRadius: device.borderRadius * 0.42,
                        background: "linear-gradient(160deg, rgba(255,255,255,0.1), rgba(0,0,0,0.02))",
                      }}
                    >
                      {/* Case depth — bottom edge */}
                      <div className="absolute bottom-0 left-[6px] right-[6px] h-[6px] -mb-[3px]" style={{ background: "linear-gradient(to bottom, #b5b5b5, #8a8a8a)", borderRadius: "0 0 4px 4px" }} />
                      {/* Case depth — right edge */}
                      <div className="absolute right-0 top-[16px] bottom-[16px] w-[5px] -mr-[3px]" style={{ background: "linear-gradient(to right, #c0c0c0, #999)", borderRadius: "0 3px 3px 0" }} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Case design — back"
                        className="block"
                        style={{ maxHeight: 380, borderRadius: device.borderRadius * 0.36 }}
                      />
                      {/* Surface highlight */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "linear-gradient(140deg, rgba(255,255,255,0.12) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.03) 100%)",
                          borderRadius: device.borderRadius * 0.36,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive 3D view */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">3D View</span>
                  <span className="flex items-center gap-1 text-[10px] text-grey-40 bg-grey-5 rounded-full px-2 py-0.5">
                    <Move3D size={10} /> Drag to rotate
                  </span>
                </div>
                <div
                  className="flex-1 bg-gradient-to-br from-[#f0f1f3] to-[#dcdee2] rounded-2xl p-8 flex items-center justify-center min-h-[380px] cursor-grab active:cursor-grabbing select-none"
                  style={{ perspective: 1200 }}
                  onMouseDown={(e) => { isDraggingRef.current = true; lastPosRef.current = { x: e.clientX, y: e.clientY } }}
                  onMouseMove={(e) => {
                    if (!isDraggingRef.current) return
                    setRotY((p) => Math.max(-50, Math.min(50, p + (e.clientX - lastPosRef.current.x) * 0.4)))
                    setRotX((p) => Math.max(-30, Math.min(30, p - (e.clientY - lastPosRef.current.y) * 0.4)))
                    lastPosRef.current = { x: e.clientX, y: e.clientY }
                  }}
                  onMouseUp={() => { isDraggingRef.current = false }}
                  onMouseLeave={() => { isDraggingRef.current = false }}
                  onTouchStart={(e) => { isDraggingRef.current = true; lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
                  onTouchMove={(e) => {
                    if (!isDraggingRef.current) return
                    const t = e.touches[0]
                    setRotY((p) => Math.max(-50, Math.min(50, p + (t.clientX - lastPosRef.current.x) * 0.4)))
                    setRotX((p) => Math.max(-30, Math.min(30, p - (t.clientY - lastPosRef.current.y) * 0.4)))
                    lastPosRef.current = { x: t.clientX, y: t.clientY }
                  }}
                  onTouchEnd={() => { isDraggingRef.current = false }}
                >
                  {/* 3D phone case */}
                  <div
                    className="relative pointer-events-none"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                      transition: isDraggingRef.current ? "none" : "transform 0.2s ease",
                    }}
                  >
                    {/* Case back face */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(150deg, #d0d0d0 0%, #a8a8a8 100%)",
                        borderRadius: device.borderRadius * 0.42,
                        transform: "translateZ(-8px)",
                        boxShadow: "inset 0 0 15px rgba(0,0,0,0.08)",
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                    {/* Left edge */}
                    <div
                      className="absolute top-[8px] bottom-[8px]"
                      style={{
                        left: 0, width: 8,
                        background: "linear-gradient(to left, #c5c5c5, #a0a0a0)",
                        transform: "rotateY(-90deg)",
                        transformOrigin: "left center",
                        borderRadius: "2px 0 0 2px",
                      }}
                    />
                    {/* Right edge */}
                    <div
                      className="absolute top-[8px] bottom-[8px]"
                      style={{
                        right: 0, width: 8,
                        background: "linear-gradient(to right, #c5c5c5, #a0a0a0)",
                        transform: "rotateY(90deg)",
                        transformOrigin: "right center",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                    {/* Top edge */}
                    <div
                      className="absolute left-[8px] right-[8px]"
                      style={{
                        top: 0, height: 8,
                        background: "linear-gradient(to top, #d0d0d0, #b5b5b5)",
                        transform: "rotateX(90deg)",
                        transformOrigin: "center top",
                        borderRadius: "2px 2px 0 0",
                      }}
                    />
                    {/* Bottom edge */}
                    <div
                      className="absolute left-[8px] right-[8px]"
                      style={{
                        bottom: 0, height: 8,
                        background: "linear-gradient(to bottom, #bbb, #888)",
                        transform: "rotateX(-90deg)",
                        transformOrigin: "center bottom",
                        borderRadius: "0 0 2px 2px",
                      }}
                    />
                    {/* Front face — case with design */}
                    <div
                      className="relative overflow-hidden"
                      style={{
                        border: "3px solid #aaa",
                        borderRadius: device.borderRadius * 0.42,
                        boxShadow: `${-rotY * 0.6}px ${rotX * 0.6}px 35px rgba(0,0,0,0.22)`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Case design — 3D"
                        className="block"
                        style={{ maxHeight: 380, borderRadius: device.borderRadius * 0.36 }}
                      />
                      {/* Dynamic light reflection */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${140 + rotY * 0.8}deg, rgba(255,255,255,${0.12 + Math.abs(rotY) * 0.003}) 0%, transparent 45%, transparent 55%, rgba(0,0,0,${0.04 + Math.abs(rotY) * 0.001}) 100%)`,
                          borderRadius: device.borderRadius * 0.36,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setRotX(4); setRotY(-18) }}
                  className="flex items-center gap-1.5 text-[11px] text-grey-40 hover:text-grey-70 transition"
                >
                  <RotateCw size={11} /> Reset angle
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
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
                  if (!preview) return
                  setCartStatus("loading")
                  setCartError(null)
                  try {
                    const canvasJSON = canvasRef.current?.exportJSON()
                    const result = await addCustomCaseToCart({
                      countryCode,
                      designImage: preview,
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
