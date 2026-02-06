"use client"

import dynamic from "next/dynamic"

const CaseDesigner = dynamic(
  () => import("@modules/custom-case/components/case-designer"),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-[1440px] px-5 small:px-10 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 rounded-lg bg-grey-10 animate-pulse" />
          <div className="mt-3 h-5 w-96 rounded-lg bg-grey-10 animate-pulse" />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    ),
  }
)

export default function CaseDesignerWrapper() {
  return <CaseDesigner />
}
