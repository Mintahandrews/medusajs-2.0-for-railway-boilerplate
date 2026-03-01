"use client"

import { FormEvent, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function DesktopSearch() {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params as any)?.countryCode as string | undefined
  const [value, setValue] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) {
      return
    }

    router.push(
      countryCode
        ? `/${countryCode}/results/${encodeURIComponent(q)}`
        : `/results/${encodeURIComponent(q)}`
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden small:flex items-center"
      role="search"
      aria-label="Search products"
    >
      <div className="flex h-[40px] items-center gap-x-2 rounded-full border border-grey-20 group-data-[transparent=true]:border-white/30 bg-white group-data-[transparent=true]:bg-white/15 group-data-[transparent=true]:backdrop-blur-sm px-4 w-[260px] medium:w-[320px] transition-colors duration-300">
        <Search className="text-grey-50 group-data-[transparent=true]:text-white/70" size={20} />
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-full w-full bg-transparent text-[14px] text-grey-90 group-data-[transparent=true]:text-white placeholder:text-grey-40 group-data-[transparent=true]:placeholder:text-white/50 focus:outline-none transition-colors duration-300"
        />
      </div>
    </form>
  )
}
