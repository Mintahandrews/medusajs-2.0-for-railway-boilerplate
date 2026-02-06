"use client"

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { Canvas, Rect, FabricImage, Gradient, Line } from "fabric"
import type { DeviceTemplate } from "../types"

export type DesignerCanvasHandle = {
  getCanvas: () => Canvas | null
  exportImage: (options?: { multiplier?: number }) => string | null
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

      // Snap-to-center alignment guides
      const SNAP_THRESHOLD = 8
      const cX = device.width / 2
      const cY = device.height / 2
      let vLine: any = null
      let hLine: any = null

      const createGuideLine = (points: [number, number, number, number]) => {
        return new Line(points, {
          stroke: "rgba(59,130,246,0.6)",
          strokeWidth: 1,
          strokeDashArray: [4, 3],
          selectable: false,
          evented: false,
          excludeFromExport: true,
        })
      }

      const onMoving = (e: any) => {
        const obj = e.target
        if (!obj) return
        const objCX = obj.left + (obj.width * obj.scaleX) / 2
        const objCY = obj.top + (obj.height * obj.scaleY) / 2

        // Vertical center guide
        if (Math.abs(objCX - cX) < SNAP_THRESHOLD) {
          obj.set("left", cX - (obj.width * obj.scaleX) / 2)
          if (!vLine) {
            vLine = createGuideLine([cX, 0, cX, device.height])
            canvas.add(vLine)
          }
        } else if (vLine) {
          canvas.remove(vLine)
          vLine = null
        }

        // Horizontal center guide
        if (Math.abs(objCY - cY) < SNAP_THRESHOLD) {
          obj.set("top", cY - (obj.height * obj.scaleY) / 2)
          if (!hLine) {
            hLine = createGuideLine([0, cY, device.width, cY])
            canvas.add(hLine)
          }
        } else if (hLine) {
          canvas.remove(hLine)
          hLine = null
        }
        canvas.renderAll()
      }

      const onMoveEnd = () => {
        if (vLine) { canvas.remove(vLine); vLine = null }
        if (hLine) { canvas.remove(hLine); hLine = null }
        canvas.renderAll()
      }

      canvas.on("object:moving", onMoving)
      canvas.on("object:modified", onMoveEnd)

      return () => {
        canvas.off("object:added", onChange)
        canvas.off("object:removed", onChange)
        canvas.off("object:modified", onChange)
        canvas.off("object:moving", onMoving)
        canvas.off("object:modified", onMoveEnd)
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

    const exportImage = useCallback((options?: { multiplier?: number }): string | null => {
      const canvas = fabricRef.current
      if (!canvas) return null
      return canvas.toDataURL({ format: "png", quality: 1, multiplier: options?.multiplier ?? 2 })
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
    const uid = device.id

    // Padding around canvas for buttons + border
    const PAD = 14
    const svgW = W + PAD * 2
    const svgH = H + PAD * 2

    // Safe zone insets
    const SZ = device.inset

    // Camera cutout
    const cc = device.cameraCutout

    return (
      <div ref={containerRef} className="relative inline-block">
        {/* Canvas positioned inside the case outline */}
        <div style={{ padding: PAD }}>
          <canvas ref={canvasElRef} style={{ borderRadius: R - 2, display: "block" }} />
        </div>

        {/* === CASE CUTOUT OVERLAY === */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
        >
          <defs>
            <clipPath id={`body-${uid}`}>
              <rect x={PAD} y={PAD} width={W} height={H} rx={R} ry={R} />
            </clipPath>
            {/* Drop shadow */}
            <filter id={`ds-${uid}`} x="-5%" y="-3%" width="110%" height="110%">
              <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#000" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Subtle shadow under the case */}
          <rect
            x={PAD + 2} y={PAD + 3} width={W - 4} height={H - 2}
            rx={R} ry={R} fill="rgba(0,0,0,0.08)"
            filter={`url(#ds-${uid})`}
          />

          {/* Case outline — main border */}
          <rect
            x={PAD} y={PAD} width={W} height={H}
            rx={R} ry={R}
            fill="none" stroke="#b8b8b8" strokeWidth={3}
          />
          {/* Inner edge highlight */}
          <rect
            x={PAD + 1.5} y={PAD + 1.5} width={W - 3} height={H - 3}
            rx={R - 1} ry={R - 1}
            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={0.5}
          />

          {/* Safe zone guide (dashed) — shows printable area */}
          <rect
            x={PAD + SZ.left} y={PAD + SZ.top}
            width={W - SZ.left - SZ.right} height={H - SZ.top - SZ.bottom}
            rx={Math.max(R - SZ.left, 4)} ry={Math.max(R - SZ.top, 4)}
            fill="none" stroke="rgba(59,130,246,0.25)"
            strokeWidth={1} strokeDasharray="6 4"
          />

          {/* Button cutout notches on case edges */}
          {device.sideButtons?.map((btn, i) => {
            const isRight = btn.side === "right"
            // Small rounded notch on the case edge
            const nx = isRight ? PAD + W - 1 : PAD - 3
            const nw = 4
            const nr = 2
            return (
              <rect
                key={`btn-${i}`}
                x={nx} y={PAD + btn.y}
                width={nw} height={btn.height}
                rx={nr} ry={nr}
                fill="#d0d0d0" stroke="#b0b0b0" strokeWidth={0.5}
              />
            )
          })}

          {/* Camera cutout — style-aware rendering */}
          {cc && device.cameraStyle !== "individual" && (
            <g clipPath={`url(#body-${uid})`}>
              <rect
                x={PAD + cc.x} y={PAD + cc.y}
                width={cc.width} height={cc.height}
                rx={cc.radius} ry={cc.radius}
                fill="none" stroke="#888" strokeWidth={1.5}
              />
              <rect
                x={PAD + cc.x + 2} y={PAD + cc.y + 2}
                width={cc.width - 4} height={cc.height - 4}
                rx={Math.max(cc.radius - 2, 2)} ry={Math.max(cc.radius - 2, 2)}
                fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={1}
              />
            </g>
          )}

          {/* Individual camera lens circles (Samsung-style or inside module) */}
          {device.cameraLenses?.map((lens, i) => (
            <g key={`lens-${i}`} clipPath={`url(#body-${uid})`}>
              <circle
                cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r + 2}
                fill="none"
                stroke={device.cameraStyle === "individual" ? "#888" : "rgba(40,40,45,0.7)"}
                strokeWidth={device.cameraStyle === "individual" ? 1.5 : 1}
              />
              <circle
                cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r}
                fill="none"
                stroke="rgba(100,100,110,0.5)" strokeWidth={0.5}
              />
              <circle
                cx={PAD + lens.cx - lens.r * 0.25} cy={PAD + lens.cy - lens.r * 0.25}
                r={lens.r * 0.18}
                fill="rgba(255,255,255,0.08)"
              />
            </g>
          ))}

          {/* USB-C / Lightning port cutout at bottom */}
          {device.portCutout && (
            <rect
              x={PAD + device.portCutout.x} y={PAD + device.portCutout.y}
              width={device.portCutout.width} height={device.portCutout.height}
              rx={device.portCutout.radius} ry={device.portCutout.radius}
              fill="#c0c0c0" stroke="#a0a0a0" strokeWidth={0.5}
            />
          )}
        </svg>
      </div>
    )
  }
)

DesignerCanvas.displayName = "DesignerCanvas"

export default DesignerCanvas
