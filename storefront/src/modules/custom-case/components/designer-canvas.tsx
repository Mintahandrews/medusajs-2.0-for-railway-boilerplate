"use client"

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { Canvas, Rect, FabricImage, Gradient } from "fabric"
import type { DeviceTemplate } from "../types"

export type DesignerCanvasHandle = {
  getCanvas: () => Canvas | null
  exportImage: () => string | null
  exportJSON: () => string | null
  loadJSON: (json: string) => void
  setBackgroundColor: (color: string) => void
  setGradientBackground: (colors: string[]) => void
  addImage: (url: string) => Promise<void>
  addText: (text: string, options?: Record<string, any>) => void
  addSticker: (emoji: string) => void
  undo: () => void
  redo: () => void
}

type Props = {
  device: DeviceTemplate
  backgroundColor: string
  onCanvasReady?: (canvas: Canvas) => void
  onObjectCount?: (count: number) => void
}

const DesignerCanvas = forwardRef<DesignerCanvasHandle, Props>(
  ({ device, backgroundColor, onCanvasReady, onObjectCount }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<Canvas | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const historyRef = useRef<string[]>([])
    const historyIndexRef = useRef(-1)
    const isRestoringRef = useRef(false)

    const saveHistory = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas || isRestoringRef.current) return
      const json = JSON.stringify(canvas.toJSON())
      const idx = historyIndexRef.current
      historyRef.current = historyRef.current.slice(0, idx + 1)
      historyRef.current.push(json)
      if (historyRef.current.length > 30) historyRef.current.shift()
      historyIndexRef.current = historyRef.current.length - 1
    }, [])

    const notifyCount = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      onObjectCount?.(canvas.getObjects().length)
    }, [onObjectCount])

    // Initialize canvas
    useEffect(() => {
      if (!canvasElRef.current) return

      const canvas = new Canvas(canvasElRef.current, {
        width: device.width,
        height: device.height,
        backgroundColor,
        selection: true,
        preserveObjectStacking: true,
      })

      fabricRef.current = canvas
      onCanvasReady?.(canvas)

      // Save initial state
      historyRef.current = [JSON.stringify(canvas.toJSON())]
      historyIndexRef.current = 0

      // Track changes for undo/redo
      const onChange = () => { saveHistory(); notifyCount() }
      canvas.on("object:added", onChange)
      canvas.on("object:removed", onChange)
      canvas.on("object:modified", onChange)

      return () => {
        canvas.off("object:added", onChange)
        canvas.off("object:removed", onChange)
        canvas.off("object:modified", onChange)
        canvas.dispose()
        fabricRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device.id])

    // Update background color
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.backgroundColor = backgroundColor
      canvas.renderAll()
    }, [backgroundColor])

    // Update canvas dimensions when device changes
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.setDimensions({ width: device.width, height: device.height })
      canvas.renderAll()
    }, [device.width, device.height])

    const exportImage = useCallback((): string | null => {
      const canvas = fabricRef.current
      if (!canvas) return null
      return canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 })
    }, [])

    const exportJSON = useCallback((): string | null => {
      const canvas = fabricRef.current
      if (!canvas) return null
      return JSON.stringify(canvas.toJSON())
    }, [])

    const loadJSON = useCallback((json: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll()
      })
    }, [])

    const setBackgroundColor = useCallback((color: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.backgroundColor = color
      canvas.renderAll()
    }, [])

    const setGradientBackground = useCallback((colors: string[]) => {
      const canvas = fabricRef.current
      if (!canvas) return
      // Add a full-size gradient rect as the first object
      const existing = canvas.getObjects().find((o: any) => o._isGradientBg)
      if (existing) canvas.remove(existing)
      const gradRect = new Rect({
        left: 0,
        top: 0,
        width: device.width,
        height: device.height,
        selectable: false,
        evented: false,
        hoverCursor: "default",
      })
      ;(gradRect as any)._isGradientBg = true
      const colorStops = colors.map((c, i) => ({
        offset: i / Math.max(colors.length - 1, 1),
        color: c,
      }))
      gradRect.set("fill", new Gradient({
        type: "linear",
        coords: { x1: 0, y1: 0, x2: device.width, y2: device.height },
        colorStops,
      }))
      canvas.insertAt(0, gradRect)
      canvas.backgroundColor = "transparent"
      canvas.renderAll()
    }, [device.width, device.height])

    const addImage = useCallback(async (url: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" })
      const printW = device.width - device.inset.left - device.inset.right
      const printH = device.height - device.inset.top - device.inset.bottom
      const scale = Math.min(printW / (img.width || 1), printH / (img.height || 1)) * 0.8
      img.set({
        left: device.width / 2,
        top: device.height / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
      })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    }, [device])

    const addText = useCallback((text: string, options: Record<string, any> = {}) => {
      const canvas = fabricRef.current
      if (!canvas) return
      import("fabric").then(({ Textbox }) => {
        const textbox = new Textbox(text, {
          left: device.width / 2,
          top: device.height / 2,
          originX: "center",
          originY: "center",
          fontSize: 28,
          fontFamily: "Inter, sans-serif",
          fill: "#000000",
          textAlign: "center",
          width: device.width * 0.6,
          ...options,
        })
        canvas.add(textbox)
        canvas.setActiveObject(textbox)
        canvas.renderAll()
      })
    }, [device])

    const addSticker = useCallback((emoji: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      import("fabric").then(({ Textbox }) => {
        const sticker = new Textbox(emoji, {
          left: device.width / 2 + (Math.random() - 0.5) * 60,
          top: device.height / 2 + (Math.random() - 0.5) * 60,
          originX: "center",
          originY: "center",
          fontSize: 48,
          width: 60,
          textAlign: "center",
        })
        canvas.add(sticker)
        canvas.setActiveObject(sticker)
        canvas.renderAll()
      })
    }, [device])

    const undo = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas || historyIndexRef.current <= 0) return
      isRestoringRef.current = true
      historyIndexRef.current -= 1
      const json = historyRef.current[historyIndexRef.current]
      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll()
        isRestoringRef.current = false
        notifyCount()
      })
    }, [notifyCount])

    const redo = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return
      isRestoringRef.current = true
      historyIndexRef.current += 1
      const json = historyRef.current[historyIndexRef.current]
      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll()
        isRestoringRef.current = false
        notifyCount()
      })
    }, [notifyCount])

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      exportImage,
      exportJSON,
      loadJSON,
      setBackgroundColor,
      setGradientBackground,
      addImage,
      addText,
      addSticker,
      undo,
      redo,
    }))

    const W = device.width
    const H = device.height
    const R = device.borderRadius
    const D = device.caseDepth || 8
    const uid = device.id

    // Screen area
    const si = device.screenInset || { top: 16, right: 12, bottom: 16, left: 12 }
    const sr = device.screenRadius || R - 8

    // Total SVG with extra space for 3D depth edges + side buttons
    const PAD = D + 6
    const svgW = W + PAD * 2
    const svgH = H + PAD * 2

    return (
      <div ref={containerRef} className="relative inline-block">
        {/* Canvas positioned inside the case area */}
        <div style={{ padding: PAD }}>
          <canvas ref={canvasElRef} style={{ borderRadius: R - 2, display: "block" }} />
        </div>

        {/* Realistic 3D phone case overlay */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.22)) drop-shadow(0 2px 8px rgba(0,0,0,0.12))" }}
        >
          <defs>
            {/* Case edge (3D depth) gradient — left side */}
            <linearGradient id={`edge-l-${uid}`} x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#d0d0d0" />
              <stop offset="100%" stopColor="#a0a0a0" />
            </linearGradient>
            {/* Case edge — bottom */}
            <linearGradient id={`edge-b-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8c8c8" />
              <stop offset="100%" stopColor="#909090" />
            </linearGradient>
            {/* Case edge — right */}
            <linearGradient id={`edge-r-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d8d8d8" />
              <stop offset="100%" stopColor="#b0b0b0" />
            </linearGradient>

            {/* 3D highlight on case surface */}
            <linearGradient id={`hl-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.18" />
              <stop offset="30%" stopColor="white" stopOpacity="0.05" />
              <stop offset="70%" stopColor="black" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.08" />
            </linearGradient>

            {/* Camera module glass gradient */}
            <linearGradient id={`cam-glass-${uid}`} x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>

            {/* Lens gradient */}
            <radialGradient id={`lens-${uid}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor="#4a4a5a" />
              <stop offset="35%" stopColor="#222230" />
              <stop offset="70%" stopColor="#111118" />
              <stop offset="100%" stopColor="#050508" />
            </radialGradient>

            {/* Lens reflection */}
            <radialGradient id={`lens-ref-${uid}`} cx="28%" cy="28%">
              <stop offset="0%" stopColor="white" stopOpacity="0.55" />
              <stop offset="60%" stopColor="white" stopOpacity="0.08" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Clip path for case shape */}
            <clipPath id={`case-clip-${uid}`}>
              <rect x={PAD} y={PAD} width={W} height={H} rx={R} ry={R} />
            </clipPath>

            {/* Screen hole clip (to show phone screen black area) */}
            <mask id={`screen-mask-${uid}`}>
              <rect width={svgW} height={svgH} fill="white" />
              <rect
                x={PAD + si.left}
                y={PAD + si.top}
                width={W - si.left - si.right}
                height={H - si.top - si.bottom}
                rx={sr}
                ry={sr}
                fill="black"
              />
            </mask>
          </defs>

          {/* === 3D DEPTH EDGES (case thickness) === */}
          {/* Bottom edge */}
          <rect
            x={PAD + 2}
            y={PAD + H}
            width={W - 4}
            height={D}
            rx={3}
            fill={`url(#edge-b-${uid})`}
          />
          {/* Right edge */}
          <rect
            x={PAD + W}
            y={PAD + R}
            width={D}
            height={H - R * 2}
            fill={`url(#edge-r-${uid})`}
          />
          {/* Left edge */}
          <rect
            x={PAD - D}
            y={PAD + R}
            width={D}
            height={H - R * 2}
            fill={`url(#edge-l-${uid})`}
          />
          {/* Bottom-right corner */}
          <ellipse
            cx={PAD + W - 2}
            cy={PAD + H}
            rx={D * 0.7}
            ry={D * 0.7}
            fill="#aaa"
            opacity={0.4}
          />
          {/* Bottom-left corner */}
          <ellipse
            cx={PAD + 2}
            cy={PAD + H}
            rx={D * 0.7}
            ry={D * 0.7}
            fill="#b0b0b0"
            opacity={0.4}
          />

          {/* === CASE BODY === */}
          {/* Case outer shell */}
          <rect
            x={PAD}
            y={PAD}
            width={W}
            height={H}
            rx={R}
            ry={R}
            fill="none"
            stroke="#b8b8b8"
            strokeWidth={3}
          />
          {/* Case inner edge highlight (top-left light) */}
          <rect
            x={PAD + 1.5}
            y={PAD + 1.5}
            width={W - 3}
            height={H - 3}
            rx={R - 1}
            ry={R - 1}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />
          {/* Case inner edge shadow (bottom-right shadow) */}
          <rect
            x={PAD + 1}
            y={PAD + 1}
            width={W - 2}
            height={H - 2}
            rx={R}
            ry={R}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={2}
          />

          {/* 3D light/shadow overlay */}
          <rect
            x={PAD}
            y={PAD}
            width={W}
            height={H}
            rx={R}
            ry={R}
            fill={`url(#hl-${uid})`}
            clipPath={`url(#case-clip-${uid})`}
          />

          {/* === CASE EDGE BEZEL (thin lip around the screen) === */}
          <rect
            x={PAD}
            y={PAD}
            width={W}
            height={H}
            rx={R}
            ry={R}
            fill="rgba(200,200,200,0.15)"
            mask={`url(#screen-mask-${uid})`}
            clipPath={`url(#case-clip-${uid})`}
          />

          {/* === SIDE BUTTONS === */}
          {device.sideButtons?.map((btn, i) => {
            const isRight = btn.side === "right"
            const bx = isRight ? PAD + W : PAD - D - 1
            const bw = D + 2
            return (
              <g key={`btn-${i}`}>
                {/* Button body */}
                <rect
                  x={bx}
                  y={PAD + btn.y}
                  width={bw}
                  height={btn.height}
                  rx={2.5}
                  fill={isRight ? "#a8a8a8" : "#b0b0b0"}
                  stroke="#888"
                  strokeWidth={0.5}
                />
                {/* Button highlight */}
                <rect
                  x={bx + 1}
                  y={PAD + btn.y + 1}
                  width={bw - 2}
                  height={btn.height * 0.35}
                  rx={1.5}
                  fill="rgba(255,255,255,0.2)"
                />
              </g>
            )
          })}

          {/* === CAMERA MODULE === */}
          {device.cameraCutout && (
            <g clipPath={`url(#case-clip-${uid})`}>
              {/* Camera island raised background */}
              <rect
                x={PAD + device.cameraCutout.x - 3}
                y={PAD + device.cameraCutout.y - 3}
                width={device.cameraCutout.width + 6}
                height={device.cameraCutout.height + 6}
                rx={device.cameraCutout.radius + 3}
                ry={device.cameraCutout.radius + 3}
                fill="none"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth={1}
              />
              {/* Camera glass surface */}
              <rect
                x={PAD + device.cameraCutout.x}
                y={PAD + device.cameraCutout.y}
                width={device.cameraCutout.width}
                height={device.cameraCutout.height}
                rx={device.cameraCutout.radius}
                ry={device.cameraCutout.radius}
                fill={`url(#cam-glass-${uid})`}
                stroke="rgba(60,60,60,0.6)"
                strokeWidth={1.5}
              />
              {/* Glass sheen */}
              <rect
                x={PAD + device.cameraCutout.x + 3}
                y={PAD + device.cameraCutout.y + 3}
                width={device.cameraCutout.width - 6}
                height={device.cameraCutout.height * 0.3}
                rx={device.cameraCutout.radius - 2}
                fill="rgba(255,255,255,0.07)"
              />
            </g>
          )}

          {/* === CAMERA LENSES === */}
          {device.cameraLenses?.map((lens, i) => (
            <g key={`lens-${i}`} clipPath={`url(#case-clip-${uid})`}>
              {/* Shadow ring */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy + 1} r={lens.r + 3} fill="rgba(0,0,0,0.2)" />
              {/* Chrome outer ring */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r + 3} fill="none" stroke="#666" strokeWidth={1.5} />
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r + 1.5} fill="none" stroke="#888" strokeWidth={0.5} />
              {/* Lens body */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r} fill={`url(#lens-${uid})`} />
              {/* Inner ring (iris) */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r * 0.6} fill="rgba(8,8,20,0.92)" stroke="rgba(50,50,70,0.4)" strokeWidth={0.5} />
              {/* Lens reflection highlight */}
              <circle cx={PAD + lens.cx - lens.r * 0.18} cy={PAD + lens.cy - lens.r * 0.18} r={lens.r * 0.38} fill={`url(#lens-ref-${uid})`} />
              {/* Center dot */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={1.2} fill="rgba(20,20,40,0.7)" />
            </g>
          ))}

          {/* Flash/sensor dots near camera (for Apple devices) */}
          {device.brand === "Apple" && device.cameraCutout && (
            <g clipPath={`url(#case-clip-${uid})`}>
              <circle
                cx={PAD + device.cameraCutout.x + device.cameraCutout.width - 14}
                cy={PAD + device.cameraCutout.y + device.cameraCutout.height - 14}
                r={5}
                fill="#1a1a22"
                stroke="#444"
                strokeWidth={0.5}
              />
              <circle
                cx={PAD + device.cameraCutout.x + 14}
                cy={PAD + device.cameraCutout.y + device.cameraCutout.height - 14}
                r={4}
                fill="#ffeedd"
                opacity={0.3}
                stroke="#666"
                strokeWidth={0.5}
              />
            </g>
          )}
        </svg>
      </div>
    )
  }
)

DesignerCanvas.displayName = "DesignerCanvas"

export default DesignerCanvas
