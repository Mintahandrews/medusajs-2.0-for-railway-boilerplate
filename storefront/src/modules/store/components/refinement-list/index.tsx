"use client"

import { useState } from "react"

const FilterSection = ({ title, options }: { title: string; options: string[] }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border-b border-gray-200 py-4 last:border-0">
      <button
        className="flex items-center justify-between w-full text-left font-medium text-black focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 flex flex-col gap-3">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 border border-gray-300 rounded-[4px] group-hover:border-black flex items-center justify-center">
                {/* Checkbox state logic would go here */}
              </div>
              <span className="text-gray-500 group-hover:text-black transition-colors">{opt}</span>
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
      <FilterSection title="Brand" options={["Apple", "Samsung", "Xiaomi", "Poco", "OPPO", "Honor", "Motorola", "Nokia", "Realme"]} />
      <FilterSection title="Battery capacity" options={["3000-4000 mAh", "4000-5000 mAh", "5000+ mAh"]} />
      <FilterSection title="Screen type" options={["IPS", "OLED", "AMOLED"]} />
    </div>
  )
}

export default RefinementList
