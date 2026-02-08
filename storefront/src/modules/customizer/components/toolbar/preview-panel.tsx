"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { useCustomizer } from "../../context"
import { Smartphone, RotateCcw, Download, X, Sparkles, Monitor } from "lucide-react"
import { generateAiPreview } from "@lib/data/ai-preview"

/**
 * Preview Panel — Two modes:
 *
 *  1. **AI (Pebblely)** — Sends the design to Pebblely's API via our backend
 *     proxy to generate a lifestyle product photo. Requires PEBBLELY_API_KEY.
 *
 *  2. **Local** — Client-side Canvas 2D perspective mockup (free, instant).
 *     Used as fallback when AI is unavailable or for quick previews.
 */

type PreviewMode = "ai" | "local"

/* ---- Scene prompts for AI mode ---- */
const AI_SCENES = [
  { label: "Lifestyle", description: "A custom phone case held in a person's hand in a bright modern lifestyle setting, product photography, soft lighting" },
  { label: "Desk", description: "A custom phone case on a clean minimal desk with a laptop and coffee cup, top-down product photography" },
  { label: "Nature", description: "A custom phone case resting on a smooth stone in a forest with soft natural light, product photography" },
  { label: "Studio", description: "A custom phone case on white studio background with dramatic lighting and subtle shadow, product photography" },
  { label: "Transparent", description: "__transparent__" },
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

export default function PreviewPanel() {
  const { exportPreview, deviceConfig } = useCustomizer()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [mode, setMode] = useState<PreviewMode>("ai")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [fullscreen, setFullscreen] = useState(false)

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

      const scene = AI_SCENES[sceneIdx]

      // Transparent mode — just show the exported design directly (no AI call)
      if (scene.description === "__transparent__") {
        setAiImageUrl(preview)
        setGenerating(false)
        return
      }

      const result = await generateAiPreview(preview, scene.description)
      setAiImageUrl(`data:image/png;base64,${result.data}`)
    } catch (err: any) {
      console.error("[Preview] AI generation failed:", err)
      setError(err.message || "AI preview unavailable. Try Local mode.")
    } finally {
      setGenerating(false)
    }
  }, [exportPreview, sceneIdx])

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

      // Phone border
      const bw = 4
      ctx.save()
      drawRoundedRect(ctx, phoneX - bw, phoneY - bw, phoneW + bw * 2, phoneH + bw * 2, r + bw)
      ctx.fillStyle = "#1a1a1a"
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
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      ctx.restore()
    }
    img.src = designUrl
  }, [mode, designUrl, angleIdx, bgIdx, deviceConfig])

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
            Generate a realistic lifestyle photo of your {deviceConfig.name} case using AI. Takes ~5 seconds.
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
              <><RotateCcw size={14} className="animate-spin" /> Generating (~5s)...</>
            ) : (
              <><Sparkles size={14} /> Generate AI Preview</>
            )}
          </button>

          {/* AI result */}
          {aiImageUrl && (
            <div
              className="relative rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
              onClick={() => setFullscreen(true)}
            >
              <img src={aiImageUrl} alt="AI Preview" className="w-full h-auto block" />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                Powered by Pebblely AI
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
                onClick={() => setFullscreen(true)}
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

      {/* Fullscreen modal */}
      {fullscreen && hasPreview && (
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
          {mode === "ai" && aiImageUrl ? (
            <img src={aiImageUrl} alt="AI Preview" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          ) : (
            <canvas ref={canvasRef} className="max-w-full max-h-full rounded-2xl shadow-2xl" style={{ display: "block" }} />
          )}
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

function drawCameraHint(
  ctx: CanvasRenderingContext2D,
  handle: string,
  px: number, py: number, pw: number, ph: number,
) {
  ctx.save()
  ctx.globalAlpha = 0.85

  if (/^iphone-16(-plus)?$/.test(handle)) {
    const pillW = pw * 0.17, pillH = ph * 0.13
    const pillX = px + pw * 0.10, pillY = py + ph * 0.025
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillW / 2)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = pillW * 0.35
    drawCircle(ctx, pillX + pillW * 0.50, pillY + pillH * 0.32, lr, "#1a1a3a")
    drawCircle(ctx, pillX + pillW * 0.50, pillY + pillH * 0.68, lr, "#1a1a3a")
  } else if (/iphone-\d+-pro/.test(handle)) {
    const mod = pw * 0.50, modX = px + pw * 0.05, modY = py + ph * 0.02
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.25)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.14
    drawCircle(ctx, modX + mod * 0.33, modY + mod * 0.33, lr, "#1a1a3a")
    drawCircle(ctx, modX + mod * 0.67, modY + mod * 0.33, lr, "#1a1a3a")
    drawCircle(ctx, modX + mod * 0.50, modY + mod * 0.67, lr, "#1a1a3a")
  } else if (/^iphone-/.test(handle)) {
    const mod = pw * 0.38, modX = px + pw * 0.05, modY = py + ph * 0.025
    drawRoundedRect(ctx, modX, modY, mod, mod, mod * 0.28)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = mod * 0.17
    drawCircle(ctx, modX + mod * 0.36, modY + mod * 0.36, lr, "#1a1a3a")
    drawCircle(ctx, modX + mod * 0.64, modY + mod * 0.64, lr, "#1a1a3a")
  } else if (/samsung.*ultra/.test(handle)) {
    const lr = pw * 0.055, cx = px + pw * 0.16, startY = py + ph * 0.04, gap = ph * 0.065
    for (let i = 0; i < 4; i++) drawCircle(ctx, cx, startY + i * gap, lr, "#1a1a3a")
  } else if (/samsung/.test(handle)) {
    const lr = pw * 0.06, cx = px + pw * 0.16, startY = py + ph * 0.05, gap = ph * 0.08
    for (let i = 0; i < 3; i++) drawCircle(ctx, cx, startY + i * gap, lr, "#1a1a3a")
  } else if (/pixel/.test(handle)) {
    const barW = pw * 0.80, barH = ph * 0.065
    const barX = px + (pw - barW) / 2, barY = py + ph * 0.06
    drawRoundedRect(ctx, barX, barY, barW, barH, barH / 2)
    ctx.fillStyle = "rgba(0,0,0,0.88)"; ctx.fill()
    const lr = barH * 0.30, pixPro = handle.includes("pro")
    drawCircle(ctx, barX + barW * 0.22, barY + barH * 0.50, lr, "#1a1a3a")
    drawCircle(ctx, barX + barW * 0.42, barY + barH * 0.50, lr, "#1a1a3a")
    if (pixPro) drawCircle(ctx, barX + barW * 0.62, barY + barH * 0.50, lr * 0.85, "#1a1a3a")
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
  ctx.strokeStyle = "rgba(80,80,80,0.5)"
  ctx.lineWidth = 1.5
  ctx.stroke()
}
