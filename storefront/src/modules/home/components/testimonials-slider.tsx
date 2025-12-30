"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
} from "lucide-react"

type Testimonial = {
  name: string
  role: string
  avatarUrl: string
  text: string
  verified?: boolean
}

export default function TestimonialsSlider() {
  const items = useMemo<Testimonial[]>(
    () => [
      {
        name: "K. John Smith",
        role: "Tech Enthusiast",
        avatarUrl: "https://i.pravatar.cc/150?img=12",
        text: "I recently purchased the wireless headphones and I'm thoroughly impressed with the sound quality and build. The noise cancellation works like a charm. Highly recommend!",
        verified: true,
      },
      {
        name: "David Brown",
        role: "Designer",
        avatarUrl: "https://i.pravatar.cc/150?img=32",
        text: "Letscase has the best customer service! I had an issue with my order and they resolved it immediately. The product quality is top-notch and my iPhone case is perfect. Totally satisfied!",
        verified: true,
      },
      {
        name: "Sarah Jenkins",
        role: "Photographer",
        avatarUrl: "https://i.pravatar.cc/150?img=44",
        text: "The camera accessories are game changers. Fast delivery and excellent packaging. Will definitely buy again!",
        verified: true,
      }
    ],
    []
  )

  const [index, setIndex] = useState(0)

  return (
    <div className="py-16 small:py-20 border-t border-grey-20">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="flex items-start justify-between gap-8 mb-12">
          <h2 className="text-[28px] small:text-[32px] font-bold text-grey-90 max-w-[520px]">
            What Our Customers
            <br />
            Are Saying
          </h2>
          <p className="hidden small:block text-[13px] text-grey-50 max-w-[260px] leading-relaxed">
            Real and heartfelt experiences from our cherished customers who trust
            and rely on us
          </p>
        </div>

        <div className="relative overflow-hidden max-w-[1200px] mx-auto">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(${index * -100}%)` }}
          >
            {[0, 1].map((offset) => {
              // Logic to show pairs of testimonials. Use modulo for wrapping if needed.
              // For now, simpler implementation: render items in pairs
              const item1 = items[index % items.length];
              const item2 = items[(index + 1) % items.length];

              return (
                <div key={index} className="w-full shrink-0 grid grid-cols-1 small:grid-cols-2 gap-8">
                  <TestimonialCard item={item1} />
                  <div className="hidden small:block">
                    <TestimonialCard item={item2} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white transition duration-300 hover:bg-brand-dark leading-none"
            aria-label="Previous"
            onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
          >
            <ChevronLeft size={18} className="block" />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white transition duration-300 hover:bg-brand-dark disabled:opacity-50 leading-none"
            aria-label="Next"
            onClick={() => setIndex((i) => (i + 1) % items.length)}
          >
            <ChevronRight size={18} className="block" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="relative rounded-[16px] border border-grey-20 bg-grey-5 p-8 h-full transition duration-300 hover:shadow-md">
      <div className="absolute right-8 top-8 flex items-center gap-1 text-grey-30">
        <Quote size={20} />
        <Quote size={20} />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative h-12 w-12">
          <Image
            src={item.avatarUrl}
            alt={item.name}
            fill
            className="rounded-full border-2 border-white object-cover shadow-sm"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <div className="text-[16px] font-semibold text-grey-90">
              {item.name}
            </div>
            {item.verified ? (
              <BadgeCheck size={16} className="text-brand" />
            ) : null}
          </div>
          <div className="text-[12px] text-grey-50">{item.role}</div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-yellow-400 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
      </div>
      <p className="text-[15px] leading-[1.7] text-grey-60">
        {item.text}
      </p>
    </div>
  )
}
