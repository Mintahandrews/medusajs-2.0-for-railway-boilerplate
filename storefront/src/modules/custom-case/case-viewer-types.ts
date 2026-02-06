/* ── Types & constants for the 3D case viewer ──────────
   Separated from case-viewer-3d.tsx so that importing these
   does NOT pull in Three.js / react-three-fiber at bundle time.
*/

export type CaseMaterial = "glossy" | "matte" | "clear" | "soft-touch"

export const CASE_MATERIALS: { id: CaseMaterial; label: string; desc: string }[] = [
  { id: "glossy", label: "Glossy", desc: "High-shine smooth finish" },
  { id: "matte", label: "Matte", desc: "Smooth non-reflective surface" },
  { id: "clear", label: "Clear", desc: "Transparent protective case" },
  { id: "soft-touch", label: "Soft Touch", desc: "Rubberized grip feel" },
]

export type EnvironmentPreset = "studio" | "city" | "sunset" | "forest" | "night"

export const ENV_PRESETS: { id: EnvironmentPreset; label: string }[] = [
  { id: "studio", label: "Studio" },
  { id: "city", label: "City" },
  { id: "sunset", label: "Sunset" },
  { id: "forest", label: "Forest" },
  { id: "night", label: "Night" },
]

export type CaseViewer3DHandle = {
  screenshot: () => string | null
}
