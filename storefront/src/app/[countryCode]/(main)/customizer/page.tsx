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

  // Sort: iPhone first, then Samsung, then Pixel
  const order = ["iPhone", "Samsung Galaxy", "Google Pixel", "Other"]
  return order
    .filter((b) => groups[b]?.length)
    .map((b) => ({ brand: b, devices: groups[b] }))
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
                  {/* Mini phone silhouette */}
                  <div className="w-10 h-16 small:w-12 small:h-20 rounded-lg border-2 border-gray-300 group-hover:border-emerald-500 transition-colors relative overflow-hidden">
                    <div className="absolute top-1 left-1 w-2.5 h-2.5 small:w-3 small:h-3 rounded-sm bg-gray-200 group-hover:bg-emerald-200 transition-colors" />
                  </div>
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
