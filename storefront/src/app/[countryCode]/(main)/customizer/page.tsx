import { Metadata } from "next"
import { DEVICE_CONFIGS } from "@lib/device-assets"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Paintbrush, Smartphone, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Design Your Custom Case | Letscase",
  description:
    "Choose your device and create a one-of-a-kind custom phone case. Upload photos, add text, pick colors — preview your design on a realistic device mockup.",
}

/* Group devices by brand for the selector grid */
type DeviceGroup = { brand: string; devices: { handle: string; name: string }[] }

function getDeviceGroups(): DeviceGroup[] {
  const entries = Object.values(DEVICE_CONFIGS)
  const groups: Record<string, { handle: string; name: string }[]> = {}

  for (const d of entries) {
    let brand = "Other"
    if (d.handle.startsWith("iphone")) brand = "iPhone"
    else if (d.handle.startsWith("samsung")) brand = "Samsung Galaxy"
    else if (d.handle.startsWith("pixel")) brand = "Google Pixel"

    if (!groups[brand]) groups[brand] = []
    groups[brand].push({ handle: d.handle, name: d.name })
  }

  const order = ["iPhone", "Samsung Galaxy", "Google Pixel", "Other"]
  return order
    .filter((b) => groups[b]?.length)
    .map((b) => ({ brand: b, devices: groups[b] }))
}

/**
 * Inline SVG phone-back illustration per device model.
 * Each brand/model shows its distinctive camera arrangement:
 *
 *  iPhone 16/16+      — vertical pill, 2 stacked lenses
 *  iPhone 11–15 std   — square module, diagonal 2 lenses
 *  iPhone Pro/Pro Max  — square module, triangle 3 lenses
 *  Samsung S23–S25     — 3 individual raised circles, vertical
 *  Samsung Ultra       — 4 individual raised circles, vertical
 *  Pixel 8/8 Pro       — full-width camera bar (edge-to-edge)
 *  Pixel 9/9 Pro/XL    — floating pill camera island
 */
function PhoneIcon({ handle }: { handle: string }) {
  const w = 56
  const h = 90
  const r = 10

  // Common phone body
  const body = (
    <rect x="1.5" y="1.5" width={w - 3} height={h - 3} rx={r}
      className="fill-gray-50 stroke-gray-300 group-hover:fill-emerald-50 group-hover:stroke-emerald-500"
      strokeWidth="1.5" />
  )

  /* ---- iPhone 16 / 16 Plus — vertical pill ---- */
  /* Real: pill ~14mm W × 28mm H on 71.6mm-wide body → 19.6% × 19.0% */
  if (/^iphone-16(-plus)?$/.test(handle)) {
    const px = 6, py = 3, pw = 11, ph = 17, pr = 5.5
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {body}
        <rect x={px} y={py} width={pw} height={ph} rx={pr}
          className="fill-gray-300 group-hover:fill-emerald-200" />
        <circle cx={px + pw / 2} cy={py + ph * 0.32} r="4"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        <circle cx={px + pw / 2} cy={py + ph * 0.68} r="4"
          className="fill-gray-500 group-hover:fill-emerald-600" />
      </svg>
    )
  }

  /* ---- iPhone Pro / Pro Max — square module, triangle 3 lenses ---- */
  /* Real: module ~37mm square on 71.5mm-wide body → 51.7% of width */
  if (/iphone-\d+-pro/.test(handle)) {
    const mx = 3, my = 2, ms = 29, mr = 8
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {body}
        <rect x={mx} y={my} width={ms} height={ms} rx={mr}
          className="fill-gray-300 group-hover:fill-emerald-200" />
        {/* Triangle: top-left, top-right, bottom-center */}
        <circle cx={mx + ms * 0.30} cy={my + ms * 0.30} r="4.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        <circle cx={mx + ms * 0.70} cy={my + ms * 0.30} r="4.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        <circle cx={mx + ms * 0.50} cy={my + ms * 0.70} r="4.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        {/* Flash */}
        <circle cx={mx + ms * 0.72} cy={my + ms * 0.70} r="1.5"
          className="fill-amber-300 group-hover:fill-amber-400" />
        {/* LiDAR */}
        <circle cx={mx + ms * 0.28} cy={my + ms * 0.70} r="1.2"
          className="fill-gray-400 group-hover:fill-emerald-400" />
      </svg>
    )
  }

  /* ---- iPhone 11–15 standard / mini / Plus — square module, diagonal 2 lenses ---- */
  /* Real: module ~28mm square on 71.5mm-wide body → 39.2% of width */
  if (/^iphone-/.test(handle)) {
    const mx = 3, my = 2, ms = 22, mr = 6
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {body}
        <rect x={mx} y={my} width={ms} height={ms} rx={mr}
          className="fill-gray-300 group-hover:fill-emerald-200" />
        {/* Diagonal: top-left, bottom-right */}
        <circle cx={mx + ms * 0.33} cy={my + ms * 0.33} r="4"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        <circle cx={mx + ms * 0.67} cy={my + ms * 0.67} r="4"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        {/* Flash */}
        <circle cx={mx + ms * 0.67} cy={my + ms * 0.33} r="1.5"
          className="fill-amber-300 group-hover:fill-amber-400" />
      </svg>
    )
  }

  /* ---- Samsung Ultra — 4 individual raised circles ---- */
  /* Real: lens ~13mm on 79mm-wide body, cx at 15.2%, gap 8.6% of height */
  if (/samsung.*ultra/.test(handle)) {
    const lx = 9, startY = 8, gap = 8
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {body}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <circle cx={lx} cy={startY + i * gap} r="4.5"
              className="fill-gray-200 stroke-gray-400 group-hover:fill-emerald-100 group-hover:stroke-emerald-500" strokeWidth="1" />
            <circle cx={lx} cy={startY + i * gap} r="2.5"
              className="fill-gray-500 group-hover:fill-emerald-600" />
          </g>
        ))}
        {/* Flash */}
        <circle cx={lx} cy={startY + 3 * gap + 6} r="1.5"
          className="fill-amber-300 group-hover:fill-amber-400" />
      </svg>
    )
  }

  /* ---- Samsung S23/S24/S25 standard — 3 individual raised circles ---- */
  /* Real: lens ~13mm on 70.6mm-wide body, cx at 17%, gap 9.5% of height */
  if (/samsung/.test(handle)) {
    const lx = 10, startY = 9, gap = 9
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {body}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <circle cx={lx} cy={startY + i * gap} r="5"
              className="fill-gray-200 stroke-gray-400 group-hover:fill-emerald-100 group-hover:stroke-emerald-500" strokeWidth="1" />
            <circle cx={lx} cy={startY + i * gap} r="3"
              className="fill-gray-500 group-hover:fill-emerald-600" />
          </g>
        ))}
        {/* Flash */}
        <circle cx={lx} cy={startY + 2 * gap + 7} r="1.5"
          className="fill-amber-300 group-hover:fill-amber-400" />
      </svg>
    )
  }

  /* ---- Pixel 8 / 8 Pro — full-width camera bar (edge-to-edge) ---- */
  if (/^pixel-8/.test(handle)) {
    const isPro = handle.includes("pro")
    const barY = 14, barH = 14
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {body}
        {/* Full-width bar that curves into phone edges */}
        <path d={`M1.5 ${barY + r} V${barY} h${w - 3} v${barH} H1.5 V${barY + barH - r}`}
          className="fill-gray-300 group-hover:fill-emerald-200" />
        <circle cx="16" cy={barY + barH / 2} r="4.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        <circle cx="30" cy={barY + barH / 2} r="4.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        {isPro && <circle cx="42" cy={barY + barH / 2} r="3.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />}
        <circle cx={isPro ? 50 : 42} cy={barY + barH / 2} r="1.5"
          className="fill-amber-300 group-hover:fill-amber-400" />
      </svg>
    )
  }

  /* ---- Pixel 9 / 9 Pro / 9 Pro XL — floating pill camera island ---- */
  if (/^pixel-9/.test(handle)) {
    const isPro = handle.includes("pro")
    const barX = 5, barY = 12, barW = w - 10, barH = 16, barR = 8
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        {body}
        {/* Floating pill that doesn't touch edges */}
        <rect x={barX} y={barY} width={barW} height={barH} rx={barR}
          className="fill-gray-300 group-hover:fill-emerald-200" />
        <circle cx={barX + 11} cy={barY + barH / 2} r="4.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        <circle cx={barX + 24} cy={barY + barH / 2} r="4.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />
        {isPro && <circle cx={barX + 35} cy={barY + barH / 2} r="3.5"
          className="fill-gray-500 group-hover:fill-emerald-600" />}
        <circle cx={barX + (isPro ? 43 : 35)} cy={barY + barH / 2} r="1.5"
          className="fill-amber-300 group-hover:fill-amber-400" />
      </svg>
    )
  }

  /* ---- Fallback ---- */
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {body}
    </svg>
  )
}

export default async function CustomizerLandingPage() {
  const groups = getDeviceGroups()

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }} />
        </div>
        <div className="relative mx-auto max-w-[1200px] px-6 py-16 small:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 mb-6">
            <Paintbrush size={14} className="text-emerald-400" />
            <span className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider">
              Case Customizer
            </span>
          </div>
          <h1 className="text-[36px] small:text-[56px] font-bold text-white leading-[1.1] tracking-tight">
            Design Your Dream
            <br />
            <span className="text-emerald-400">Phone Case</span>
          </h1>
          <p className="mt-5 text-[16px] small:text-[18px] text-white/70 max-w-[600px] mx-auto leading-relaxed">
            Choose your device below, then unleash your creativity. Upload photos,
            add text, pick colors — and preview your design with our AI-powered
            device mockup.
          </p>
        </div>
      </section>

      {/* Device selector grid */}
      <section className="mx-auto max-w-[1200px] px-6 py-12 small:py-16">
        {groups.map((group) => (
          <div key={group.brand} className="mb-12 last:mb-0">
            <h2 className="text-[22px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Smartphone size={20} className="text-emerald-600" />
              {group.brand}
            </h2>
            <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-3 small:gap-4">
              {group.devices.map((device) => (
                <LocalizedClientLink
                  key={device.handle}
                  href={`/customizer/${device.handle}`}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 small:p-6 transition-all duration-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-0.5"
                >
                  <PhoneIcon handle={device.handle} />
                  <div className="text-center">
                    <div className="text-[13px] small:text-[14px] font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {device.name}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={14} className="text-emerald-500" />
                  </div>
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Features section */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-12 small:py-16">
          <div className="grid grid-cols-1 small:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <Paintbrush size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">Full Creative Control</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Upload photos, add text, draw, change backgrounds — make it truly yours.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Smartphone size={22} className="text-blue-600" />
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">AI Device Preview</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                See your design on a realistic 3D device mockup before you order.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <ArrowRight size={22} className="text-purple-600" />
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">35+ Devices Supported</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                iPhone 11–16, Samsung Galaxy S23–S25, Google Pixel 8–9 and more.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
