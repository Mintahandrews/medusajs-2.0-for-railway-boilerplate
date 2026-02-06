"use client"

import dynamic from "next/dynamic"

const CaseDesigner = dynamic(
  () => import("@modules/custom-case/components/case-designer"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#f7f7f8]">
        {/* Skeleton top bar */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 h-16">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
              <div className="hidden sm:block space-y-1.5">
                <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-28 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-32 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-gray-900 animate-pulse" />
          </div>
        </div>
        {/* Skeleton body */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-[420px]">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="w-full rounded-[2rem] bg-gray-100 animate-pulse" style={{ aspectRatio: "9/19.5" }} />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-1 h-10 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
                <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="rounded-xl bg-gray-100 animate-pulse" style={{ aspectRatio: "9/16" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  }
)

export default function CaseDesignerWrapper() {
  return <CaseDesigner />
}
