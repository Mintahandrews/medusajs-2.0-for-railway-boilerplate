"use client"

import { type DeviceTemplate } from "../types"
import type { CaseMaterial } from "../case-viewer-types"

type PhoneCaseSVGProps = {
  device: DeviceTemplate
  caseColor?: string
  caseMaterial?: CaseMaterial
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  interactive?: boolean
}

/**
 * Realistic phone case back-view SVG vector with:
 * - Case bumper frame with visible depth
 * - Side buttons (volume, power, action)
 * - Camera module with glass lenses
 * - Port cutout at bottom
 * - Material finish overlay (glossy/matte/clear)
 * - Children slot for design texture (rendered via foreignObject)
 */
export default function PhoneCaseSVG({
  device,
  caseColor = "#c0c0c0",
  caseMaterial = "glossy",
  children,
  className = "",
  style,
  interactive = false,
}: PhoneCaseSVGProps) {
  const W = device.width
  const H = device.height
  const R = device.borderRadius
  // Bumper width (visible edge thickness around the design area)
  const BUMPER = 8
  // Outer dimensions (case is slightly larger than the design area)
  const OW = W + BUMPER * 2
  const OH = H + BUMPER * 2
  const OR = R + BUMPER * 0.6

  // Side button rendering offset (buttons sit outside the case body)
  const BTN_W = 4
  const BTN_OFFSET = OW + 1

  // Derive colors
  const bumperDark = adjustBrightness(caseColor, -30)
  const bumperLight = adjustBrightness(caseColor, 30)
  const bumperEdge = adjustBrightness(caseColor, -50)

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={style}>
      <svg
        viewBox={`-${BUMPER + 8} -${BUMPER + 4} ${OW + 20} ${OH + 12}`}
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.2)) drop-shadow(0 6px 12px rgba(0,0,0,0.12))" }}
      >
        <defs>
          {/* Case body gradient */}
          <linearGradient id={`case-body-${device.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bumperLight} />
            <stop offset="50%" stopColor={caseColor} />
            <stop offset="100%" stopColor={bumperDark} />
          </linearGradient>

          {/* Bumper edge gradient (left/right side depth) */}
          <linearGradient id={`bumper-edge-${device.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={bumperEdge} />
            <stop offset="50%" stopColor={caseColor} />
            <stop offset="100%" stopColor={bumperEdge} />
          </linearGradient>

          {/* Camera module gradient */}
          <linearGradient id={`cam-mod-${device.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(30,30,30,0.95)" />
            <stop offset="100%" stopColor="rgba(50,50,50,0.92)" />
          </linearGradient>

          {/* Lens glass gradient */}
          <radialGradient id={`lens-glass-${device.id}`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="rgba(90,90,120,0.5)" />
            <stop offset="35%" stopColor="rgba(20,20,30,0.95)" />
            <stop offset="100%" stopColor="rgba(5,5,15,0.98)" />
          </radialGradient>

          {/* Glossy finish overlay */}
          <linearGradient id={`finish-${device.id}`} x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>

          {/* Button gradient */}
          <linearGradient id={`btn-grad-${device.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={bumperDark} />
            <stop offset="50%" stopColor={adjustBrightness(caseColor, -10)} />
            <stop offset="100%" stopColor={bumperDark} />
          </linearGradient>

          {/* Clip path for design area */}
          <clipPath id={`design-clip-${device.id}`}>
            <rect x={BUMPER} y={BUMPER} width={W} height={H} rx={R} ry={R} />
          </clipPath>
        </defs>

        {/* ── CASE BODY (outer frame / bumper) ── */}
        <rect
          x={0} y={0}
          width={OW} height={OH}
          rx={OR} ry={OR}
          fill={`url(#case-body-${device.id})`}
          stroke={bumperEdge}
          strokeWidth={1}
        />

        {/* Inner edge highlight */}
        <rect
          x={BUMPER - 0.5} y={BUMPER - 0.5}
          width={W + 1} height={H + 1}
          rx={R + 0.5} ry={R + 0.5}
          fill="none"
          stroke="rgba(0,0,0,0.12)"
          strokeWidth={0.5}
        />

        {/* ── DESIGN AREA (clipped to inner rect) ── */}
        <g clipPath={`url(#design-clip-${device.id})`}>
          <foreignObject x={BUMPER} y={BUMPER} width={W} height={H}>
            <div
              style={{ width: W, height: H, position: "relative", overflow: "hidden" }}
            >
              {children}
            </div>
          </foreignObject>
        </g>

        {/* ── CAMERA MODULE ── */}
        {device.cameraCutout && device.cameraStyle !== "individual" && (
          <g transform={`translate(${BUMPER}, ${BUMPER})`}>
            {/* Module background */}
            <rect
              x={device.cameraCutout.x - 3}
              y={device.cameraCutout.y - 3}
              width={device.cameraCutout.width + 6}
              height={device.cameraCutout.height + 6}
              rx={device.cameraCutout.radius + 3}
              ry={device.cameraCutout.radius + 3}
              fill={bumperDark}
              stroke="rgba(80,80,80,0.3)"
              strokeWidth={0.5}
            />
            <rect
              x={device.cameraCutout.x}
              y={device.cameraCutout.y}
              width={device.cameraCutout.width}
              height={device.cameraCutout.height}
              rx={device.cameraCutout.radius}
              ry={device.cameraCutout.radius}
              fill={`url(#cam-mod-${device.id})`}
              stroke="rgba(60,60,60,0.5)"
              strokeWidth={1}
            />
          </g>
        )}

        {/* ── CAMERA LENSES ── */}
        <g transform={`translate(${BUMPER}, ${BUMPER})`}>
          {device.cameraLenses?.map((lens, i) => {
            const isIndividual = device.cameraStyle === "individual"
            return (
              <g key={i}>
                {/* Individual lens bump (Samsung style) */}
                {isIndividual && (
                  <>
                    <circle cx={lens.cx} cy={lens.cy} r={lens.r + 6} fill={bumperDark} />
                    <circle cx={lens.cx} cy={lens.cy} r={lens.r + 4} fill="rgba(40,40,40,0.9)" stroke="rgba(60,60,60,0.3)" strokeWidth={0.5} />
                  </>
                )}
                {/* Lens bezel ring */}
                <circle cx={lens.cx} cy={lens.cy} r={lens.r + 2.5} fill="rgba(35,35,35,0.95)" />
                <circle cx={lens.cx} cy={lens.cy} r={lens.r + 1.5} fill="rgba(55,55,55,0.4)" stroke="rgba(80,80,80,0.25)" strokeWidth={0.4} />
                {/* Lens glass */}
                <circle cx={lens.cx} cy={lens.cy} r={lens.r} fill={`url(#lens-glass-${device.id})`} />
                {/* Lens reflection highlight */}
                <circle
                  cx={lens.cx - lens.r * 0.22}
                  cy={lens.cy - lens.r * 0.22}
                  r={lens.r * 0.22}
                  fill="rgba(255,255,255,0.18)"
                />
                {/* Inner ring detail */}
                <circle cx={lens.cx} cy={lens.cy} r={lens.r * 0.55} fill="none" stroke="rgba(80,80,80,0.15)" strokeWidth={0.3} />
              </g>
            )
          })}
        </g>

        {/* ── SIDE BUTTONS ── */}
        {device.sideButtons?.map((btn, i) => {
          const bx = btn.side === "right" ? BTN_OFFSET : -BTN_W - 1
          return (
            <rect
              key={i}
              x={bx}
              y={btn.y + BUMPER}
              width={BTN_W}
              height={btn.height}
              rx={2}
              ry={2}
              fill={`url(#btn-grad-${device.id})`}
              stroke={bumperEdge}
              strokeWidth={0.5}
            />
          )
        })}

        {/* ── PORT CUTOUT (bottom edge) ── */}
        {device.portCutout && (
          <rect
            x={device.portCutout.x + BUMPER}
            y={OH - 2}
            width={device.portCutout.width}
            height={4}
            rx={device.portCutout.radius || 2}
            ry={device.portCutout.radius || 2}
            fill="rgba(30,30,30,0.7)"
          />
        )}
        {/* Default port cutout if none defined */}
        {!device.portCutout && (
          <rect
            x={OW / 2 - 12}
            y={OH - 2}
            width={24}
            height={4}
            rx={2} ry={2}
            fill="rgba(30,30,30,0.5)"
          />
        )}

        {/* ── MATERIAL FINISH OVERLAY ── */}
        {caseMaterial === "glossy" && (
          <rect
            x={0} y={0}
            width={OW} height={OH}
            rx={OR} ry={OR}
            fill={`url(#finish-${device.id})`}
            pointerEvents="none"
          />
        )}
        {caseMaterial === "matte" && (
          <rect
            x={0} y={0}
            width={OW} height={OH}
            rx={OR} ry={OR}
            fill="rgba(255,255,255,0.03)"
            pointerEvents="none"
          />
        )}
        {caseMaterial === "clear" && (
          <>
            <rect
              x={0} y={0}
              width={OW} height={OH}
              rx={OR} ry={OR}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={0.5}
              pointerEvents="none"
            />
            <rect
              x={BUMPER} y={BUMPER}
              width={W} height={H}
              rx={R} ry={R}
              fill="rgba(255,255,255,0.06)"
              pointerEvents="none"
            />
          </>
        )}

        {/* ── TOP EDGE HIGHLIGHT ── */}
        <rect
          x={0} y={0}
          width={OW} height={OH}
          rx={OR} ry={OR}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.3}
          pointerEvents="none"
        />
      </svg>
    </div>
  )
}

/** Darken or lighten a hex color */
function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}
