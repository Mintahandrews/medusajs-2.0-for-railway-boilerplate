"use client"

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { useCustomizer, type CaseType } from "../../context"
import type { DeviceConfig } from "@lib/device-assets"

/* -------------------------------------------------------------------------- */
/*  Color utilities for case rim                                               */
/* -------------------------------------------------------------------------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  if (h.length === 3) {
    return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
  }
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("")
}

/** Darken a hex color by a factor (0 = black, 1 = original) */
function darken(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * factor, g * factor, b * factor)
}

/** Lighten a hex color by mixing with white */
function lighten(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor)
}

/** Get perceived brightness (0–255) */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/* -------------------------------------------------------------------------- */
/*  Camera module overlay — accurate dimensions from device specs              */
/*                                                                             */
/*  Sources: Apple specs, Samsung specs, Google specs, GSMArena, iFixit        */
/*  All positions expressed as ratios of canvasWidth (cw) so they scale.       */
/*  canvasHeight (ch) used where vertical positioning needs the full ratio.    */
/* -------------------------------------------------------------------------- */

/**
 * Camera family classification.
 *
 * - iphone-16-vertical : iPhone 16 / 16 Plus  — vertical pill, 2 lenses
 * - iphone-diagonal    : iPhone 11–15 standard — diagonal dual in square
 */
function getCameraFamily(handle: string): string {
  // iPhone 16 / 16 Plus — vertical pill (new for 2024)
  if (/^iphone-16(-plus)?$/.test(handle)) return "iphone-16-vertical"
  // iPhone 16 Pro / Pro Max — larger triple module (~39mm)
  if (/^iphone-16-pro/.test(handle)) return "iphone-16-pro-triple"
  // iPhone 11 Pro / Pro Max — triple in ~36mm module
  if (/^iphone-11-pro/.test(handle)) return "iphone-11-triple"
  // iPhone 11 standard — smaller dual in ~25mm module
  if (/^iphone-11$/.test(handle)) return "iphone-11-dual"
  // iPhone 12–15 Pro — triple in ~36mm module
  if (/iphone-\d+-pro/.test(handle)) return "iphone-triple"
  // iPhone 12–15 standard / mini / Plus — diagonal dual in ~28mm module
  if (/^iphone-/.test(handle)) return "iphone-diagonal"
  // Samsung Ultra — 4 individual circles
  if (/samsung.*ultra/.test(handle)) return "samsung-quad"
  // Samsung standard — 3 individual circles
  if (/samsung/.test(handle)) return "samsung-triple"
  // Pixel 8 / 8 Pro — edge-to-edge camera visor bar
  if (/^pixel-8/.test(handle)) return "pixel-8-bar"
  // Pixel 9 / 9 Pro / 9 Pro XL — floating pill camera island
  if (/^pixel-9/.test(handle)) return "pixel-9-pill"
  // OnePlus 12 — triple camera in centered circular module
  if (/^oneplus-12$/.test(handle)) return "oneplus-12-triple"
  // OnePlus 12R — dual camera in centered circular module
  if (/^oneplus-12r/.test(handle)) return "oneplus-12r-dual"
  // Xiaomi 14 Pro — triple camera in large square module
  if (/xiaomi-14-pro/.test(handle)) return "xiaomi-14-pro-triple"
  // Xiaomi 14 — triple camera in smaller square module
  if (/^xiaomi-14$/.test(handle)) return "xiaomi-14-triple"
  // Nothing Phone 2a series — dual camera with LED strip
  if (/^nothing-phone-2a/.test(handle)) return "nothing-2a-dual"
  // iPhone SE 3 — single camera centered
  if (/^iphone-se-/.test(handle)) return "iphone-se-single"
  return "iphone-diagonal"
}

/** Render a single camera component (lens / flash / sensor / mic) */
function Lens({
  cx, cy, d, s, type = "lens",
}: {
  cx: number; cy: number; d: number; s: number
  type?: "lens" | "flash" | "sensor" | "mic"
}) {
  const sz = d * s
  const base: React.CSSProperties = {
    position: "absolute",
    left: (cx - d / 2) * s,
    top: (cy - d / 2) * s,
    width: sz,
    height: sz,
    borderRadius: "50%",
  }

  if (type === "flash") {
    return (
      <div style={{
        ...base,
        background: "radial-gradient(circle, #ffeebb 15%, #cc9944 55%, #886633 100%)",
        boxShadow: `0 0 ${2 * s}px rgba(255,238,187,0.2), 0 0 0 ${0.5 * s}px rgba(150,120,60,0.5)`,
      }} />
    )
  }

  if (type === "sensor") {
    return (
      <div style={{
        ...base,
        background: "radial-gradient(circle, #1a1a1a 50%, #111 100%)",
        boxShadow: `inset 0 0 ${1.5 * s}px rgba(40,40,40,0.5), 0 0 0 ${0.5 * s}px rgba(80,80,80,0.4)`,
      }} />
    )
  }

  if (type === "mic") {
    return <div style={{ ...base, background: "#0a0a0a", boxShadow: `inset 0 0 ${0.5 * s}px rgba(0,0,0,0.5)` }} />
  }

  // Camera lens — realistic multi-ring glass
  const ring = Math.max(1, sz * 0.07)
  return (
    <div style={{ ...base, overflow: "hidden" }}>
      {/* Metal bezel ring with directional lighting */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "linear-gradient(145deg, #555 0%, #2a2a2a 40%, #3a3a3a 100%)",
        boxShadow: `0 0 0 ${0.5 * s}px rgba(70,70,70,0.5)`,
      }} />
      {/* Dark glass lens area */}
      <div style={{
        position: "absolute", inset: ring, borderRadius: "50%",
        background: "radial-gradient(circle at 42% 42%, #1a1a3a 0%, #0a0a18 55%, #151515 100%)",
        boxShadow: `inset 0 0 ${2.5 * s}px rgba(0,0,0,0.6)`,
      }} />
      {/* Glass specular highlight */}
      <div style={{
        position: "absolute", inset: ring * 1.5, borderRadius: "50%",
        background: "linear-gradient(140deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 30%, transparent 50%)",
      }} />
    </div>
  )
}

/**
 * Camera module overlay — positioned absolutely over the canvas container.
 * All values are in canvas-pixels (pre-scale); multiplied by `s` for display.
 */
function CameraOverlay({ config, scale }: { config: DeviceConfig; scale: number }) {
  const family = getCameraFamily(config.handle)
  const cw = config.canvasWidth
  const ch = config.canvasHeight
  const s = scale

  // Common module shadow for raised camera bump effect
  const modShadow = `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.5), 0 ${2 * s}px ${6 * s}px rgba(0,0,0,0.35), 0 0 ${4 * s}px rgba(0,0,0,0.2), 0 ${1 * s}px ${2 * s}px rgba(0,0,0,0.15)`

  /* ================================================================== */
  /*  1. iPhone 16 / 16 Plus — vertical pill, 2 stacked lenses          */
  /*  Real: pill ~14mm W × 30mm H on 71.6mm body, 2×48MP lenses        */
  /*  Flash LED centered between lenses on right side of pill           */
  /* ================================================================== */
  if (family === "iphone-16-vertical") {
    const pillW = Math.round(cw * 0.196)
    const pillH = Math.round(ch * 0.203)
    const pillX = Math.round(cw * 0.112)
    const pillY = Math.round(ch * 0.034)
    const pillR = Math.round(pillW / 2)
    const ld = Math.round(pillW * 0.76)
    const flashD = Math.round(pillW * 0.16)
    const micD = Math.round(pillW * 0.06)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: pillY * s, left: pillX * s,
          width: pillW * s, height: pillH * s,
          borderRadius: pillR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* 48MP Fusion — top */}
        <Lens cx={pillW * 0.50} cy={pillH * 0.30} d={ld} s={s} />
        {/* 12MP Ultra Wide — bottom */}
        <Lens cx={pillW * 0.50} cy={pillH * 0.70} d={ld} s={s} />
        {/* True Tone flash — right side, between lenses */}
        <Lens cx={pillW * 0.84} cy={pillH * 0.50} d={flashD} s={s} type="flash" />
        {/* Mic hole */}
        <Lens cx={pillW * 0.16} cy={pillH * 0.50} d={micD} s={s} type="mic" />
      </div>
    )
  }

  /* ================================================================== */
  /*  2. iPhone 16 Pro / Pro Max — larger triple in ~40mm module         */
  /*  Real: ~40mm on 71.5mm body → 56% width. L-shaped lens layout:     */
  /*  UW=top-left, Main=top-right, Tele=bottom-left                     */
  /*  Flash + LiDAR on right side                                       */
  /* ================================================================== */
  if (family === "iphone-16-pro-triple") {
    const mod = Math.round(cw * 0.560)
    const modX = Math.round(cw * 0.040)
    const modY = Math.round(ch * 0.020)
    const modR = Math.round(mod * 0.25)
    const ld = Math.round(mod * 0.33)
    const flashD = Math.round(mod * 0.08)
    const sensorD = Math.round(mod * 0.065)
    const micD = Math.round(mod * 0.03)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* 48MP Ultra Wide — top-left */}
        <Lens cx={mod * 0.31} cy={mod * 0.31} d={ld} s={s} />
        {/* 48MP Fusion/Main — top-right */}
        <Lens cx={mod * 0.69} cy={mod * 0.31} d={ld} s={s} />
        {/* 12MP 5× Telephoto — bottom-left */}
        <Lens cx={mod * 0.31} cy={mod * 0.69} d={ld} s={s} />
        {/* True Tone flash — right center */}
        <Lens cx={mod * 0.69} cy={mod * 0.57} d={flashD} s={s} type="flash" />
        {/* LiDAR scanner — right bottom */}
        <Lens cx={mod * 0.69} cy={mod * 0.76} d={sensorD} s={s} type="sensor" />
        {/* Mic hole */}
        <Lens cx={mod * 0.50} cy={mod * 0.50} d={micD} s={s} type="mic" />
      </div>
    )
  }

  /* ================================================================== */
  /*  3. iPhone 11 Pro / Pro Max — triple in ~36mm module                */
  /*  Real: equilateral triangle layout (no LiDAR on 11 series)         */
  /*  UW=top-left, Wide=top-right, Tele=bottom-center                   */
  /* ================================================================== */
  if (family === "iphone-11-triple") {
    const mod = Math.round(cw * 0.504)
    const modX = Math.round(cw * 0.050)
    const modY = Math.round(ch * 0.025)
    const modR = Math.round(mod * 0.27)
    const ld = Math.round(mod * 0.34)
    const flashD = Math.round(mod * 0.08)
    const micD = Math.round(mod * 0.03)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* Ultra Wide — top-left */}
        <Lens cx={mod * 0.31} cy={mod * 0.30} d={ld} s={s} />
        {/* Wide — top-right */}
        <Lens cx={mod * 0.69} cy={mod * 0.30} d={ld} s={s} />
        {/* Telephoto — bottom-center */}
        <Lens cx={mod * 0.50} cy={mod * 0.72} d={ld} s={s} />
        {/* Flash — right side between top and bottom lenses */}
        <Lens cx={mod * 0.77} cy={mod * 0.56} d={flashD} s={s} type="flash" />
        {/* Mic */}
        <Lens cx={mod * 0.23} cy={mod * 0.56} d={micD} s={s} type="mic" />
      </div>
    )
  }

  /* ================================================================== */
  /*  4. iPhone 11 standard — smaller dual in ~25mm module               */
  /*  Real: diagonal layout — UW top-left, Wide bottom-right            */
  /* ================================================================== */
  if (family === "iphone-11-dual") {
    const mod = Math.round(cw * 0.330)
    const modX = Math.round(cw * 0.055)
    const modY = Math.round(ch * 0.028)
    const modR = Math.round(mod * 0.28)
    const ld = Math.round(mod * 0.40)
    const flashD = Math.round(mod * 0.11)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* Ultra Wide — top-left */}
        <Lens cx={mod * 0.34} cy={mod * 0.34} d={ld} s={s} />
        {/* Wide — bottom-right */}
        <Lens cx={mod * 0.66} cy={mod * 0.66} d={ld} s={s} />
        {/* Flash — top-right */}
        <Lens cx={mod * 0.70} cy={mod * 0.30} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  5. iPhone 12–15 Pro — triple in ~36–38mm module                   */
  /*  Real: L-shaped layout — UW top-left, Wide top-right,              */
  /*  Tele bottom-left. Flash + LiDAR on right side.                    */
  /* ================================================================== */
  if (family === "iphone-triple") {
    const mod = Math.round(cw * 0.510)
    const modX = Math.round(cw * 0.046)
    const modY = Math.round(ch * 0.022)
    const modR = Math.round(mod * 0.26)
    const ld = Math.round(mod * 0.34)
    const flashD = Math.round(mod * 0.08)
    const sensorD = Math.round(mod * 0.06)
    const micD = Math.round(mod * 0.03)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* Ultra Wide — top-left */}
        <Lens cx={mod * 0.31} cy={mod * 0.31} d={ld} s={s} />
        {/* Wide/Main — top-right */}
        <Lens cx={mod * 0.69} cy={mod * 0.31} d={ld} s={s} />
        {/* Telephoto — bottom-left */}
        <Lens cx={mod * 0.31} cy={mod * 0.69} d={ld} s={s} />
        {/* Flash — right center */}
        <Lens cx={mod * 0.68} cy={mod * 0.56} d={flashD} s={s} type="flash" />
        {/* LiDAR — right bottom */}
        <Lens cx={mod * 0.68} cy={mod * 0.76} d={sensorD} s={s} type="sensor" />
        {/* Mic */}
        <Lens cx={mod * 0.50} cy={mod * 0.50} d={micD} s={s} type="mic" />
      </div>
    )
  }

  /* ================================================================== */
  /*  6. iPhone 12–15 standard / mini / Plus — diagonal dual ~28mm      */
  /*  Real: 12=UW top-right/Wide bottom-left, 13+=reversed diagonal     */
  /*  Using 13+ layout (covers most models): Wide top-right, UW bot-left */
  /* ================================================================== */
  if (family === "iphone-diagonal") {
    const mod = Math.round(cw * 0.392)
    const modX = Math.round(cw * 0.049)
    const modY = Math.round(ch * 0.024)
    const modR = Math.round(mod * 0.28)
    const ld = Math.round(mod * 0.38)
    const flashD = Math.round(mod * 0.10)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* Wide/Main — top-right */}
        <Lens cx={mod * 0.65} cy={mod * 0.35} d={ld} s={s} />
        {/* Ultra Wide — bottom-left */}
        <Lens cx={mod * 0.35} cy={mod * 0.65} d={ld} s={s} />
        {/* Flash — top-left */}
        <Lens cx={mod * 0.30} cy={mod * 0.30} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  7. Samsung Galaxy S23/S24/S25 — 3 individual raised circles       */
  /*  Real: ~13mm lenses vertically stacked on left side, equal gaps    */
  /*  50MP main (top), 12MP UW (mid), 10MP 3× tele (bottom)            */
  /* ================================================================== */
  if (family === "samsung-triple") {
    const ld = Math.round(cw * 0.175)
    const cx = Math.round(cw * 0.165)
    const startY = Math.round(ch * 0.085)
    const gap = Math.round(ch * 0.090)
    const flashD = Math.round(cw * 0.035)
    return (
      <div className="absolute pointer-events-none z-10 inset-0">
        {/* 50MP Main — top */}
        <Lens cx={cx} cy={startY} d={ld} s={s} />
        {/* 12MP Ultra Wide — middle */}
        <Lens cx={cx} cy={startY + gap} d={ld} s={s} />
        {/* 10MP Telephoto — bottom */}
        <Lens cx={cx} cy={startY + gap * 2} d={ld} s={s} />
        {/* Flash */}
        <Lens cx={cx} cy={startY + gap * 2.65} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  8. Samsung Galaxy S Ultra — 4 individual circles, graduated sizes */
  /*  Real: 200MP main > 50MP UW > 10MP 3× tele > 50MP 5× periscope   */
  /*  Vertically stacked on left side, graduated lens diameters          */
  /* ================================================================== */
  if (family === "samsung-quad") {
    const cx = Math.round(cw * 0.155)
    const startY = Math.round(ch * 0.070)
    const gap = Math.round(ch * 0.078)
    const d1 = Math.round(cw * 0.180)
    const d2 = Math.round(cw * 0.165)
    const d3 = Math.round(cw * 0.148)
    const d4 = Math.round(cw * 0.132)
    const flashD = Math.round(cw * 0.035)
    return (
      <div className="absolute pointer-events-none z-10 inset-0">
        {/* 200MP Main — largest, top */}
        <Lens cx={cx} cy={startY} d={d1} s={s} />
        {/* 50MP Ultra Wide */}
        <Lens cx={cx} cy={startY + gap} d={d2} s={s} />
        {/* 10MP 3× Telephoto */}
        <Lens cx={cx} cy={startY + gap * 2.05} d={d3} s={s} />
        {/* 50MP 5× Periscope — smallest */}
        <Lens cx={cx} cy={startY + gap * 3.15} d={d4} s={s} />
        {/* Flash */}
        <Lens cx={cx} cy={startY + gap * 3.15 + gap * 0.72} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  9. Google Pixel 8 / 8 Pro — edge-to-edge camera visor bar         */
  /*  Real: visor ~18mm tall, spans full width flush with edges          */
  /*  Lenses horizontally arranged: Wide, UW, (Pro: Tele), Flash        */
  /* ================================================================== */
  if (family === "pixel-8-bar") {
    const barW = Math.round(cw * 0.94)
    const barH = Math.round(ch * 0.112)
    const barX = Math.round((cw - barW) / 2)
    const barY = Math.round(ch * 0.042)
    const barR = Math.round(barH * 0.14)
    const ld = Math.round(barH * 0.56)
    const flashD = Math.round(barH * 0.22)
    const sensorD = Math.round(barH * 0.14)
    const isPro = config.handle.includes("pro")
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: barY * s, left: barX * s,
          width: barW * s, height: barH * s,
          borderRadius: barR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* Main — left */}
        <Lens cx={barW * 0.17} cy={barH * 0.50} d={ld} s={s} />
        {/* Ultra Wide */}
        <Lens cx={barW * 0.34} cy={barH * 0.50} d={ld} s={s} />
        {/* Telephoto (Pro only) */}
        {isPro && <Lens cx={barW * 0.51} cy={barH * 0.50} d={ld * 0.82} s={s} />}
        {/* Flash */}
        <Lens cx={barW * (isPro ? 0.68 : 0.54)} cy={barH * 0.50} d={flashD} s={s} type="flash" />
        {/* Spectral sensor (Pro only) */}
        {isPro && <Lens cx={barW * 0.79} cy={barH * 0.50} d={sensorD} s={s} type="sensor" />}
      </div>
    )
  }

  /* ================================================================== */
  /*  10. Google Pixel 9 / 9 Pro / 9 Pro XL — floating pill island      */
  /*  Real: pill ~55mm W × 18mm H, doesn't reach edges, rounded ends    */
  /*  Lenses horizontally arranged with more spacing than Pixel 8        */
  /* ================================================================== */
  if (family === "pixel-9-pill") {
    const barW = Math.round(cw * 0.76)
    const barH = Math.round(ch * 0.102)
    const barX = Math.round((cw - barW) / 2)
    const barY = Math.round(ch * 0.048)
    const barR = Math.round(barH / 2)
    const ld = Math.round(barH * 0.58)
    const flashD = Math.round(barH * 0.22)
    const sensorD = Math.round(barH * 0.14)
    const isPro = config.handle.includes("pro")
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: barY * s, left: barX * s,
          width: barW * s, height: barH * s,
          borderRadius: barR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* Main */}
        <Lens cx={barW * 0.20} cy={barH * 0.50} d={ld} s={s} />
        {/* Ultra Wide */}
        <Lens cx={barW * 0.40} cy={barH * 0.50} d={ld} s={s} />
        {/* Telephoto (Pro only) */}
        {isPro && <Lens cx={barW * 0.60} cy={barH * 0.50} d={ld * 0.82} s={s} />}
        {/* Flash */}
        <Lens cx={barW * (isPro ? 0.78 : 0.63)} cy={barH * 0.50} d={flashD} s={s} type="flash" />
        {/* Sensor (Pro only) */}
        {isPro && <Lens cx={barW * 0.88} cy={barH * 0.50} d={sensorD} s={s} type="sensor" />}
      </div>
    )
  }

  /* ================================================================== */
  /*  11. OnePlus 12 — centered circular triple module                  */
  /*  Real: ~31mm diameter circular module, 50MP main + 48MP UW + 64MP 3× */
  /* ================================================================== */
  if (family === "oneplus-12-triple") {
    const mod = Math.round(cw * 0.434)
    const modX = Math.round((cw - mod) / 2)
    const modY = Math.round(ch * 0.025)
    const ld = Math.round(mod * 0.32)
    const flashD = Math.round(mod * 0.08)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: mod / 2 * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* 50MP Main — top */}
        <Lens cx={mod * 0.50} cy={mod * 0.25} d={ld} s={s} />
        {/* 48MP Ultra Wide — bottom-left */}
        <Lens cx={mod * 0.30} cy={mod * 0.65} d={ld * 0.88} s={s} />
        {/* 64MP 3× Telephoto — bottom-right */}
        <Lens cx={mod * 0.70} cy={mod * 0.65} d={ld * 0.88} s={s} />
        {/* Flash */}
        <Lens cx={mod * 0.50} cy={mod * 0.85} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  12. OnePlus 12R — centered circular dual module                   */
  /*  Real: ~31mm diameter, 50MP main + 16MP UW                           */
  /* ================================================================== */
  if (family === "oneplus-12r-dual") {
    const mod = Math.round(cw * 0.434)
    const modX = Math.round((cw - mod) / 2)
    const modY = Math.round(ch * 0.025)
    const ld = Math.round(mod * 0.38)
    const flashD = Math.round(mod * 0.08)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: mod / 2 * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* 50MP Main — top */}
        <Lens cx={mod * 0.50} cy={mod * 0.35} d={ld} s={s} />
        {/* 16MP Ultra Wide — bottom */}
        <Lens cx={mod * 0.50} cy={mod * 0.70} d={ld * 0.82} s={s} />
        {/* Flash */}
        <Lens cx={mod * 0.50} cy={mod * 0.90} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  13. Xiaomi 14 Pro — large square triple module                     */
  /*  Real: ~35mm square, 50MP Leica main + 50MP UW + 50MP 3× tele       */
  /* ================================================================== */
  if (family === "xiaomi-14-pro-triple") {
    const mod = Math.round(cw * 0.490)
    const modX = Math.round((cw - mod) / 2)
    const modY = Math.round(ch * 0.020)
    const modR = Math.round(mod * 0.22)
    const ld = Math.round(mod * 0.30)
    const flashD = Math.round(mod * 0.07)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* 50MP Leica Main — top-left */}
        <Lens cx={mod * 0.30} cy={mod * 0.30} d={ld} s={s} />
        {/* 50MP Ultra Wide — top-right */}
        <Lens cx={mod * 0.70} cy={mod * 0.30} d={ld} s={s} />
        {/* 50MP 3× Telephoto — bottom-center */}
        <Lens cx={mod * 0.50} cy={mod * 0.70} d={ld * 0.88} s={s} />
        {/* Flash */}
        <Lens cx={mod * 0.70} cy={mod * 0.70} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  14. Xiaomi 14 — smaller square triple module                       */
  /*  Real: ~30mm square, similar Leica triple layout                    */
  /* ================================================================== */
  if (family === "xiaomi-14-triple") {
    const mod = Math.round(cw * 0.420)
    const modX = Math.round((cw - mod) / 2)
    const modY = Math.round(ch * 0.022)
    const modR = Math.round(mod * 0.24)
    const ld = Math.round(mod * 0.32)
    const flashD = Math.round(mod * 0.08)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* Main — top-left */}
        <Lens cx={mod * 0.30} cy={mod * 0.30} d={ld} s={s} />
        {/* Ultra Wide — top-right */}
        <Lens cx={mod * 0.70} cy={mod * 0.30} d={ld} s={s} />
        {/* Telephoto — bottom-center */}
        <Lens cx={mod * 0.50} cy={mod * 0.70} d={ld * 0.88} s={s} />
        {/* Flash */}
        <Lens cx={mod * 0.70} cy={mod * 0.70} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  15. Nothing Phone 2a series — dual camera with LED strip           */
  /*  Real: 50MP main + 50MP UW, distinctive LED strip below lenses      */
  /* ================================================================== */
  if (family === "nothing-2a-dual") {
    const mod = Math.round(cw * 0.380)
    const modX = Math.round((cw - mod) / 2)
    const modY = Math.round(ch * 0.025)
    const modR = Math.round(mod * 0.24)
    const ld = Math.round(mod * 0.36)
    const ledW = Math.round(mod * 0.12)
    const ledH = Math.round(mod * 0.04)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* 50MP Main — top */}
        <Lens cx={mod * 0.35} cy={mod * 0.35} d={ld} s={s} />
        {/* 50MP Ultra Wide — bottom */}
        <Lens cx={mod * 0.35} cy={mod * 0.65} d={ld} s={s} />
        {/* LED strip — right side */}
        <div
          style={{
            position: "absolute",
            right: mod * 0.08 * s,
            top: mod * 0.40 * s,
            width: ledW * s,
            height: ledH * s,
            borderRadius: (ledH / 2) * s,
            background: "linear-gradient(90deg, #00ff88 0%, #00cc66 50%, #00ff88 100%)",
            boxShadow: `0 0 ${4 * s}px rgba(0,255,136,0.6)`,
          }}
        />
      </div>
    )
  }

  /* ================================================================== */
  /*  16. iPhone SE 3 — single centered camera                           */
  /*  Real: 12MP single lens, small circular module                      */
  /* ================================================================== */
  if (family === "iphone-se-single") {
    const mod = Math.round(cw * 0.220)
    const modX = Math.round((cw - mod) / 2)
    const modY = Math.round(ch * 0.028)
    const ld = Math.round(mod * 0.70)
    const flashD = Math.round(mod * 0.18)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: mod / 2 * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: modShadow,
        }}
      >
        {/* 12MP Main — centered */}
        <Lens cx={mod * 0.50} cy={mod * 0.50} d={ld} s={s} />
        {/* True Tone flash — right */}
        <Lens cx={mod * 0.80} cy={mod * 0.50} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  return null
}

/* -------------------------------------------------------------------------- */
/*  Case-type visual overlays                                                 */
/* -------------------------------------------------------------------------- */

/** Renders visual effects inside the canvas container based on case type */
function CaseTypeOverlay({
  caseType, w, h, r, s,
}: {
  caseType: CaseType; w: number; h: number; r: number; s: number
}) {
  if (caseType === "clear") {
    // Multi-layer glass effect — sheen, refraction, frosted edge
    return (
      <div className="absolute inset-0 pointer-events-none z-20" style={{ borderRadius: r }}>
        {/* Primary diagonal glass sheen */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: r,
            background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 35%, transparent 55%, rgba(255,255,255,0.06) 80%, rgba(255,255,255,0.12) 100%)",
          }}
        />
        {/* Secondary cross-sheen for depth */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: r,
            background: "linear-gradient(225deg, rgba(255,255,255,0.08) 0%, transparent 30%, transparent 100%)",
          }}
        />
        {/* Subtle prismatic edge highlight — rainbow refraction at the case edge */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: r,
            boxShadow: [
              `inset 0 0 ${12 * s}px rgba(255,255,255,0.12)`,
              `inset 0 0 ${3 * s}px rgba(255,255,255,0.08)`,
              `inset ${2 * s}px 0 ${8 * s}px rgba(140,180,255,0.04)`,
              `inset -${2 * s}px 0 ${8 * s}px rgba(255,180,140,0.04)`,
            ].join(', '),
          }}
        />
      </div>
    )
  }

  if (caseType === "magsafe") {
    // Centered magnet ring
    const ringSize = Math.min(w, h) * 0.42
    const ringThickness = Math.max(2, 3 * s)
    return (
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        <div
          style={{
            width: ringSize,
            height: ringSize,
            borderRadius: "50%",
            border: `${ringThickness}px solid rgba(120,120,120,0.35)`,
            boxShadow: `0 0 ${6 * s}px rgba(100,100,100,0.15), inset 0 0 ${4 * s}px rgba(100,100,100,0.1)`,
          }}
        />
      </div>
    )
  }

  return null
}

/** Tough case corner bumper accents — positioned outside the frame */
function ToughCornerBumpers({
  w, h, r, s, frameWidth,
}: {
  w: number; h: number; r: number; s: number; frameWidth: number
}) {
  const bumpW = Math.max(8, 14 * s)
  const bumpH = Math.max(3, 4 * s)
  const offset = frameWidth + Math.max(1, 1.5 * s)
  const cornerOffset = r * 0.55

  // Each corner gets two small bumps (one horizontal, one vertical)
  const corners = [
    // top-left
    { x: cornerOffset, y: -offset, rotate: 0 },
    { x: -offset, y: cornerOffset, rotate: 90 },
    // top-right
    { x: w - cornerOffset - bumpW, y: -offset, rotate: 0 },
    { x: w + offset - bumpH, y: cornerOffset, rotate: 90 },
    // bottom-left
    { x: cornerOffset, y: h + offset - bumpH, rotate: 0 },
    { x: -offset, y: h - cornerOffset - bumpW, rotate: 90 },
    // bottom-right
    { x: w - cornerOffset - bumpW, y: h + offset - bumpH, rotate: 0 },
    { x: w + offset - bumpH, y: h - cornerOffset - bumpW, rotate: 90 },
  ]

  return (
    <>
      {corners.map((c, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: c.x,
            top: c.y,
            width: c.rotate === 90 ? bumpH : bumpW,
            height: c.rotate === 90 ? bumpW : bumpH,
            borderRadius: bumpH / 2,
            background: "#2a2a2a",
          }}
        />
      ))}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  3D Case shell elements                                                     */
/* -------------------------------------------------------------------------- */

/** Visible side button cutouts on the case edges */
function CaseSideButtons({ h, s, btnBg, btnHighlight }: {
  h: number; s: number; btnBg?: string; btnHighlight?: string
}) {
  const btnDepth = Math.max(2, 3 * s)
  const btnBackground = btnBg || 'linear-gradient(to bottom, #333, #1a1a1a)'
  const btnShadow = `inset 0 ${0.5 * s}px ${1 * s}px ${btnHighlight || 'rgba(255,255,255,0.08)'}`

  const buttons: Array<{ top: number; height: number; side: 'left' | 'right' }> = [
    { top: h * 0.28, height: Math.max(16, 28 * s), side: 'right' },
    { top: h * 0.18, height: Math.max(10, 18 * s), side: 'left' },
    { top: h * 0.27, height: Math.max(10, 18 * s), side: 'left' },
    { top: h * 0.11, height: Math.max(6, 10 * s), side: 'left' },
  ]

  return (
    <>
      {buttons.map((btn, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: btn.top,
            [btn.side]: -btnDepth,
            width: btnDepth,
            height: btn.height,
            borderRadius: btnDepth / 2,
            background: btnBackground,
            boxShadow: btnShadow,
          }}
        />
      ))}
    </>
  )
}

/** Bottom charging port and speaker grille cutouts */
function CaseBottomPort({ w, h, s }: {
  w: number; h: number; s: number
}) {
  const portW = Math.max(10, 16 * s)
  const portH = Math.max(2.5, 3.5 * s)
  const dotD = Math.max(1.5, 2 * s)
  const dotGap = Math.max(3, 4 * s)
  const cx = w / 2
  const bottomY = h - portH / 2

  return (
    <>
      <div
        className="absolute pointer-events-none"
        style={{
          left: cx - portW / 2,
          top: bottomY,
          width: portW,
          height: portH,
          borderRadius: portH / 2,
          background: '#0a0a0a',
          boxShadow: `inset 0 ${0.5 * s}px ${1 * s}px rgba(0,0,0,0.6)`,
        }}
      />
      {[0, 1, 2].map((i) => (
        <div
          key={`sl${i}`}
          className="absolute pointer-events-none"
          style={{
            left: cx - portW / 2 - (i + 1) * dotGap,
            top: bottomY + (portH - dotD) / 2,
            width: dotD,
            height: dotD,
            borderRadius: '50%',
            background: '#0a0a0a',
          }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <div
          key={`sr${i}`}
          className="absolute pointer-events-none"
          style={{
            left: cx + portW / 2 + i * dotGap + dotGap - dotD,
            top: bottomY + (portH - dotD) / 2,
            width: dotD,
            height: dotD,
            borderRadius: '50%',
            background: '#0a0a0a',
          }}
        />
      ))}
    </>
  )
}

/** Material surface overlay — lighting and texture on the case back */
function CaseSurfaceOverlay({ r, s, caseType }: {
  r: number; s: number; caseType: CaseType
}) {
  const isGlossy = caseType === "clear"
  return (
    <div className="absolute inset-0 pointer-events-none z-[15]" style={{ borderRadius: r }}>
      <div
        className="absolute inset-0"
        style={{
          borderRadius: r,
          background: isGlossy
            ? 'linear-gradient(175deg, rgba(255,255,255,0.14) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.06) 100%)'
            : 'linear-gradient(175deg, rgba(255,255,255,0.06) 0%, transparent 25%, transparent 80%, rgba(0,0,0,0.04) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          borderRadius: r,
          boxShadow: [
            `inset ${1 * s}px ${1 * s}px ${3 * s}px rgba(255,255,255,${isGlossy ? 0.12 : 0.05})`,
            `inset -${1 * s}px -${1 * s}px ${3 * s}px rgba(0,0,0,0.08)`,
          ].join(', '),
        }}
      />
    </div>
  )
}

/**
 * The core Fabric.js canvas component.
 */
export default function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const {
    state,
    canvasRef,
    deviceConfig,
    pushHistory,
    undo,
    redo,
    dispatch,
  } = useCustomizer()

  const [displayScale, setDisplayScale] = useState(1)

  /* ---- Keyboard shortcuts ---------------------------------------------- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Don't intercept when user is typing in an input / IText
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      // Check if user is editing an IText on canvas
      const active = canvas.getActiveObject?.()
      if (active?.isEditing) return

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        const objects = canvas.getActiveObjects()
        if (objects?.length) {
          objects.forEach((obj: any) => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.renderAll()
          pushHistory()
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault()
        redo()
      }
    },
    [canvasRef, pushHistory, undo, redo]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  /* ---- Initialise Fabric.js -------------------------------------------- */
  useEffect(() => {
    let fabricCanvas: any = null
    let disposed = false

    async function init() {
      const fabric = await import("fabric")
      if (disposed || !canvasElRef.current) return

      const { canvasWidth, canvasHeight, editorMaskPath } = deviceConfig

      /* 1. Create the canvas ------------------------------------------------ */
      fabricCanvas = new fabric.Canvas(canvasElRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
      })

      /* 2. Apply clipPath — the rounded-rect phone outline ------------------ */
      const clipPath = new fabric.Path(editorMaskPath, {
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        absolutePositioned: true,
      })
      fabricCanvas.clipPath = clipPath

      /* 3. Touch / mobile support ------------------------------------------- */
      // Allow touch gestures on the canvas (pinch to scale/rotate objects)
      fabricCanvas.allowTouchScrolling = false // prevent canvas from scrolling page
      fabricCanvas.on("touch:gesture", (e: any) => {
        // Pinch-to-scale the active object
        if (e.e?.touches?.length === 2 && e.self?.scale) {
          const active = fabricCanvas.getActiveObject()
          if (active) {
            active.scaleX = (active.scaleX || 1) * e.self.scale
            active.scaleY = (active.scaleY || 1) * e.self.scale
            fabricCanvas.renderAll()
          }
        }
      })

      /* 5. Canvas events → history ----------------------------------------- */
      fabricCanvas.on("object:modified", () => pushHistory())

      /* 6. Expose to context & render -------------------------------------- */
      canvasRef.current = fabricCanvas
      fabricCanvas.renderAll()

      // push initial blank state
      pushHistory()
      dispatch({ type: "SET_CANVAS_READY", ready: true })
    }

    init()

    return () => {
      disposed = true
      if (fabricCanvas) {
        fabricCanvas.dispose()
        canvasRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceConfig.handle])

  /* ---- Responsive scaling (ResizeObserver for reliable initial layout) --- */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const cw = deviceConfig.canvasWidth
    const ch = deviceConfig.canvasHeight

    function applyScale() {
      const containerW = el!.clientWidth
      const containerH = el!.clientHeight
      // Guard: skip if container hasn't laid out yet (0×0)
      if (containerW < 1 || containerH < 1) return
      // Reserve space for case edge rim, side buttons, and shadow
      const edgePad = 48
      const scaleW = (containerW - edgePad) / cw
      const scaleH = (containerH - edgePad) / ch
      const newScale = Math.min(1, scaleW, scaleH)
      setDisplayScale(newScale)

      // Tell Fabric about the CSS size so pointer coordinates map correctly
      const canvas = canvasRef.current
      if (canvas) {
        canvas.setDimensions(
          { width: cw * newScale, height: ch * newScale },
          { cssOnly: true }
        )
      }
    }

    // ResizeObserver fires on initial layout AND on every size change
    const ro = new ResizeObserver(() => applyScale())
    ro.observe(el)

    return () => ro.disconnect()
  }, [deviceConfig.canvasWidth, deviceConfig.canvasHeight, canvasRef])

  const caseType = state.caseType
  const bgColor = state.backgroundColor || "#ffffff"

  const r = deviceConfig.cornerRadius
  const w = deviceConfig.canvasWidth * displayScale
  const h = deviceConfig.canvasHeight * displayScale
  const sr = r * displayScale // scaled radius
  const s = displayScale

  /* ---- Case-type visual properties -------------------------------------- */
  // Edge thickness — how thick the case rim looks
  const edgeW = caseType === "tough" ? Math.max(5, 8 * s)
    : caseType === "slim" ? Math.max(2, 3 * s)
    : Math.max(3, 5 * s) // clear & magsafe

  const isGlossy = caseType === "clear"

  // Derive rim color from the user's background color
  const rimColors = useMemo(() => {
    if (isGlossy) {
      return { base: "#c8c8c8", highlight: "rgba(255,255,255,0.4)", shadow: "rgba(0,0,0,0.12)" }
    }
    const lum = luminance(bgColor)
    // For very light backgrounds, use a dark rim (classic black case with light design)
    if (lum > 200) {
      return { base: "#1a1a1a", highlight: "#2e2e2e", shadow: "#111" }
    }
    // For medium/dark backgrounds, derive rim from bg color (colored case)
    const base = darken(bgColor, 0.55)
    const highlight = lighten(base, 0.25)
    const shadow = darken(base, 0.5)
    return { base, highlight, shadow }
  }, [bgColor, isGlossy])

  // Button color matches the rim
  const btnColor = useMemo(() => {
    if (isGlossy) return { bg: "linear-gradient(to bottom, #d0d0d0, #aaa)", shadow: "rgba(255,255,255,0.15)" }
    return {
      bg: `linear-gradient(to bottom, ${rimColors.highlight}, ${rimColors.base})`,
      shadow: `rgba(255,255,255,0.08)`,
    }
  }, [rimColors, isGlossy])

  // Outer case body dimensions (canvas + rim on each side)
  const outerW = w + 2 * edgeW
  const outerH = h + 2 * edgeW
  const outerR = sr + edgeW

  /* ---- Render ----------------------------------------------------------- */
  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full"
    >
      {/* 3D perspective wrapper — subtle tilt for depth feel */}
      <div
        style={{
          perspective: `${Math.max(600, 900 * s)}px`,
          perspectiveOrigin: "50% 42%",
        }}
      >
        {/* Outer case body — the full 3D case shell */}
        <div
          className="relative"
          style={{
            width: outerW,
            height: outerH,
            transform: "rotateX(1.5deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Realistic multi-layer shadow beneath the case */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: edgeW * 0.3,
              borderRadius: outerR,
              boxShadow: [
                `0 ${2 * s}px ${6 * s}px rgba(0,0,0,0.1)`,
                `0 ${6 * s}px ${16 * s}px rgba(0,0,0,0.12)`,
                `0 ${12 * s}px ${32 * s}px rgba(0,0,0,0.14)`,
                `0 ${4 * s}px ${20 * s}px ${rimColors.base}22`,
              ].join(', '),
            }}
          />

          {/* Case rim — the visible edge thickness with 3D lighting gradient */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: 0,
              borderRadius: outerR,
              background: isGlossy
                ? `linear-gradient(155deg, rgba(255,255,255,0.35) 0%, ${rimColors.base} 20%, ${rimColors.base} 80%, ${rimColors.shadow} 100%)`
                : `linear-gradient(155deg, ${rimColors.highlight} 0%, ${rimColors.base} 20%, ${rimColors.base} 80%, ${rimColors.shadow} 100%)`,
              boxShadow: isGlossy
                ? `inset 0 ${1 * s}px ${2 * s}px rgba(255,255,255,0.3), inset 0 -${1 * s}px ${2 * s}px rgba(0,0,0,0.1)`
                : `inset 0 ${1 * s}px ${2 * s}px rgba(255,255,255,0.06), inset 0 -${1 * s}px ${2 * s}px rgba(0,0,0,0.15)`,
            }}
          />

          {/* Inner groove — where the back panel recesses into the rim */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: edgeW - Math.max(1, 0.5 * s),
              top: edgeW - Math.max(1, 0.5 * s),
              right: edgeW - Math.max(1, 0.5 * s),
              bottom: edgeW - Math.max(1, 0.5 * s),
              borderRadius: sr + Math.max(1, 0.5 * s),
              boxShadow: [
                `inset 0 ${0.5 * s}px ${1 * s}px rgba(0,0,0,0.25)`,
                `0 ${0.5 * s}px ${0.5 * s}px rgba(255,255,255,${isGlossy ? 0.15 : 0.04})`,
              ].join(', '),
            }}
          />

          {/* Side buttons — volume (left), power (right), mute (left) */}
          <CaseSideButtons h={outerH} s={s} btnBg={btnColor.bg} btnHighlight={btnColor.shadow} />

          {/* Bottom port and speaker grille cutouts */}
          <CaseBottomPort w={outerW} h={outerH} s={s} />

          {/* Canvas container — the back panel surface, inset by edgeW */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: edgeW,
              top: edgeW,
              width: w,
              height: h,
              borderRadius: sr,
            }}
          >
            <canvas
              ref={canvasElRef}
            />

            {/* Device-specific camera module overlay */}
            <CameraOverlay config={deviceConfig} scale={s} />

            {/* Case-type visual overlays (clear sheen, magsafe ring) */}
            <CaseTypeOverlay caseType={caseType} w={w} h={h} r={sr} s={s} />

            {/* Material surface + lighting overlay */}
            <CaseSurfaceOverlay r={sr} s={s} caseType={caseType} />
          </div>

          {/* Tough case: corner bumper accents on the outer shell */}
          {caseType === "tough" && (
            <ToughCornerBumpers w={outerW} h={outerH} r={outerR} s={s} frameWidth={Math.max(1, 2 * s)} />
          )}
        </div>
      </div>
    </div>
  )
}
