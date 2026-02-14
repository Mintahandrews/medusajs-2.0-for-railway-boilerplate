"use client"

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from "react"
import type { DeviceConfig } from "@lib/device-assets"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type ActiveTool = "select" | "text" | "upload" | "background" | "case-type" | "preview"

export type CaseType = "slim" | "tough" | "clear" | "magsafe"

export interface CustomizerState {
  activeTool: ActiveTool
  caseType: CaseType
  backgroundColor: string
  fontFamily: string
  fontSize: number
  textColor: string
  canUndo: boolean
  canRedo: boolean
  isCanvasReady: boolean
}

type Action =
  | { type: "SET_TOOL"; tool: ActiveTool }
  | { type: "SET_CASE_TYPE"; caseType: CaseType }
  | { type: "SET_BG_COLOR"; color: string }
  | { type: "SET_FONT_FAMILY"; family: string }
  | { type: "SET_FONT_SIZE"; size: number }
  | { type: "SET_TEXT_COLOR"; color: string }
  | { type: "SET_HISTORY"; canUndo: boolean; canRedo: boolean }
  | { type: "SET_CANVAS_READY"; ready: boolean }

export interface CustomizerContextValue {
  state: CustomizerState
  dispatch: React.Dispatch<Action>
  /** Imperative ref to the live fabric.Canvas instance */
  canvasRef: React.MutableRefObject<any | null>
  /** Currently loaded device config */
  deviceConfig: DeviceConfig
  /** History stack for undo / redo (array of canvas JSON snapshots) */
  historyRef: React.MutableRefObject<string[]>
  /** Pointer into the history stack */
  historyIndexRef: React.MutableRefObject<number>
  /** Push the current canvas state onto the history stack */
  pushHistory: () => void
  undo: () => void
  redo: () => void
  /** Add a user-uploaded image to the canvas */
  addImage: (file: File) => void
  /** Add a text object to the canvas */
  addText: (text?: string) => void
  /** Set the canvas background color */
  setBackgroundColor: (color: string) => void
  /** Export the current design as a data-URL PNG (print file, no overlay) */
  exportPrintFile: (multiplier?: number) => Promise<string | null>
  /** Export a preview mockup (design + overlay) */
  exportPreview: () => string | null
}

/* -------------------------------------------------------------------------- */
/*  Reducer                                                                   */
/* -------------------------------------------------------------------------- */

const initialState: CustomizerState = {
  activeTool: "select",
  caseType: "tough",
  backgroundColor: "#ffffff",
  fontFamily: "Arial",
  fontSize: 32,
  textColor: "#000000",
  canUndo: false,
  canRedo: false,
  isCanvasReady: false,
}

function reducer(state: CustomizerState, action: Action): CustomizerState {
  switch (action.type) {
    case "SET_TOOL":
      return { ...state, activeTool: action.tool }
    case "SET_CASE_TYPE":
      return { ...state, caseType: action.caseType }
    case "SET_BG_COLOR":
      return { ...state, backgroundColor: action.color }
    case "SET_FONT_FAMILY":
      return { ...state, fontFamily: action.family }
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.size }
    case "SET_TEXT_COLOR":
      return { ...state, textColor: action.color }
    case "SET_HISTORY":
      return { ...state, canUndo: action.canUndo, canRedo: action.canRedo }
    case "SET_CANVAS_READY":
      return { ...state, isCanvasReady: action.ready }
    default:
      return state
  }
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

const CustomizerContext = createContext<CustomizerContextValue | null>(null)

export function useCustomizer(): CustomizerContextValue {
  const ctx = useContext(CustomizerContext)
  if (!ctx) throw new Error("useCustomizer must be used inside CustomizerProvider")
  return ctx
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

const MAX_HISTORY = 50

export function CustomizerProvider({
  deviceConfig,
  children,
}: {
  deviceConfig: DeviceConfig
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
  })

  const canvasRef = useRef<any | null>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number>(-1)

  /* ---- history helpers --------------------------------------------------- */

  const syncHistoryState = useCallback(() => {
    dispatch({
      type: "SET_HISTORY",
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
    })
  }, [])

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const json = JSON.stringify(canvas.toJSON())
    // trim any redo states after current pointer
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(json)
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
    historyIndexRef.current = historyRef.current.length - 1
    syncHistoryState()
  }, [syncHistoryState])

  const restoreHistory = useCallback(
    (index: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const json = historyRef.current[index]
      if (!json) return

      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll()
        historyIndexRef.current = index
        syncHistoryState()
      })
    },
    [syncHistoryState]
  )

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      restoreHistory(historyIndexRef.current - 1)
    }
  }, [restoreHistory])

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      restoreHistory(historyIndexRef.current + 1)
    }
  }, [restoreHistory])

  /* ---- canvas actions ---------------------------------------------------- */

  const addImage = useCallback(
    (file: File) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string
        if (!dataUrl) return

        const { FabricImage } = await import("fabric")

        // Remove all existing images so the new one overrides
        const existingImages = canvas.getObjects().filter(
          (obj: any) => obj.type === "image"
        )
        existingImages.forEach((obj: any) => canvas.remove(obj))

        const img = await FabricImage.fromURL(dataUrl)

        // Scale to cover the case area, but leave a small margin (4%)
        // so resize handles on every edge stay inside the canvas viewport.
        const scaleX = deviceConfig.canvasWidth / (img.width ?? 1)
        const scaleY = deviceConfig.canvasHeight / (img.height ?? 1)
        const scale = Math.max(scaleX, scaleY) * 0.96
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: deviceConfig.canvasWidth / 2,
          top: deviceConfig.canvasHeight / 2,
          originX: "center",
          originY: "center",
          // Explicit control config — do not rely on prototype alone
          hasControls: true,
          hasBorders: true,
          lockUniScaling: false,
          selectable: true,
          cornerSize: 16,
          touchCornerSize: 48,
          cornerColor: '#ffffff',
          cornerStrokeColor: '#1a1a2e',
          cornerStyle: 'circle' as const,
          transparentCorners: false,
          borderColor: '#1a1a2e',
          padding: 4,
        })

        canvas.add(img)
        img.setCoords()  // recalculate control hit areas
        canvas.setActiveObject(img)
        canvas.requestRenderAll()
        pushHistory()
      }
      reader.readAsDataURL(file)
    },
    [deviceConfig, pushHistory]
  )

  const addText = useCallback(
    async (text?: string) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const { IText } = await import("fabric")
      const t = new IText(text || "Your Text", {
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        fill: state.textColor,
        editable: true,
        // Place at canvas center using explicit coordinates so the text
        // always lands in the visible area regardless of CSS scaling.
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        originX: "center",
        originY: "center",
        // Explicit control config — do not rely on prototype alone
        hasControls: true,
        hasBorders: true,
        lockUniScaling: false,
        selectable: true,
        cornerSize: 16,
        touchCornerSize: 48,
        cornerColor: '#ffffff',
        cornerStrokeColor: '#1a1a2e',
        cornerStyle: 'circle' as const,
        transparentCorners: false,
        borderColor: '#1a1a2e',
        padding: 4,
      })

      canvas.add(t)

      // Force Fabric to measure the text box, then re-center precisely.
      t.initDimensions()
      canvas.centerObject(t)
      t.setCoords()  // recalculate control hit areas

      canvas.setActiveObject(t)
      canvas.requestRenderAll()
      pushHistory()
    },
    [state.fontFamily, state.fontSize, state.textColor, pushHistory]
  )

  const setBackgroundColor = useCallback(
    (color: string) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.backgroundColor = color
      canvas.renderAll()
      dispatch({ type: "SET_BG_COLOR", color })
      pushHistory()
    },
    [pushHistory]
  )

  /* ---- export helpers ---------------------------------------------------- */

  const exportPrintFile = useCallback(
    async (multiplier = 4): Promise<string | null> => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const bpx = deviceConfig.bleedPx
      const cw = deviceConfig.canvasWidth
      const ch = deviceConfig.canvasHeight

      // temporarily remove overlay and clipPath for clean print export
      const savedOverlay = canvas.overlayImage
      const savedClipPath = canvas.clipPath
      canvas.overlayImage = null
      canvas.clipPath = undefined
      canvas.renderAll()

      // Export the visible canvas area (no bleed yet)
      const coreDataUrl = canvas.toDataURL({
        format: "png",
        multiplier,
        quality: 1,
      })

      // restore overlay and clipPath
      canvas.overlayImage = savedOverlay
      canvas.clipPath = savedClipPath
      canvas.renderAll()

      // If no bleed needed, return the core export directly
      if (bpx <= 0) return coreDataUrl

      // Create an offscreen canvas with bleed padding and draw the
      // core export centered within it. The bleed area extends the
      // background color so the print file has no white edges.
      try {
        const outW = (cw + 2 * bpx) * multiplier
        const outH = (ch + 2 * bpx) * multiplier
        const offscreen = document.createElement("canvas")
        offscreen.width = outW
        offscreen.height = outH
        const ctx = offscreen.getContext("2d")
        if (!ctx) return coreDataUrl

        // Fill with the current background color so bleed has color
        ctx.fillStyle = (canvas.backgroundColor as string) || "#ffffff"
        ctx.fillRect(0, 0, outW, outH)

        // Wait for the image to load before drawing
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = coreDataUrl
        })
        ctx.drawImage(img, bpx * multiplier, bpx * multiplier)

        return offscreen.toDataURL("image/png", 1)
      } catch {
        // Fallback: return without bleed
        return coreDataUrl
      }
    },
    [deviceConfig]
  )

  const exportPreview = useCallback((): string | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    return canvas.toDataURL({
      format: "png",
      multiplier: 2,
      quality: 1,
    })
  }, [])

  /* ---- memoised value ---------------------------------------------------- */

  const value = useMemo<CustomizerContextValue>(
    () => ({
      state,
      dispatch,
      canvasRef,
      deviceConfig,
      historyRef,
      historyIndexRef,
      pushHistory,
      undo,
      redo,
      addImage,
      addText,
      setBackgroundColor,
      exportPrintFile,
      exportPreview,
    }),
    [
      state,
      deviceConfig,
      pushHistory,
      undo,
      redo,
      addImage,
      addText,
      setBackgroundColor,
      exportPrintFile,
      exportPreview,
    ]
  )

  return (
    <CustomizerContext.Provider value={value}>
      {children}
    </CustomizerContext.Provider>
  )
}
