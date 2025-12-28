"use client"

import { useState } from "react"

const FilterSection = ({ title, options, counts }: { title: string; options: string[]; counts?: number[] }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <button
        className="flex items-center justify-between w-full text-left font-medium text-black focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 flex flex-col gap-3">
          {options.map((opt, index) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 border border-gray-300 rounded-[2px] group-hover:border-black flex items-center justify-center shrink-0">
                {/* Checkbox state logic would go here - visually empty for now unless active */}
              </div>
              <span className="text-black text-sm group-hover:text-black transition-colors flex items-center justify-between w-full pr-2">
                <span>{opt}</span>
                {counts && counts[index] && <span className="text-xs text-gray-400 ml-1">{counts[index]}</span>}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

type RefinementListProps = {
  sortBy: string
  search?: boolean
  'data-testid'?: string
}

const RefinementList = ({ sortBy, 'data-testid': dataTestId }: RefinementListProps) => {
  return (
    <div className="flex flex-col gap-4 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:mr-10">
      <div className="mb-6 relative">
        <input
          type="search"
          placeholder="Search"
          className="w-full bg-[#F5F5F5] border-none rounded-md py-3 pl-10 pr-4 text-sm focus:outline-none placeholder:text-gray-400"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <FilterSection title="Brand" options={["Apple", "Samsung", "Xiaomi", "Poco", "OPPO", "Honor", "Motorola", "Nokia", "Realme"]} counts={[110, 125, 68, 44, 36, 12, 34, 22, 35]} />
      <FilterSection title="Battery capacity" options={["3000-4000 mAh", "4000-5000 mAh", "5000+ mAh"]} />
      <FilterSection title="Screen type" options={["IPS", "OLED", "AMOLED"]} />
      <FilterSection title="Screen diagonal" options={["< 5 inch", "5 - 6 inch", "6+ inch"]} />
      <FilterSection title="Protection class" options={["IP67", "IP68", "None"]} />
      <FilterSection title="Built-in memory" options={["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"]} />
    </div>
  )
}

export default RefinementList
