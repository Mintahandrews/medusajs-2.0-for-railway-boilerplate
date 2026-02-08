"use client"

import dynamic from "next/dynamic"
import type { DeviceConfig } from "@lib/device-assets"
import { HttpTypes } from "@medusajs/types"

const CustomizerTemplate = dynamic(
  () => import("./customizer-template"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading editor…</p>
        </div>
      </div>
    ),
  }
)

interface Props {
  deviceConfig: DeviceConfig
  productHandle: string
  product?: HttpTypes.StoreProduct | null
  region?: HttpTypes.StoreRegion | null
}

export default function CustomizerLoader({ deviceConfig, productHandle, product, region }: Props) {
  return (
    <CustomizerTemplate
      deviceConfig={deviceConfig}
      productHandle={productHandle}
      product={product}
      region={region}
    />
  )
}
