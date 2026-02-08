"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { useCustomizer } from "../../context"
import { Smartphone, RotateCcw, Download, X } from "lucide-react"

/**
 * AI Device Preview Panel
 *
 * Generates a realistic 3D-perspective mockup of the user's design
 * composited onto a phone silhouette. Uses HTML Canvas 2D transforms
 * to create a convincing angled device preview.
 */

const ANGLES = [
  { label: "Front", id: "front", rotY: 0, rotX: 0 },
  { label: "Left Tilt", id: "left", rotY: -18, rotX: 5 },
  { label: "Right Tilt", id: "right", rotY: 18, rotX: 5 },
  { label: "Top Down", id: "top", rotY: 0, rotX: 25 },
] as const

const BG_OPTIONS = [
  { label: "Studio", gradient: ["#f0f0f0", "#d4d4d4"] },
  { label: "Dark", gradient: ["#1a1a2e", "#16213e"] },
  { label: "Warm", gradient: ["#fef3c7", "#fcd34d"] },
  { label: "Cool", gradient: ["#dbeafe", "#93c5fd"] },
]

export default function PreviewPanel() {
  const { exportPreview, deviceConfig } = useCustomizer()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [designUrl, setDesignUrl] = useState<string | null>(null)
  const [angleIdx, setAngleIdx] = useState(0)
  const [bgIdx, setBgIdx] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const generate = useCallback(() => {
    setGenerating(true)
    // Small delay so UI shows loading state
    requestAnimationFrame(() => {
      const url = exportPreview()
      setDesignUrl(url)
      setGenerating(false)
    })
  }, [exportPreview])

  // Render the mockup whenever design, angle, or background changes
  useEffect(() => {
    if (!designUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const mockupW = 600
    const mockupH = 800
    canvas.width = mockupW
    canvas.height = mockupH

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Background gradient
      const bg = BG_OPTIONS[bgIdx]
      const grad = ctx.createLinearGradient(0, 0, 0, mockupH)
      grad.addColorStop(0, bg.gradient[0])
      grad.addColorStop(1, bg.gradient[1])
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, mockupW, mockupH)

      // Phone dimensions on mockup
      const phoneW = 240
      const phoneH = phoneW * (deviceConfig.canvasHeight / deviceConfig.canvasWidth)
      const phoneX = (mockupW - phoneW) / 2
      const phoneY = (mockupH - phoneH) / 2
      const r = deviceConfig.cornerRadius * (phoneW / deviceConfig.canvasWidth)

      const angle = ANGLES[angleIdx]

      ctx.save()

      // Apply 3D perspective transform via 2D approximation
      ctx.translate(mockupW / 2, mockupH / 2)

      // Simulate Y-rotation with horizontal skew
      const skewX = Math.tan((angle.rotY * Math.PI) / 180) * 0.3
      const scaleX = Math.cos((angle.rotY * Math.PI) / 180)
      // Simulate X-rotation with vertical compression
      const skewY = Math.tan((angle.rotX * Math.PI) / 180) * 0.2
      const scaleY = Math.cos((angle.rotX * Math.PI) / 180)

      ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0)
      ctx.translate(-mockupW / 2, -mockupH / 2)

      // Draw phone shadow
      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.25)"
      ctx.shadowBlur = 40
      ctx.shadowOffsetX = angle.rotY * 1.5
      ctx.shadowOffsetY = 15
      drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, r)
      ctx.fillStyle = "#000"
      ctx.fill()
      ctx.restore()

      // Draw phone body (dark border)
      ctx.save()
      const borderW = 4
      drawRoundedRect(ctx, phoneX - borderW, phoneY - borderW, phoneW + borderW * 2, phoneH + borderW * 2, r + borderW)
      ctx.fillStyle = "#1a1a1a"
      ctx.fill()
      ctx.restore()

      // Clip to phone shape and draw design
      ctx.save()
      drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, r)
      ctx.clip()
      ctx.drawImage(img, phoneX, phoneY, phoneW, phoneH)
      ctx.restore()

      // Camera module overlay hint
      drawCameraHint(ctx, deviceConfig.handle, phoneX, phoneY, phoneW, phoneH)

      // Subtle phone edge highlight
      ctx.save()
      drawRoundedRect(ctx, phoneX - borderW, phoneY - borderW, phoneW + borderW * 2, phoneH + borderW * 2, r + borderW)
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      // "AI Preview" watermark
      ctx.save()
      ctx.font = "11px -apple-system, sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.5)"
      ctx.textAlign = "right"
      ctx.fillText("AI Preview — Letscase", mockupW - 16, mockupH - 16)
      ctx.restore()

      ctx.restore()
    }
    img.src = designUrl
  }, [designUrl, angleIdx, bgIdx, deviceConfig])

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return
    const a = document.createElement("a")
    a.href = canvasRef.current.toDataURL("image/png", 1)
    a.download = `${deviceConfig.handle}-mockup.png`
    a.click()
  }, [deviceConfig.handle])

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Smartphone size={16} className="text-emerald-600" />
        AI Device Preview
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Generate a realistic mockup of your design on a {deviceConfig.name}. Choose an angle and background.
      </p>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={generating}
        className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {generating ? (
          <><RotateCcw size={14} className="animate-spin" /> Generating...</>
        ) : (
          <><Smartphone size={14} /> Generate Preview</>
        )}
      </button>

      {designUrl && (
        <>
          {/* Angle selector */}
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">Angle</div>
            <div className="flex gap-1.5">
              {ANGLES.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setAngleIdx(i)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    angleIdx === i
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background selector */}
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">Background</div>
            <div className="flex gap-2">
              {BG_OPTIONS.map((bg, i) => (
                <button
                  key={bg.label}
                  onClick={() => setBgIdx(i)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    bgIdx === i ? "border-gray-900 scale-110" : "border-gray-200"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${bg.gradient[0]}, ${bg.gradient[1]})`,
                  }}
                  title={bg.label}
                />
              ))}
            </div>
          </div>

          {/* Preview canvas */}
          <div
            className="relative rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
            onClick={() => setFullscreen(true)}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ display: "block" }}
            />
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="w-full py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={14} />
            Download Mockup
          </button>
        </>
      )}

      {/* Fullscreen modal */}
      {fullscreen && designUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            onClick={() => setFullscreen(false)}
          >
            <X size={20} />
          </button>
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
            style={{ display: "block" }}
          />
        </div>
      )}
    </div>
  )
}

/* ---- Helpers ---- */

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCameraHint(
  ctx: CanvasRenderingContext2D,
  handle: string,
  px: number, py: number, pw: number, ph: number,
) {
  ctx.save()
  ctx.globalAlpha = 0.85

  const isIphone = handle.startsWith("iphone")
  const isSamsung = handle.startsWith("samsung")
  const isPixel = handle.startsWith("pixel")
  const isPro = handle.includes("pro")

  if (isIphone) {
    // Square camera module top-left
    const modSize = pw * (isPro ? 0.42 : 0.38)
    const modX = px + pw * 0.04
    const modY = py + pw * 0.04
    const modR = modSize * 0.26
    drawRoundedRect(ctx, modX, modY, modSize, modSize, modR)
    ctx.fillStyle = "rgba(0,0,0,0.85)"
    ctx.fill()
    // Lenses
    const lensR = modSize * (isPro ? 0.14 : 0.16)
    if (isPro) {
      drawCircle(ctx, modX + modSize * 0.34, modY + modSize * 0.32, lensR, "#1a1a3a")
      drawCircle(ctx, modX + modSize * 0.66, modY + modSize * 0.32, lensR, "#1a1a3a")
      drawCircle(ctx, modX + modSize * 0.50, modY + modSize * 0.68, lensR, "#1a1a3a")
    } else {
      drawCircle(ctx, modX + modSize * 0.36, modY + modSize * 0.36, lensR, "#1a1a3a")
      drawCircle(ctx, modX + modSize * 0.64, modY + modSize * 0.64, lensR, "#1a1a3a")
    }
  } else if (isSamsung) {
    // Vertical individual circles
    const ld = pw * 0.05
    const cx = px + pw * 0.27
    const startY = py + pw * 0.12
    const gap = pw * 0.13
    const count = handle.includes("ultra") ? 4 : 3
    for (let i = 0; i < count; i++) {
      drawCircle(ctx, cx, startY + i * gap, ld, "#1a1a3a")
    }
  } else if (isPixel) {
    // Horizontal bar
    const barH = pw * 0.12
    const barY = py + pw * 0.14
    drawRoundedRect(ctx, px, barY, pw, barH, barH / 2)
    ctx.fillStyle = "rgba(0,0,0,0.85)"
    ctx.fill()
    const ld = barH * 0.3
    drawCircle(ctx, px + pw * 0.30, barY + barH * 0.50, ld, "#1a1a3a")
    drawCircle(ctx, px + pw * 0.50, barY + barH * 0.50, ld, "#1a1a3a")
  }

  ctx.restore()
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, color: string
) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  // Ring highlight
  ctx.strokeStyle = "rgba(80,80,80,0.5)"
  ctx.lineWidth = 1.5
  ctx.stroke()
}
