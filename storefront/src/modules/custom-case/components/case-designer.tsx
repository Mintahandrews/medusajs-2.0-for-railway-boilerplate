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
              {/* Front flat view */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Front View</span>
                <div className="flex-1 bg-gradient-to-br from-grey-5 to-grey-10 rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Case design — front"
                    className="object-contain"
                    style={{
                      maxHeight: 340,
                      borderRadius: device.borderRadius * 0.6,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
              </div>

              {/* Interactive 3D view — drag to rotate */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">
                    3D View
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-grey-40 bg-grey-5 rounded-full px-2 py-0.5">
                    <Move3D size={10} />
                    Drag to rotate
                  </span>
                </div>
                <div
                  className="flex-1 bg-gradient-to-br from-grey-5 to-grey-10 rounded-2xl p-6 flex items-center justify-center min-h-[300px] cursor-grab active:cursor-grabbing select-none"
                  style={{ perspective: 900 }}
                  onMouseDown={(e) => {
                    isDraggingRef.current = true
                    lastPosRef.current = { x: e.clientX, y: e.clientY }
                  }}
                  onMouseMove={(e) => {
                    if (!isDraggingRef.current) return
                    const dx = e.clientX - lastPosRef.current.x
                    const dy = e.clientY - lastPosRef.current.y
                    setRotY((prev) => Math.max(-60, Math.min(60, prev + dx * 0.4)))
                    setRotX((prev) => Math.max(-40, Math.min(40, prev - dy * 0.4)))
                    lastPosRef.current = { x: e.clientX, y: e.clientY }
                  }}
                  onMouseUp={() => { isDraggingRef.current = false }}
                  onMouseLeave={() => { isDraggingRef.current = false }}
                  onTouchStart={(e) => {
                    const t = e.touches[0]
                    isDraggingRef.current = true
                    lastPosRef.current = { x: t.clientX, y: t.clientY }
                  }}
                  onTouchMove={(e) => {
                    if (!isDraggingRef.current) return
                    const t = e.touches[0]
                    const dx = t.clientX - lastPosRef.current.x
                    const dy = t.clientY - lastPosRef.current.y
                    setRotY((prev) => Math.max(-60, Math.min(60, prev + dx * 0.4)))
                    setRotX((prev) => Math.max(-40, Math.min(40, prev - dy * 0.4)))
                    lastPosRef.current = { x: t.clientX, y: t.clientY }
                  }}
                  onTouchEnd={() => { isDraggingRef.current = false }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Case design — 3D interactive"
                    className="object-contain pointer-events-none"
                    style={{
                      maxHeight: 340,
                      borderRadius: device.borderRadius * 0.6,
                      transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                      boxShadow: `${-rotY * 0.6}px ${rotX * 0.6}px 40px rgba(0,0,0,0.25)`,
                      transition: isDraggingRef.current ? "none" : "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                  />
                </div>
                {/* Reset rotation button */}
                <button
                  type="button"
                  onClick={() => { setRotX(4); setRotY(-18) }}
                  className="flex items-center gap-1.5 text-[11px] text-grey-40 hover:text-grey-70 transition"
                >
                  <RotateCw size={11} />
                  Reset angle
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
