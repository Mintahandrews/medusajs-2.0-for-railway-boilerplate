"use client"

import React from "react"
import { CustomizerProvider } from "../context"
import FabricCanvas from "../components/fabric-canvas"
import Toolbar from "../components/toolbar"
import type { DeviceConfig } from "@lib/device-assets"
import { HttpTypes } from "@medusajs/types"

interface Props {
  deviceConfig: DeviceConfig
  productHandle: string
  product?: HttpTypes.StoreProduct | null
  region?: HttpTypes.StoreRegion | null
}

export default function CustomizerTemplate({ deviceConfig, productHandle, product, region }: Props) {
  return (
    <CustomizerProvider deviceConfig={deviceConfig}>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-gray-100">
        {/* ---- Sidebar (toolbar) ---- */}
        <aside className="w-full lg:w-[320px] shrink-0 order-2 lg:order-1 overflow-hidden">
          <Toolbar product={product} region={region} />
        </aside>

        {/* ---- Canvas area ---- */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 order-1 lg:order-2 min-h-0">
          {/* Device label */}
          <div className="mb-4 text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Design Your Case
            </h1>
            <p className="text-sm text-gray-500">{deviceConfig.name}</p>
          </div>

          {/* Canvas wrapper */}
          <div className="flex-1 flex items-center justify-center w-full max-w-lg min-h-0">
            <FabricCanvas />
          </div>
        </main>
      </div>
    </CustomizerProvider>
  )
}
