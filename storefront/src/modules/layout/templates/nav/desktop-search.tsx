"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function DesktopSearch() {
  const router = useRouter()
  const [value, setValue] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) {
      return
    }

    router.push(`/results/${encodeURIComponent(q)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden small:flex items-center"
      role="search"
      aria-label="Search products"
    >
      <div className="flex h-[40px] items-center gap-x-2 rounded-full border border-grey-20 bg-white px-4 w-[260px] medium:w-[320px]">
        <Search className="text-grey-50" size={20} />
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
          className="h-full w-full bg-transparent text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none"
        />
      </div>
    </form>
  )
}
