"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

type Testimonial = {
  name: string
  role: string
  avatarUrl: string
  text: string
}

export default function TestimonialsSlider() {
  const items = useMemo<Testimonial[]>(
    () => [
      {
        name: "K. John Smith",
        role: "Tech Enthusiast",
        avatarUrl: "https://i.pravatar.cc/150?img=12",
        text: "I recently purchased the wireless headphones and I'm thoroughly impressed with the sound quality and build. The noise cancellation works like a charm. Highly recommend!",
      },
      {
        name: "David Brown",
        role: "Designer",
        avatarUrl: "https://i.pravatar.cc/150?img=32",
        text: "Letscase has the best customer service! I had an issue with my order and they resolved it immediately. The product quality is top-notch and my iPhone case is perfect. Totally satisfied!",
      },
    ],
    []
  )

  const [index, setIndex] = useState(0)

  return (
    <div className="py-16 small:py-20 border-t border-grey-20">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="flex items-start justify-between gap-8">
          <h2 className="text-[28px] small:text-[32px] font-bold text-grey-90 max-w-[520px]">
            What Our Customers
            <br />
            Are Saying
          </h2>
          <p className="hidden small:block text-[13px] text-grey-50 max-w-[260px]">
            Real and heartfelt experiences from our cherished customers who trust
            and rely on us
          </p>
        </div>

        <div className="mt-12 max-w-[1200px]">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(${index * -100}%)` }}
            >
              {items.map((t) => (
                <div
                  key={t.name}
                  className="w-full shrink-0 grid grid-cols-1 small:grid-cols-2 gap-8"
                >
                  <div className="relative rounded-[16px] border border-grey-20 bg-grey-5 p-8">
                    <div className="absolute right-6 top-6 text-grey-20 text-[48px] leading-none">
                      “
                    </div>
                    <div className="flex items-center gap-4">
                      <Image
                        src={t.avatarUrl}
                        alt={t.name}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-white"
                      />
                      <div>
                        <div className="text-[16px] font-semibold text-grey-90">
                          {t.name}
                        </div>
                        <div className="text-[12px] text-grey-50">{t.role}</div>
                      </div>
                    </div>

                    <div className="mt-5 text-[#F59E0B] text-[16px]">★★★★★</div>
                    <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
                      {t.text}
                    </p>
                  </div>

                  <div className="hidden small:block relative rounded-[16px] border border-grey-20 bg-grey-5 p-8">
                    <div className="absolute right-6 top-6 text-grey-20 text-[48px] leading-none">
                      “
                    </div>
                    <div className="flex items-center gap-4">
                      <Image
                        src={items[(index + 1) % items.length].avatarUrl}
                        alt={items[(index + 1) % items.length].name}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-white"
                      />
                      <div>
                        <div className="text-[16px] font-semibold text-grey-90">
                          {items[(index + 1) % items.length].name}
                        </div>
                        <div className="text-[12px] text-grey-50">
                          {items[(index + 1) % items.length].role}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 text-[#F59E0B] text-[16px]">★★★★★</div>
                    <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
                      {items[(index + 1) % items.length].text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              className="h-10 w-10 rounded-full border border-grey-20 bg-white text-grey-40 disabled:opacity-60"
              aria-label="Previous"
              disabled={index === 0}
              onClick={() => setIndex(0)}
            >
              ←
            </button>
            <button
              type="button"
              className="h-10 w-10 rounded-full border border-grey-20 bg-black text-white hover:bg-brand transition disabled:opacity-60"
              aria-label="Next"
              disabled={index === items.length - 1}
              onClick={() => setIndex(items.length - 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
