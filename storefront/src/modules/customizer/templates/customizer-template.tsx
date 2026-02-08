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
        <aside className="flex-1 lg:flex-none w-full lg:w-[320px] shrink-0 order-2 lg:order-1 overflow-y-auto">
          <Toolbar product={product} region={region} />
        </aside>

        {/* ---- Canvas area ---- */}
        <main className="h-[50vh] lg:h-auto lg:flex-1 flex flex-col items-center justify-center p-2 lg:p-8 order-1 lg:order-2 min-h-0 shrink-0">
          {/* Device label */}
          <div className="mb-1 lg:mb-4 text-center">
            <h1 className="text-base lg:text-lg font-semibold text-gray-900">
              Design Your Case
            </h1>
            <p className="text-xs lg:text-sm text-gray-500">{deviceConfig.name}</p>
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
