"use client"

import { useRef, useState, useCallback } from "react"
import { DEVICE_TEMPLATES, type DeviceTemplate } from "../types"
import DesignerCanvas, { type DesignerCanvasHandle } from "./designer-canvas"
import DesignerToolbar from "./designer-toolbar"
import DeviceSelector from "./device-selector"
import { ShoppingCart, Download, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"

export default function CaseDesigner() {
  const canvasRef = useRef<DesignerCanvasHandle>(null)
  const [device, setDevice] = useState<DeviceTemplate>(DEVICE_TEMPLATES[0])
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [preview, setPreview] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  const handleBackgroundChange = useCallback((color: string) => {
    setBgColor(color)
    canvasRef.current?.setBackgroundColor(color)
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
    const dataUrl = canvasRef.current?.exportImage()
    if (!dataUrl) return
    const link = document.createElement("a")
    link.download = `letscase-${device.id}-design.png`
    link.href = dataUrl
    link.click()
  }, [device.id])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.5))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5))
  const handleZoomReset = () => setZoom(1)

  return (
    <div className="mx-auto max-w-[1440px] px-5 small:px-10 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] small:text-[36px] font-bold text-grey-90">
          Design Your Custom Case
        </h1>
        <p className="mt-2 text-[15px] text-grey-50 max-w-[600px]">
          Create a one-of-a-kind phone case. Choose your device, pick colors,
          add text or upload images, then add it to your cart.
        </p>
      </div>

      <div className="grid grid-cols-1 large:grid-cols-[280px_1fr_280px] gap-8">
        {/* Left sidebar — Device selector */}
        <div className="order-2 large:order-1">
          <div className="sticky top-[90px] rounded-2xl border border-grey-20 bg-white p-5 space-y-6">
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
          </div>

          {/* Canvas wrapper with zoom */}
          <div
            className="rounded-2xl border border-grey-20 bg-grey-5 p-6 small:p-10 overflow-auto flex items-center justify-center"
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
            Click objects on the canvas to select, drag to move, corners to resize
          </p>
        </div>

        {/* Right sidebar — Toolbar */}
        <div className="order-3">
          <div className="sticky top-[90px] rounded-2xl border border-grey-20 bg-white p-5 space-y-6">
            <DesignerToolbar
              canvasRef={canvasRef}
              backgroundColor={bgColor}
              onBackgroundChange={handleBackgroundChange}
              onExport={handleExport}
            />

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-grey-20 text-grey-60 text-[13px] font-medium hover:border-grey-40 hover:text-grey-90 transition"
            >
              <Download size={14} />
              Download Design
            </button>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-semibold text-grey-90">
              Your Custom Case Design
            </h3>
            <div className="flex justify-center bg-grey-5 rounded-xl p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Case design preview"
                className="max-h-[400px] object-contain rounded-lg"
              />
            </div>
            <p className="text-[13px] text-grey-50">
              {device.brand} {device.name} — Custom designed case
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 h-11 rounded-xl border border-grey-20 text-grey-60 text-[14px] font-semibold hover:border-grey-40 hover:text-grey-90 transition"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  // TODO: Phase 3F — integrate with Medusa cart
                  alert(
                    "Custom case added! In a future update this will integrate with your cart."
                  )
                  setPreview(null)
                }}
                className="flex-1 h-11 rounded-xl bg-brand text-white text-[14px] font-semibold hover:bg-brand-dark transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
