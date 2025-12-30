"use client"

import { Disclosure } from "@headlessui/react"
import { ChevronRight } from "lucide-react"

export type FaqItem = {
  question: string
  answer: string
  category: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const categories = Array.from(new Set(items.map((i) => i.category)))

  return (
    <div className="mt-10 space-y-10">
      {categories.map((category) => {
        const categoryItems = items.filter((i) => i.category === category)

        return (
          <section key={category}>
            <h2 className="text-[18px] font-semibold text-grey-90">{category}</h2>
            <div className="mt-4 space-y-3">
              {categoryItems.map((item) => (
                <Disclosure key={item.question}>
                  {({ open }) => (
                    <div className="rounded-[16px] border border-grey-20 bg-white">
                      <Disclosure.Button className="w-full px-5 py-4 flex items-center justify-between text-left">
                        <span className="text-[14px] font-semibold text-grey-90">
                          {item.question}
                        </span>
                        <ChevronRight
                          size={20}
                          className={`text-grey-50 transition-transform ${open ? "rotate-90" : ""}`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-5 pb-5 text-[14px] leading-[1.7] text-grey-60">
                        {item.answer}
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
