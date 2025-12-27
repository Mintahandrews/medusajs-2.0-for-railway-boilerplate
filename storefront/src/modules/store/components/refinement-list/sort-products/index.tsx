"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams?: unknown // Optional now, as we handle it internally if not provided
  "data-testid"?: string
}

const sortOptions = [
  { value: "created_at", label: "Newest" },
  { value: "price_asc", label: "Price: Low-High" },
  { value: "price_desc", label: "Price: High-Low" },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
}: SortProductsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortOptions
    const query = createQueryString("sortBy", value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="flex items-center gap-2" data-testid={dataTestId}>
      <span className="text-sm">Sort by:</span>
      <select
        value={sortBy}
        onChange={handleChange}
        className="bg-transparent border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-cyber-accent"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SortProducts
