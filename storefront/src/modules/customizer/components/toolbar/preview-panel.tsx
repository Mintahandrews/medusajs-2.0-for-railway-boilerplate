"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { useCustomizer } from "../../context"
import { Smartphone, RotateCcw, Download, X, Sparkles, Monitor } from "lucide-react"
import { generateAiPreview } from "@lib/data/ai-preview"

/**
 * Preview Panel — Two modes:
 *
 *  1. **AI (Nano Banana / Gemini)** — Sends the design to Google Gemini 2.5
 *     Flash Image via our backend proxy. The AI reproduces the exact design
 *     onto a realistic phone case mockup. Requires GEMINI_API_KEY.
 *
 *  2. **Local** — Client-side Canvas 2D perspective mockup (free, instant).
 *     Used as fallback when AI is unavailable or for quick previews.
 */

type PreviewMode = "ai" | "local"

/* ---- Scene options for AI mode (IDs match backend SCENE_PROMPTS keys) ---- */
const AI_SCENES = [
  { label: "Lifestyle", scene: "lifestyle" },
  { label: "Desk", scene: "desk" },
  { label: "Nature", scene: "nature" },
  { label: "Studio", scene: "studio" },
  { label: "Flat", scene: "flat" },
  { label: "Transparent", scene: "transparent" },
]

/* ---- Angle & BG for local mode ---- */
const ANGLES = [
  { label: "Front", id: "front", rotY: 0, rotX: 0 },
  { label: "Left", id: "left", rotY: -18, rotX: 5 },
  { label: "Right", id: "right", rotY: 18, rotX: 5 },
  { label: "Top", id: "top", rotY: 0, rotX: 25 },
] as const

const BG_OPTIONS = [
  { label: "Studio", gradient: ["#f0f0f0", "#d4d4d4"] },
  { label: "Dark", gradient: ["#1a1a2e", "#16213e"] },
  { label: "Warm", gradient: ["#fef3c7", "#fcd34d"] },
  { label: "Cool", gradient: ["#dbeafe", "#93c5fd"] },
]

/**
 * Chroma-key green screen removal.
 * Loads the image into an off-screen canvas, walks every pixel,
 * and sets green-ish pixels to transparent. Returns a PNG data URL.
 */
async function removeGreenScreen(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const cv = document.createElement("canvas")
      cv.width = img.width
      cv.height = img.height
      const ctx = cv.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, cv.width, cv.height)
      const d = imageData.data

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2]
        // Detect green-screen pixels:
        // Green channel dominant, red & blue are low relative to green
        if (g > 80 && g > r * 1.4 && g > b * 1.4) {
          // Compute how "green" this pixel is (0 = not green, 1 = pure green)
          const greenness = Math.min(1, Math.max(0,
            (g - Math.max(r, b)) / g
          ))
          // Soft edge: partially transparent for semi-green pixels
          if (greenness > 0.25) {
            const alpha = Math.round(255 * (1 - greenness))
            d[i + 3] = Math.min(d[i + 3], alpha)
            // Remove green cast from semi-transparent edge pixels
            if (alpha > 0 && alpha < 255) {
              d[i] = Math.min(255, Math.round(r * (255 / Math.max(1, alpha))))
              d[i + 2] = Math.min(255, Math.round(b * (255 / Math.max(1, alpha))))
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(cv.toDataURL("image/png"))
    }
    img.onerror = () => resolve(dataUrl) // fallback: return original
    img.src = dataUrl
  })
}

export default function PreviewPanel() {
  const { exportPreview, deviceConfig, state } = useCustomizer()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [mode, setMode] = useState<PreviewMode>("ai")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null)

  // AI mode state
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null)
  const [sceneIdx, setSceneIdx] = useState(0)

  // Local mode state
  const [designUrl, setDesignUrl] = useState<string | null>(null)
  const [angleIdx, setAngleIdx] = useState(0)
  const [bgIdx, setBgIdx] = useState(0)

  /* ---- AI generation ---- */
  const generateAi = useCallback(async () => {
    setGenerating(true)
    setError("")
    setAiImageUrl(null)
    try {
      const preview = exportPreview()
      if (!preview) throw new Error("Could not export design")

      const sceneId = AI_SCENES[sceneIdx].scene

      const result = await generateAiPreview(preview, {
        scene: sceneId,
        caseType: state.caseType,
        deviceModel: deviceConfig.name,
        deviceHandle: deviceConfig.handle,
      })

      // For transparent scene: remove the green chroma-key background
      if (sceneId === "transparent") {
        const cleaned = await removeGreenScreen(result.imageUrl)
        setAiImageUrl(cleaned)
      } else {
        setAiImageUrl(result.imageUrl)
      }
    } catch (err: any) {
      console.error("[Preview] AI generation failed:", err)
      setError(err.message || "AI preview unavailable. Try Local mode.")
    } finally {
      setGenerating(false)
    }
  }, [exportPreview, sceneIdx, state.caseType, deviceConfig.name, deviceConfig.handle])

  /* ---- Local generation ---- */
  const generateLocal = useCallback(() => {
    setGenerating(true)
    setError("")
    requestAnimationFrame(() => {
      const url = exportPreview()
      setDesignUrl(url)
      setGenerating(false)
    })
  }, [exportPreview])

  // Re-render local mockup when angle/bg/design changes
  useEffect(() => {
    if (mode !== "local" || !designUrl || !canvasRef.current) return

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
      const bg = BG_OPTIONS[bgIdx]
      const grad = ctx.createLinearGradient(0, 0, 0, mockupH)
      grad.addColorStop(0, bg.gradient[0])
      grad.addColorStop(1, bg.gradient[1])
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, mockupW, mockupH)

      const phoneW = 240
      const phoneH = phoneW * (deviceConfig.canvasHeight / deviceConfig.canvasWidth)
      const phoneX = (mockupW - phoneW) / 2
      const phoneY = (mockupH - phoneH) / 2
      const r = deviceConfig.cornerRadius * (phoneW / deviceConfig.canvasWidth)
      const angle = ANGLES[angleIdx]

      ctx.save()
      ctx.translate(mockupW / 2, mockupH / 2)
      const skewX = Math.tan((angle.rotY * Math.PI) / 180) * 0.3
      const scaleX = Math.cos((angle.rotY * Math.PI) / 180)
      const skewY = Math.tan((angle.rotX * Math.PI) / 180) * 0.2
      const scaleY = Math.cos((angle.rotX * Math.PI) / 180)
      ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0)
      ctx.translate(-mockupW / 2, -mockupH / 2)

      // Case-type-aware rim (matches fabric-canvas 3D rim)
      const caseType = state.caseType
      const bgColor = state.backgroundColor || "#ffffff"
      const bw = caseType === "tough" ? 6 : caseType === "slim" ? 2 : 4
      const isGlossy = caseType === "clear"

      // Derive rim color from background (same logic as fabric-canvas)
      let rimColor = "#1a1a1a"
      if (!isGlossy) {
        const hex = bgColor.replace("#", "")
        const rr = parseInt(hex.slice(0, 2), 16), gg = parseInt(hex.slice(2, 4), 16), bb = parseInt(hex.slice(4, 6), 16)
        const lum = 0.299 * rr + 0.587 * gg + 0.114 * bb
        if (lum <= 200) {
          rimColor = "#" + [rr, gg, bb].map(c => Math.max(0, Math.round(c * 0.55)).toString(16).padStart(2, "0")).join("")
        }
      } else {
        rimColor = "#c8c8c8"
      }

      // Shadow
      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.25)"
      ctx.shadowBlur = 40
      ctx.shadowOffsetX = angle.rotY * 1.5
      ctx.shadowOffsetY = 15
      drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, r)
      ctx.fillStyle = "#000"
      ctx.fill()
      ctx.restore()

      // Phone rim border with gradient
      ctx.save()
      drawRoundedRect(ctx, phoneX - bw, phoneY - bw, phoneW + bw * 2, phoneH + bw * 2, r + bw)
      const rimGrad = ctx.createLinearGradient(phoneX - bw, phoneY - bw, phoneX + phoneW + bw, phoneY + phoneH + bw)
      if (isGlossy) {
        rimGrad.addColorStop(0, "rgba(255,255,255,0.35)")
        rimGrad.addColorStop(0.2, rimColor)
        rimGrad.addColorStop(0.8, rimColor)
        rimGrad.addColorStop(1, "rgba(0,0,0,0.12)")
      } else {
        const hex = rimColor.replace("#", "")
        const rr = parseInt(hex.slice(0, 2), 16), gg = parseInt(hex.slice(2, 4), 16), bb = parseInt(hex.slice(4, 6), 16)
        const hl = "#" + [rr, gg, bb].map(c => Math.min(255, Math.round(c + (255 - c) * 0.25)).toString(16).padStart(2, "0")).join("")
        const sh = "#" + [rr, gg, bb].map(c => Math.max(0, Math.round(c * 0.5)).toString(16).padStart(2, "0")).join("")
        rimGrad.addColorStop(0, hl)
        rimGrad.addColorStop(0.2, rimColor)
        rimGrad.addColorStop(0.8, rimColor)
        rimGrad.addColorStop(1, sh)
      }
      ctx.fillStyle = rimGrad
      ctx.fill()
      ctx.restore()

      // Design
      ctx.save()
      drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, r)
      ctx.clip()
      ctx.drawImage(img, phoneX, phoneY, phoneW, phoneH)
      ctx.restore()

      // Camera
      drawCameraHint(ctx, deviceConfig.handle, phoneX, phoneY, phoneW, phoneH)

      // Edge highlight
      ctx.save()
      drawRoundedRect(ctx, phoneX - bw, phoneY - bw, phoneW + bw * 2, phoneH + bw * 2, r + bw)
      ctx.strokeStyle = isGlossy ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      ctx.restore()
    }
    img.src = designUrl
  }, [mode, designUrl, angleIdx, bgIdx, deviceConfig, state])

  /* ---- Download ---- */
  const handleDownload = useCallback(() => {
    if (mode === "ai" && aiImageUrl) {
      const a = document.createElement("a")
      a.href = aiImageUrl
      a.download = `${deviceConfig.handle}-ai-mockup.png`
      a.click()
    } else if (canvasRef.current) {
      const a = document.createElement("a")
      a.href = canvasRef.current.toDataURL("image/png", 1)
      a.download = `${deviceConfig.handle}-mockup.png`
      a.click()
    }
  }, [mode, aiImageUrl, deviceConfig.handle])

  const hasPreview = mode === "ai" ? !!aiImageUrl : !!designUrl

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Smartphone size={16} className="text-emerald-600" />
        Device Preview
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
            mode === "ai" ? "bg-white shadow-sm text-emerald-700" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Sparkles size={13} />
          AI Preview
        </button>
        <button
          onClick={() => setMode("local")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
            mode === "local" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Monitor size={13} />
          Local Preview
        </button>
      </div>

      {/* AI mode controls */}
      {mode === "ai" && (
        <>
          <p className="text-xs text-gray-500">
            Generate a realistic product photo of your {deviceConfig.name} case using Nano Banana AI. Takes ~10-20 seconds.
          </p>

          {/* Scene selector */}
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">Scene</div>
            <div className="grid grid-cols-2 gap-1.5">
              {AI_SCENES.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSceneIdx(i)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    sceneIdx === i
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generateAi}
            disabled={generating}
            className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <><RotateCcw size={14} className="animate-spin" /> Generating...</>
            ) : (
              <><Sparkles size={14} /> Generate AI Preview</>
            )}
          </button>

          {/* AI result */}
          {aiImageUrl && (
            <div
              className="relative rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
              onClick={() => { setFullscreenUrl(aiImageUrl); setFullscreen(true) }}
              style={AI_SCENES[sceneIdx].scene === "transparent" ? {
                backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              } : undefined}
            >
              <img src={aiImageUrl} alt="AI Preview" className="w-full h-auto block" />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                {AI_SCENES[sceneIdx].scene === "transparent" ? "Transparent PNG" : "AI Generated"}
              </div>
            </div>
          )}
        </>
      )}

      {/* Local mode controls */}
      {mode === "local" && (
        <>
          <p className="text-xs text-gray-500">
            Instant client-side mockup of your design on a {deviceConfig.name}.
          </p>

          {/* Generate */}
          <button
            onClick={generateLocal}
            disabled={generating}
            className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <><RotateCcw size={14} className="animate-spin" /> Rendering...</>
            ) : (
              <><Monitor size={14} /> Generate Preview</>
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
                onClick={() => {
                  if (canvasRef.current) {
                    setFullscreenUrl(canvasRef.current.toDataURL("image/png", 1))
                  }
                  setFullscreen(true)
                }}
              >
                <canvas ref={canvasRef} className="w-full h-auto" style={{ display: "block" }} />
              </div>
            </>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Download */}
      {hasPreview && (
        <button
          onClick={handleDownload}
          className="w-full py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Download size={14} />
          Download Mockup
        </button>
      )}

      {/* Fullscreen modal — always uses a captured image, never the live canvas */}
      {fullscreen && fullscreenUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => { setFullscreen(false); setFullscreenUrl(null) }}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            onClick={() => { setFullscreen(false); setFullscreenUrl(null) }}
          >
            <X size={20} />
          </button>
          <img
            src={fullscreenUrl}
            alt="Preview"
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
            style={AI_SCENES[sceneIdx]?.scene === "transparent" ? {
              backgroundImage: "linear-gradient(45deg, #666 25%, transparent 25%), linear-gradient(-45deg, #666 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #666 75%), linear-gradient(-45deg, transparent 75%, #666 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            } : undefined}
          />
        </div>
      )}
    </div>
  )
}

/* ---- Canvas helpers (local mode) ---- */

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

/** Multi-ring realistic camera lens — matches CSS Lens component */
function drawLens(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Outer metal bezel
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  const bezelGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  bezelGrad.addColorStop(0, "#555")
  bezelGrad.addColorStop(0.4, "#2a2a2a")
  bezelGrad.addColorStop(1, "#3a3a3a")
  ctx.fillStyle = bezelGrad
  ctx.fill()
  ctx.strokeStyle = "rgba(70,70,70,0.5)"
  ctx.lineWidth = 0.5
  ctx.stroke()

  // Dark glass inner
  const innerR = r * 0.86
  ctx.beginPath()
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
  const glassGrad = ctx.createRadialGradient(cx - innerR * 0.15, cy - innerR * 0.15, 0, cx, cy, innerR)
  glassGrad.addColorStop(0, "#1a1a3a")
  glassGrad.addColorStop(0.55, "#0a0a18")
  glassGrad.addColorStop(1, "#151515")
  ctx.fillStyle = glassGrad
  ctx.fill()

  // Specular highlight
  ctx.beginPath()
  ctx.arc(cx - innerR * 0.2, cy - innerR * 0.2, innerR * 0.5, 0, Math.PI * 2)
  const specGrad = ctx.createRadialGradient(cx - innerR * 0.2, cy - innerR * 0.2, 0, cx - innerR * 0.2, cy - innerR * 0.2, innerR * 0.5)
  specGrad.addColorStop(0, "rgba(255,255,255,0.18)")
  specGrad.addColorStop(0.5, "rgba(255,255,255,0.04)")
  specGrad.addColorStop(1, "transparent")
  ctx.fillStyle = specGrad
  ctx.fill()
}

/** Flash LED */
function drawFlash(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grad.addColorStop(0.15, "#ffeebb")
  grad.addColorStop(0.55, "#cc9944")
  grad.addColorStop(1, "#886633")
  ctx.fillStyle = grad
  ctx.fill()
}

/** LiDAR / ToF sensor */
function drawSensor(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = "#1a1a1a"
  ctx.fill()
  ctx.strokeStyle = "rgba(80,80,80,0.4)"
  ctx.lineWidth = 0.5
  ctx.stroke()
}

/**
 * Draw camera module overlay on local preview mockup.
 * Positions match CameraOverlay in fabric-canvas/index.tsx exactly.
 */
function drawCameraHint(
  ctx: CanvasRenderingContext2D,
  handle: string,
  px: number, py: number, pw: number, ph: number,
) {
  ctx.save()
  ctx.globalAlpha = 0.88

  /* ---- iPhone 16 / 16 Plus — vertical pill ---- */
  if (/^iphone-16(-plus)?$/.test(handle)) {
    const pillW = pw * 0.196, pillH = ph * 0.203
    const pillX = px + pw * 0.112, pillY = py + ph * 0.034
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillW / 2)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = pillW * 0.76 / 2
    drawLens(ctx, pillX + pillW * 0.50, pillY + pillH * 0.30, lr)
    drawLens(ctx, pillX + pillW * 0.50, pillY + pillH * 0.70, lr)
    drawFlash(ctx, pillX + pillW * 0.84, pillY + pillH * 0.50, pillW * 0.08)
  }
  /* ---- iPhone 16 Pro / Pro Max — L-shaped triple ---- */
  else if (/^iphone-16-pro/.test(handle)) {
    const mod = pw * 0.560, modX = px + pw * 0.040, modY = py + ph * 0.020
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.25)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.33 / 2
    drawLens(ctx, modX + mod * 0.31, modY + mod * 0.31, lr)
    drawLens(ctx, modX + mod * 0.69, modY + mod * 0.31, lr)
    drawLens(ctx, modX + mod * 0.31, modY + mod * 0.69, lr)
    drawFlash(ctx, modX + mod * 0.69, modY + mod * 0.57, mod * 0.04)
    drawSensor(ctx, modX + mod * 0.69, modY + mod * 0.76, mod * 0.032)
  }
  /* ---- iPhone 11 Pro — equilateral triangle triple ---- */
  else if (/^iphone-11-pro/.test(handle)) {
    const mod = pw * 0.504, modX = px + pw * 0.050, modY = py + ph * 0.025
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.27)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.34 / 2
    drawLens(ctx, modX + mod * 0.31, modY + mod * 0.30, lr)
    drawLens(ctx, modX + mod * 0.69, modY + mod * 0.30, lr)
    drawLens(ctx, modX + mod * 0.50, modY + mod * 0.72, lr)
    drawFlash(ctx, modX + mod * 0.77, modY + mod * 0.56, mod * 0.04)
  }
  /* ---- iPhone 11 standard — diagonal dual ---- */
  else if (/^iphone-11$/.test(handle)) {
    const mod = pw * 0.330, modX = px + pw * 0.055, modY = py + ph * 0.028
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.28)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.40 / 2
    drawLens(ctx, modX + mod * 0.34, modY + mod * 0.34, lr)
    drawLens(ctx, modX + mod * 0.66, modY + mod * 0.66, lr)
    drawFlash(ctx, modX + mod * 0.70, modY + mod * 0.30, mod * 0.055)
  }
  /* ---- iPhone 12–15 Pro — L-shaped triple ---- */
  else if (/iphone-\d+-pro/.test(handle)) {
    const mod = pw * 0.510, modX = px + pw * 0.046, modY = py + ph * 0.022
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.26)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.34 / 2
    drawLens(ctx, modX + mod * 0.31, modY + mod * 0.31, lr)
    drawLens(ctx, modX + mod * 0.69, modY + mod * 0.31, lr)
    drawLens(ctx, modX + mod * 0.31, modY + mod * 0.69, lr)
    drawFlash(ctx, modX + mod * 0.68, modY + mod * 0.56, mod * 0.04)
    drawSensor(ctx, modX + mod * 0.68, modY + mod * 0.76, mod * 0.03)
  }
  /* ---- iPhone 12–15 standard — diagonal dual ---- */
  else if (/^iphone-/.test(handle)) {
    const mod = pw * 0.392, modX = px + pw * 0.049, modY = py + ph * 0.024
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.28)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.38 / 2
    drawLens(ctx, modX + mod * 0.65, modY + mod * 0.35, lr)
    drawLens(ctx, modX + mod * 0.35, modY + mod * 0.65, lr)
    drawFlash(ctx, modX + mod * 0.30, modY + mod * 0.30, mod * 0.05)
  }
  /* ---- Samsung Ultra — 4 individual graduated circles ---- */
  else if (/samsung.*ultra/.test(handle)) {
    const cx = px + pw * 0.155, startY = py + ph * 0.070, gap = ph * 0.078
    const sizes = [pw * 0.090, pw * 0.082, pw * 0.074, pw * 0.066]
    const offsets = [0, 1, 2.05, 3.15]
    offsets.forEach((off, i) => drawLens(ctx, cx, startY + gap * off, sizes[i]))
    drawFlash(ctx, cx, startY + gap * 3.15 + gap * 0.72, pw * 0.0175)
  }
  /* ---- Samsung S23/S24/S25 — 3 individual circles ---- */
  else if (/samsung/.test(handle)) {
    const lr = pw * 0.175 / 2, cx = px + pw * 0.165
    const startY = py + ph * 0.085, gap = ph * 0.090
    for (let i = 0; i < 3; i++) drawLens(ctx, cx, startY + gap * i, lr)
    drawFlash(ctx, cx, startY + gap * 2.65, pw * 0.0175)
  }
  /* ---- Pixel 8 — edge-to-edge camera visor bar ---- */
  else if (/^pixel-8/.test(handle)) {
    const barW = pw * 0.94, barH = ph * 0.112
    const barX = px + (pw - barW) / 2, barY = py + ph * 0.042
    drawRoundedRect(ctx, barX, barY, barW, barH, barH * 0.14)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = barH * 0.28, isPro = handle.includes("pro")
    drawLens(ctx, barX + barW * 0.17, barY + barH * 0.50, lr)
    drawLens(ctx, barX + barW * 0.34, barY + barH * 0.50, lr)
    if (isPro) drawLens(ctx, barX + barW * 0.51, barY + barH * 0.50, lr * 0.82)
    drawFlash(ctx, barX + barW * (isPro ? 0.68 : 0.54), barY + barH * 0.50, barH * 0.11)
    if (isPro) drawSensor(ctx, barX + barW * 0.79, barY + barH * 0.50, barH * 0.07)
  }
  /* ---- Pixel 9 — floating pill camera island ---- */
  else if (/^pixel-9/.test(handle)) {
    const barW = pw * 0.76, barH = ph * 0.102
    const barX = px + (pw - barW) / 2, barY = py + ph * 0.048
    drawRoundedRect(ctx, barX, barY, barW, barH, barH / 2)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = barH * 0.29, isPro = handle.includes("pro")
    drawLens(ctx, barX + barW * 0.20, barY + barH * 0.50, lr)
    drawLens(ctx, barX + barW * 0.40, barY + barH * 0.50, lr)
    if (isPro) drawLens(ctx, barX + barW * 0.60, barY + barH * 0.50, lr * 0.82)
    drawFlash(ctx, barX + barW * (isPro ? 0.78 : 0.63), barY + barH * 0.50, barH * 0.11)
    if (isPro) drawSensor(ctx, barX + barW * 0.88, barY + barH * 0.50, barH * 0.07)
  }
  /* ---- OnePlus 12 — centered circular triple ---- */
  else if (/^oneplus-12$/.test(handle)) {
    const mod = pw * 0.434, modX = px + (pw - mod) / 2, modY = py + ph * 0.025
    drawRoundedRect(ctx, modX, modY, mod, mod, mod / 2)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.32 / 2
    drawLens(ctx, modX + mod * 0.50, modY + mod * 0.25, lr)
    drawLens(ctx, modX + mod * 0.30, modY + mod * 0.65, lr * 0.88)
    drawLens(ctx, modX + mod * 0.70, modY + mod * 0.65, lr * 0.88)
    drawFlash(ctx, modX + mod * 0.50, modY + mod * 0.85, mod * 0.04)
  }
  /* ---- OnePlus 12R — centered circular dual ---- */
  else if (/^oneplus-12r/.test(handle)) {
    const mod = pw * 0.434, modX = px + (pw - mod) / 2, modY = py + ph * 0.025
    drawRoundedRect(ctx, modX, modY, mod, mod, mod / 2)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.38 / 2
    drawLens(ctx, modX + mod * 0.50, modY + mod * 0.35, lr)
    drawLens(ctx, modX + mod * 0.50, modY + mod * 0.70, lr * 0.82)
    drawFlash(ctx, modX + mod * 0.50, modY + mod * 0.90, mod * 0.04)
  }
  /* ---- Xiaomi 14 Pro — large square triple ---- */
  else if (/xiaomi-14-pro/.test(handle)) {
    const mod = pw * 0.490, modX = px + (pw - mod) / 2, modY = py + ph * 0.020
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.22)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.30 / 2
    drawLens(ctx, modX + mod * 0.30, modY + mod * 0.30, lr)
    drawLens(ctx, modX + mod * 0.70, modY + mod * 0.30, lr)
    drawLens(ctx, modX + mod * 0.50, modY + mod * 0.70, lr * 0.88)
    drawFlash(ctx, modX + mod * 0.70, modY + mod * 0.70, mod * 0.035)
  }
  /* ---- Xiaomi 14 — smaller square triple ---- */
  else if (/^xiaomi-14$/.test(handle)) {
    const mod = pw * 0.420, modX = px + (pw - mod) / 2, modY = py + ph * 0.022
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.24)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.32 / 2
    drawLens(ctx, modX + mod * 0.30, modY + mod * 0.30, lr)
    drawLens(ctx, modX + mod * 0.70, modY + mod * 0.30, lr)
    drawLens(ctx, modX + mod * 0.50, modY + mod * 0.70, lr * 0.88)
    drawFlash(ctx, modX + mod * 0.70, modY + mod * 0.70, mod * 0.04)
  }
  /* ---- Nothing Phone 2a series — dual camera with LED strip ---- */
  else if (/^nothing-phone-2a/.test(handle)) {
    const mod = pw * 0.380, modX = px + (pw - mod) / 2, modY = py + ph * 0.025
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.24)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.36 / 2
    drawLens(ctx, modX + mod * 0.35, modY + mod * 0.35, lr)
    drawLens(ctx, modX + mod * 0.35, modY + mod * 0.65, lr)
    // LED strip
    const ledW = mod * 0.12, ledH = mod * 0.04
    ctx.fillStyle = "#00ff88"
    ctx.fillRect(modX + mod * 0.80, modY + mod * 0.40, ledW, ledH)
  }
  /* ---- iPhone SE 3 — single centered camera ---- */
  else if (/^iphone-se-/.test(handle)) {
    const mod = pw * 0.220, modX = px + (pw - mod) / 2, modY = py + ph * 0.028
    drawRoundedRect(ctx, modX, modY, mod, mod, mod / 2)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.70 / 2
    drawLens(ctx, modX + mod * 0.50, modY + mod * 0.50, lr)
    drawFlash(ctx, modX + mod * 0.80, modY + mod * 0.50, mod * 0.09)
  }

  ctx.restore()
}
