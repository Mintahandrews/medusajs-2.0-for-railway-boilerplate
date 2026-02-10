"use client"

import { Instagram } from "lucide-react"

const INSTAGRAM_PROFILE = "https://www.instagram.com/letscase_gh/"
const INSTAGRAM_POST = "https://www.instagram.com/p/DNfr_fbNyuT/"
const INSTAGRAM_EMBED = "https://www.instagram.com/p/DNfr_fbNyuT/embed/"

export default function VideoShowcase() {
  return (
    <div className="py-16 small:py-20 bg-gradient-to-b from-white to-grey-5">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[12px] font-semibold uppercase tracking-wider mb-4">
            Follow Us
          </span>
          <h2 className="text-[28px] small:text-[36px] font-bold text-grey-90">
            See Our Products In Action
          </h2>
          <p className="mt-3 text-[14px] text-grey-50 max-w-[500px] mx-auto">
            Follow us on Instagram for the latest custom cases, behind-the-scenes content, and customer showcases
          </p>
        </div>

        <div className="mx-auto max-w-[540px]">
          {/* Instagram Post Embed */}
          <div className="rounded-[20px] overflow-hidden border border-grey-20 bg-white shadow-sm">
            <iframe
              src={INSTAGRAM_EMBED}
              className="w-full border-0"
              style={{ minHeight: 640 }}
              loading="lazy"
              allowTransparency
              title="Letscase Instagram Post"
            />
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col small:flex-row items-center justify-center gap-4">
            <a
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              <Instagram size={18} />
              Follow @letscase_gh
            </a>
            <a
              href={INSTAGRAM_POST}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-grey-20 text-grey-90 text-sm font-semibold hover:bg-grey-5 transition-colors"
            >
              View on Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
