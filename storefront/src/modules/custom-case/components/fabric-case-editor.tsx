"use client"

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react"
import type { DeviceTemplate } from "../types"
import type { CaseMaterial } from "../case-viewer-types"
import type { EditorTool, ShapeType } from "./editor-toolbar"

// ── Fabric.js v6 imports ──
import {
  Canvas as FabricCanvas,
  FabricText,
  Textbox,
  FabricImage,
  PencilBrush,
  Circle,
  Rect,
  Triangle,
  Line,
  Path,
  FabricObject,
} from "fabric"

export type FabricCaseEditorHandle = {
  exportToDataURL: (multiplier?: number) => string | null
  addText: (text?: string) => void
  addSticker: (emoji: string) => void
  addImageFromURL: (url: string) => Promise<void>
  addShape: (type: ShapeType) => void
  setDrawingMode: (enabled: boolean, isEraser?: boolean) => void
  deleteSelected: () => void
  duplicateSelected: () => void
  bringForward: () => void
  sendBackward: () => void
  undo: () => void
  redo: () => void
  clearAll: () => void
  getCanvas: () => FabricCanvas | null
  triggerImageUpload: () => void
}

type FabricCaseEditorProps = {
  device: DeviceTemplate
  backgroundColor: string
  caseColor?: string
  caseMaterial?: CaseMaterial
  activeTool: EditorTool
  brushColor: string
  brushWidth: number
  fillColor: string
  fontSize: number
  fontFamily: string
  textColor: string
  textBold: boolean
  textItalic: boolean
  activeShape: ShapeType
  onSelectionChange: (hasSelection: boolean) => void
  onCanvasChange: () => void
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void
}

/** Darken or lighten a hex color */
function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

const FabricCaseEditor = forwardRef<FabricCaseEditorHandle, FabricCaseEditorProps>(
  function FabricCaseEditor(
    {
      device,
      backgroundColor,
      caseColor = "#c0c0c0",
      caseMaterial = "glossy",
      activeTool,
      brushColor,
      brushWidth,
      fillColor,
      fontSize,
      fontFamily,
      textColor,
      textBold,
      textItalic,
      activeShape,
      onSelectionChange,
      onCanvasChange,
      onHistoryChange,
    },
    ref
  ) {
    const canvasElRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<FabricCanvas | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const historyRef = useRef<string[]>([])
    const historyIndexRef = useRef(-1)
    const isRestoringRef = useRef(false)
    const [canvasReady, setCanvasReady] = useState(false)

    const W = device.width
    const H = device.height
    const R = device.borderRadius
    const BUMPER = 8
    const OW = W + BUMPER * 2
    const OH = H + BUMPER * 2
    const OR = R + BUMPER * 0.6

    // ── Scale to fit container ──
    // SVG viewBox includes extra padding for shadow: 10+BUMPER left, 6+BUMPER top, 24 total width extra, 40 total height extra
    const SVG_PAD_L = BUMPER + 10
    const SVG_PAD_T = BUMPER + 6
    const SVG_VB_W = OW + 24
    const SVG_VB_H = OH + 40
    const MAX_DISPLAY_W = 380
    const scale = MAX_DISPLAY_W / SVG_VB_W
    const displayW = SVG_VB_W * scale
    const displayH = SVG_VB_H * scale
    const canvasDisplayW = W * scale
    const canvasDisplayH = H * scale

    // ── Initialize Fabric Canvas ──
    useEffect(() => {
      if (!canvasElRef.current || fabricRef.current) return

      const canvas = new FabricCanvas(canvasElRef.current, {
        width: W,
        height: H,
        backgroundColor: backgroundColor,
        selection: true,
        preserveObjectStacking: true,
        enableRetinaScaling: true,
        stopContextMenu: true,
        fireRightClick: true,
      })

      fabricRef.current = canvas
      setCanvasReady(true)

      // Save initial state
      saveHistory(canvas)

      // Event listeners
      canvas.on("selection:created", () => onSelectionChange(true))
      canvas.on("selection:updated", () => onSelectionChange(true))
      canvas.on("selection:cleared", () => onSelectionChange(false))

      canvas.on("object:modified", () => {
        saveHistory(canvas)
        onCanvasChange()
      })
      canvas.on("object:added", () => {
        if (!isRestoringRef.current) {
          saveHistory(canvas)
          onCanvasChange()
        }
      })
      canvas.on("object:removed", () => {
        if (!isRestoringRef.current) {
          saveHistory(canvas)
          onCanvasChange()
        }
      })
      canvas.on("path:created", () => {
        saveHistory(canvas)
        onCanvasChange()
      })

      return () => {
        canvas.dispose()
        fabricRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device.id])

    // ── Update background color ──
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.backgroundColor = backgroundColor
      canvas.requestRenderAll()
      onCanvasChange()
    }, [backgroundColor, onCanvasChange])

    // ── Update tool mode ──
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return

      if (activeTool === "draw") {
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush = new PencilBrush(canvas)
        canvas.freeDrawingBrush.color = brushColor
        canvas.freeDrawingBrush.width = brushWidth
        canvas.selection = false
      } else if (activeTool === "eraser") {
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush = new PencilBrush(canvas)
        canvas.freeDrawingBrush.color = backgroundColor
        canvas.freeDrawingBrush.width = brushWidth * 2
        canvas.selection = false
      } else {
        canvas.isDrawingMode = false
        canvas.selection = activeTool === "select"
      }
      canvas.requestRenderAll()
    }, [activeTool, brushColor, brushWidth, backgroundColor])

    // ── Update brush props live ──
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas || !canvas.freeDrawingBrush) return
      if (activeTool === "draw") {
        canvas.freeDrawingBrush.color = brushColor
        canvas.freeDrawingBrush.width = brushWidth
      } else if (activeTool === "eraser") {
        canvas.freeDrawingBrush.color = backgroundColor
        canvas.freeDrawingBrush.width = brushWidth * 2
      }
    }, [brushColor, brushWidth, activeTool, backgroundColor])

    // ── Update text properties on selected text ──
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      const active = canvas.getActiveObject()
      if (active && (active instanceof Textbox || active instanceof FabricText)) {
        active.set({
          fontSize,
          fontFamily,
          fill: textColor,
          fontWeight: textBold ? "bold" : "normal",
          fontStyle: textItalic ? "italic" : "normal",
        })
        canvas.requestRenderAll()
        onCanvasChange()
      }
    }, [fontSize, fontFamily, textColor, textBold, textItalic, onCanvasChange])

    // ── History helpers ──
    function saveHistory(canvas: FabricCanvas) {
      const json = JSON.stringify(canvas.toJSON())
      const history = historyRef.current
      const idx = historyIndexRef.current

      // Truncate forward history if we're not at the end
      if (idx < history.length - 1) {
        historyRef.current = history.slice(0, idx + 1)
      }

      historyRef.current.push(json)
      // Limit history size
      if (historyRef.current.length > 50) {
        historyRef.current = historyRef.current.slice(-50)
      }
      historyIndexRef.current = historyRef.current.length - 1
      onHistoryChange(historyIndexRef.current > 0, false)
    }

    async function restoreHistory(canvas: FabricCanvas, json: string) {
      isRestoringRef.current = true
      await canvas.loadFromJSON(json)
      canvas.requestRenderAll()
      isRestoringRef.current = false
      onCanvasChange()
    }

    // ── Keyboard shortcuts ──
    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        const canvas = fabricRef.current
        if (!canvas) return
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") return

        // Check if we're editing text in fabric
        const activeObj = canvas.getActiveObject()
        if (activeObj && (activeObj instanceof Textbox || activeObj instanceof FabricText)) {
          if ((activeObj as any).isEditing) return
        }

        if (e.key === "Delete" || e.key === "Backspace") {
          deleteSelected()
          e.preventDefault()
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
          undo()
          e.preventDefault()
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
          redo()
          e.preventDefault()
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "d") {
          duplicateSelected()
          e.preventDefault()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Click to add text / shape ──
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return

      const handler = (opt: any) => {
        if (activeTool === "text") {
          const pointer = canvas.getScenePoint(opt.e)
          addTextAt(pointer.x, pointer.y)
        } else if (activeTool === "shape") {
          const pointer = canvas.getScenePoint(opt.e)
          addShapeAt(activeShape, pointer.x, pointer.y)
        }
      }

      canvas.on("mouse:dblclick", handler)
      return () => {
        canvas.off("mouse:dblclick", handler)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool, activeShape, fillColor, brushColor, fontSize, fontFamily, textColor, textBold, textItalic])

    // ── Core methods ──
    function addTextAt(x: number, y: number) {
      const canvas = fabricRef.current
      if (!canvas) return
      const text = new Textbox("Your Text", {
        left: x - 40,
        top: y - 12,
        width: 140,
        fontSize,
        fontFamily,
        fill: textColor,
        fontWeight: textBold ? "bold" : "normal",
        fontStyle: textItalic ? "italic" : "normal",
        textAlign: "center",
        editable: true,
        cornerColor: "#000",
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#333",
        padding: 4,
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      canvas.requestRenderAll()
    }

    function addShapeAt(type: ShapeType, x: number, y: number) {
      const canvas = fabricRef.current
      if (!canvas) return
      const commonProps = {
        left: x - 30,
        top: y - 30,
        fill: fillColor === "transparent" ? "transparent" : fillColor,
        stroke: brushColor,
        strokeWidth: 2,
        cornerColor: "#000",
        cornerStyle: "circle" as const,
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#333",
      }

      let shape: FabricObject | null = null
      switch (type) {
        case "rect":
          shape = new Rect({ ...commonProps, width: 80, height: 60, rx: 4, ry: 4 })
          break
        case "circle":
          shape = new Circle({ ...commonProps, radius: 35 })
          break
        case "triangle":
          shape = new Triangle({ ...commonProps, width: 70, height: 65 })
          break
        case "star": {
          // 5-point star as a polygon path
          const starPath = createStarPath(30, 5)
          shape = new Path(starPath, { ...commonProps, left: x - 30, top: y - 30 })
          break
        }
        case "heart": {
          const heartPath = "M 0 -15 C -20 -40, -50 -10, -25 15 L 0 40 L 25 15 C 50 -10, 20 -40, 0 -15 Z"
          shape = new Path(heartPath, { ...commonProps, left: x - 25, top: y - 25, scaleX: 0.8, scaleY: 0.8 })
          break
        }
        case "line":
          shape = new Line([0, 0, 100, 0], {
            ...commonProps,
            left: x - 50,
            top: y,
            stroke: brushColor,
            strokeWidth: 3,
            fill: undefined,
          })
          break
      }
      if (shape) {
        canvas.add(shape)
        canvas.setActiveObject(shape)
        canvas.requestRenderAll()
      }
    }

    function deleteSelected() {
      const canvas = fabricRef.current
      if (!canvas) return
      const active = canvas.getActiveObjects()
      if (active.length > 0) {
        active.forEach((obj) => canvas.remove(obj))
        canvas.discardActiveObject()
        canvas.requestRenderAll()
      }
    }

    function duplicateSelected() {
      const canvas = fabricRef.current
      if (!canvas) return
      const active = canvas.getActiveObject()
      if (!active) return
      active.clone().then((cloned: FabricObject) => {
        cloned.set({ left: (cloned.left || 0) + 15, top: (cloned.top || 0) + 15 })
        canvas.add(cloned)
        canvas.setActiveObject(cloned)
        canvas.requestRenderAll()
      })
    }

    function bringForward() {
      const canvas = fabricRef.current
      if (!canvas) return
      const active = canvas.getActiveObject()
      if (active) {
        canvas.bringObjectForward(active)
        canvas.requestRenderAll()
      }
    }

    function sendBackward() {
      const canvas = fabricRef.current
      if (!canvas) return
      const active = canvas.getActiveObject()
      if (active) {
        canvas.sendObjectBackwards(active)
        canvas.requestRenderAll()
      }
    }

    function undo() {
      const canvas = fabricRef.current
      if (!canvas || historyIndexRef.current <= 0) return
      historyIndexRef.current--
      const json = historyRef.current[historyIndexRef.current]
      restoreHistory(canvas, json)
      onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyRef.current.length - 1)
    }

    function redo() {
      const canvas = fabricRef.current
      if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return
      historyIndexRef.current++
      const json = historyRef.current[historyIndexRef.current]
      restoreHistory(canvas, json)
      onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyRef.current.length - 1)
    }

    function clearAll() {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.clear()
      canvas.backgroundColor = backgroundColor
      canvas.requestRenderAll()
      saveHistory(canvas)
      onCanvasChange()
    }

    async function addImageFromURL(url: string) {
      const canvas = fabricRef.current
      if (!canvas) return
      try {
        const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" })
        // Scale to fit nicely
        const maxDim = Math.min(W, H) * 0.6
        const imgScale = maxDim / Math.max(img.width || 1, img.height || 1)
        img.set({
          left: W / 2 - ((img.width || 0) * imgScale) / 2,
          top: H / 2 - ((img.height || 0) * imgScale) / 2,
          scaleX: imgScale,
          scaleY: imgScale,
          cornerColor: "#000",
          cornerStyle: "circle",
          cornerSize: 8,
          transparentCorners: false,
          borderColor: "#333",
        })
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.requestRenderAll()
      } catch (err) {
        console.error("Failed to add image:", err)
      }
    }

    function addSticker(emoji: string) {
      const canvas = fabricRef.current
      if (!canvas) return
      const text = new FabricText(emoji, {
        left: W / 2 - 25,
        top: H / 2 - 25,
        fontSize: 50,
        cornerColor: "#000",
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#333",
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.requestRenderAll()
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const files = e.target.files
      if (!files || files.length === 0) return
      for (let i = 0; i < files.length; i++) {
        const url = URL.createObjectURL(files[i])
        addImageFromURL(url)
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }

    // ── Expose handle ──
    useImperativeHandle(ref, () => ({
      exportToDataURL: (multiplier = 2) => {
        const canvas = fabricRef.current
        if (!canvas) return null
        return canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier,
        })
      },
      addText: (text?: string) => {
        addTextAt(W / 2, H / 2)
      },
      addSticker,
      addImageFromURL,
      addShape: (type: ShapeType) => addShapeAt(type, W / 2, H / 2),
      setDrawingMode: (enabled: boolean) => {
        const canvas = fabricRef.current
        if (canvas) canvas.isDrawingMode = enabled
      },
      deleteSelected,
      duplicateSelected,
      bringForward,
      sendBackward,
      undo,
      redo,
      clearAll,
      getCanvas: () => fabricRef.current,
      triggerImageUpload: () => fileInputRef.current?.click(),
    }))

    // ── Derived SVG values ──
    const bumperDark = adjustBrightness(caseColor, -30)
    const bumperLight = adjustBrightness(caseColor, 30)
    const bumperEdge = adjustBrightness(caseColor, -50)

    return (
      <div className="relative inline-flex items-center justify-center select-none">
        {/* Hidden file input for image uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        <div
          className="relative"
          style={{
            width: displayW,
            height: displayH,
          }}
        >
          {/* ── Phone Case SVG Frame (overlay) — realistic mockup style ── */}
          <svg
            viewBox={`-${BUMPER + 10} -${BUMPER + 6} ${OW + 24} ${OH + 40}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 20 }}
          >
            <defs>
              {/* Case body gradient — subtle 3D shading */}
              <linearGradient id={`fce-body-${device.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={adjustBrightness(caseColor, 40)} />
                <stop offset="15%" stopColor={bumperLight} />
                <stop offset="50%" stopColor={caseColor} />
                <stop offset="85%" stopColor={bumperDark} />
                <stop offset="100%" stopColor={adjustBrightness(caseColor, -45)} />
              </linearGradient>
              {/* Left edge highlight (3D depth) */}
              <linearGradient id={`fce-left-${device.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={adjustBrightness(caseColor, 50)} stopOpacity="0.6" />
                <stop offset="100%" stopColor={caseColor} stopOpacity="0" />
              </linearGradient>
              {/* Right edge shadow (3D depth) */}
              <linearGradient id={`fce-right-${device.id}`} x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor={adjustBrightness(caseColor, -60)} stopOpacity="0.4" />
                <stop offset="100%" stopColor={caseColor} stopOpacity="0" />
              </linearGradient>
              {/* Button gradient */}
              <linearGradient id={`fce-btn-${device.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={adjustBrightness(caseColor, -20)} />
                <stop offset="50%" stopColor={caseColor} />
                <stop offset="100%" stopColor={adjustBrightness(caseColor, -20)} />
              </linearGradient>
              {/* Camera module white background */}
              <linearGradient id={`fce-cam-bg-${device.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8f8f8" />
                <stop offset="50%" stopColor="#f0f0f0" />
                <stop offset="100%" stopColor="#e8e8e8" />
              </linearGradient>
              {/* Camera lens glass gradient */}
              <radialGradient id={`fce-lens-${device.id}`} cx="40%" cy="38%">
                <stop offset="0%" stopColor="#4a5568" stopOpacity="0.6" />
                <stop offset="25%" stopColor="#1a202c" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#0a0e14" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#000810" />
              </radialGradient>
              {/* Lens blue reflection */}
              <radialGradient id={`fce-lens-reflect-${device.id}`} cx="35%" cy="32%">
                <stop offset="0%" stopColor="#6ba3d6" stopOpacity="0.5" />
                <stop offset="40%" stopColor="#2d5a8e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              {/* Glossy finish overlay */}
              <linearGradient id={`fce-finish-${device.id}`} x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="25%" stopColor="rgba(255,255,255,0.04)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                <stop offset="75%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
              </linearGradient>
              {/* Drop shadow filter */}
              <filter id={`fce-shadow-${device.id}`} x="-8%" y="-4%" width="116%" height="116%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.18)" />
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.10)" />
              </filter>
              {/* Inner shadow for camera module */}
              <filter id={`fce-cam-shadow-${device.id}`} x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.15)" />
              </filter>
              {/* Mask: case body with design area cut out */}
              <mask id={`fce-frame-mask-${device.id}`}>
                <rect x={-BUMPER - 10} y={-BUMPER - 6} width={OW + 24} height={OH + 40} fill="white" />
                <rect x={BUMPER} y={BUMPER} width={W} height={H} rx={R} ry={R} fill="black" />
              </mask>
            </defs>

            {/* ── Case body with design area cutout ── */}
            <g filter={`url(#fce-shadow-${device.id})`}>
              <g mask={`url(#fce-frame-mask-${device.id})`}>
                {/* Main case fill */}
                <rect x={0} y={0} width={OW} height={OH} rx={OR} ry={OR} fill={`url(#fce-body-${device.id})`} />
                {/* Left edge highlight for 3D depth */}
                <rect x={0} y={0} width={OW * 0.15} height={OH} rx={OR} ry={OR} fill={`url(#fce-left-${device.id})`} />
                {/* Right edge shadow for 3D depth */}
                <rect x={OW * 0.85} y={0} width={OW * 0.15} height={OH} rx={OR} ry={OR} fill={`url(#fce-right-${device.id})`} />
              </g>
            </g>

            {/* Inner edge around design area */}
            <rect x={BUMPER - 0.3} y={BUMPER - 0.3} width={W + 0.6} height={H + 0.6} rx={R + 0.3} ry={R + 0.3} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={0.6} />

            {/* ── Camera module — white background with realistic glass lenses ── */}
            {device.cameraCutout && (
              <g transform={`translate(${BUMPER}, ${BUMPER})`}>
                {/* Raised bumper ring around camera */}
                <rect
                  x={device.cameraCutout.x - 5}
                  y={device.cameraCutout.y - 5}
                  width={device.cameraCutout.width + 10}
                  height={device.cameraCutout.height + 10}
                  rx={device.cameraCutout.radius + 5}
                  ry={device.cameraCutout.radius + 5}
                  fill={bumperDark}
                  stroke={bumperEdge}
                  strokeWidth={0.5}
                />
                {/* White/cream camera module background */}
                <rect
                  x={device.cameraCutout.x}
                  y={device.cameraCutout.y}
                  width={device.cameraCutout.width}
                  height={device.cameraCutout.height}
                  rx={device.cameraCutout.radius}
                  ry={device.cameraCutout.radius}
                  fill={`url(#fce-cam-bg-${device.id})`}
                  filter={`url(#fce-cam-shadow-${device.id})`}
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth={0.5}
                />
              </g>
            )}

            {/* ── Realistic camera lenses ── */}
            <g transform={`translate(${BUMPER}, ${BUMPER})`}>
              {device.cameraLenses?.map((lens, i) => {
                const isIndividual = device.cameraStyle === "individual"
                return (
                  <g key={i}>
                    {/* Individual camera: own raised ring per lens */}
                    {isIndividual && (
                      <>
                        <circle cx={lens.cx} cy={lens.cy} r={lens.r + 7} fill={bumperDark} stroke={bumperEdge} strokeWidth={0.5} />
                        <circle cx={lens.cx} cy={lens.cy} r={lens.r + 4} fill="#f0f0f0" stroke="rgba(0,0,0,0.06)" strokeWidth={0.5} />
                      </>
                    )}
                    {/* Metallic outer ring */}
                    <circle cx={lens.cx} cy={lens.cy} r={lens.r + 2} fill="none" stroke="#888" strokeWidth={1.5} />
                    <circle cx={lens.cx} cy={lens.cy} r={lens.r + 1} fill="none" stroke="#aaa" strokeWidth={0.5} />
                    {/* Dark glass lens */}
                    <circle cx={lens.cx} cy={lens.cy} r={lens.r} fill={`url(#fce-lens-${device.id})`} />
                    {/* Blue-tinted reflection */}
                    <circle cx={lens.cx} cy={lens.cy} r={lens.r} fill={`url(#fce-lens-reflect-${device.id})`} />
                    {/* Small specular highlight */}
                    <circle cx={lens.cx - lens.r * 0.28} cy={lens.cy - lens.r * 0.28} r={lens.r * 0.18} fill="rgba(255,255,255,0.35)" />
                    {/* Inner ring detail */}
                    <circle cx={lens.cx} cy={lens.cy} r={lens.r * 0.55} fill="none" stroke="rgba(100,120,160,0.12)" strokeWidth={0.4} />
                  </g>
                )
              })}

              {/* Flash / LED — small amber circle (only for module & bar styles with 3+ lenses) */}
              {device.cameraLenses && device.cameraLenses.length >= 2 && device.cameraCutout && device.cameraStyle !== "individual" && (() => {
                const cc = device.cameraCutout
                const flashCx = cc.x + cc.width - 16
                const flashCy = cc.y + 16
                return (
                  <g>
                    <circle cx={flashCx} cy={flashCy} r={5} fill="#c8a84e" stroke="#b89840" strokeWidth={0.5} />
                    <circle cx={flashCx - 1} cy={flashCy - 1} r={2} fill="rgba(255,240,180,0.6)" />
                  </g>
                )
              })()}

              {/* Microphone / sensor — tiny dark dot */}
              {device.cameraLenses && device.cameraLenses.length >= 2 && device.cameraCutout && device.cameraStyle !== "individual" && (() => {
                const cc = device.cameraCutout
                const sensorCx = cc.x + 14
                const sensorCy = cc.y + cc.height - 14
                return <circle cx={sensorCx} cy={sensorCy} r={3} fill="#222" stroke="#333" strokeWidth={0.3} />
              })()}
            </g>

            {/* ── Side buttons — subtle raised look ── */}
            {device.sideButtons?.map((btn, i) => {
              const BTN_W = 3.5
              const bx = btn.side === "right" ? OW + 0.5 : -BTN_W - 0.5
              return (
                <g key={i}>
                  <rect x={bx} y={btn.y + BUMPER} width={BTN_W} height={btn.height} rx={1.5} ry={1.5} fill={`url(#fce-btn-${device.id})`} stroke={bumperEdge} strokeWidth={0.4} />
                  {/* Top highlight on button */}
                  <rect x={bx + 0.5} y={btn.y + BUMPER + 0.5} width={BTN_W - 1} height={btn.height * 0.4} rx={1} ry={1} fill="rgba(255,255,255,0.12)" />
                </g>
              )
            })}

            {/* ── Port cutout ── */}
            {device.portCutout ? (
              <rect x={device.portCutout.x + BUMPER} y={OH + 0.5} width={device.portCutout.width} height={3} rx={device.portCutout.radius || 1.5} ry={device.portCutout.radius || 1.5} fill="rgba(30,30,30,0.5)" />
            ) : (
              <rect x={OW / 2 - 12} y={OH + 0.5} width={24} height={3} rx={1.5} ry={1.5} fill="rgba(30,30,30,0.4)" />
            )}

            {/* ── Glossy finish overlay ── */}
            {caseMaterial === "glossy" && (
              <rect x={0} y={0} width={OW} height={OH} rx={OR} ry={OR} fill={`url(#fce-finish-${device.id})`} pointerEvents="none" />
            )}

            {/* ── Outer case edge highlight ── */}
            <rect x={0.3} y={0.3} width={OW - 0.6} height={OH - 0.6} rx={OR} ry={OR} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.4} pointerEvents="none" />
          </svg>

          {/* ── Fabric.js Canvas (interactive, sits under the SVG frame) ── */}
          <div
            className="absolute"
            style={{
              left: ((SVG_PAD_L + BUMPER) / SVG_VB_W) * displayW,
              top: ((SVG_PAD_T + BUMPER) / SVG_VB_H) * displayH,
              width: canvasDisplayW,
              height: canvasDisplayH,
              zIndex: 10,
              borderRadius: R * scale,
              overflow: "hidden",
            }}
          >
            <canvas
              ref={canvasElRef}
              style={{
                width: canvasDisplayW,
                height: canvasDisplayH,
                cursor: activeTool === "draw" || activeTool === "eraser"
                  ? "crosshair"
                  : activeTool === "text"
                  ? "text"
                  : "default",
              }}
            />
          </div>

          {/* Tool hint overlay */}
          {!canvasReady && (
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                <span className="text-[11px] text-gray-400">Loading editor...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

/** Create a star SVG path string */
function createStarPath(radius: number, points: number): string {
  const innerRadius = radius * 0.4
  let path = ""
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : innerRadius
    const angle = (Math.PI * i) / points - Math.PI / 2
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  path += " Z"
  return path
}

export default FabricCaseEditor
