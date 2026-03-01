import { Metadata } from "next"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Our Story | Letscase",
  description:
    "The story behind Letscase — how a passion for mobile tech accessories grew into Ghana's trusted online accessories store.",
}

export default function OurStoryPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      {/* ── Hero ── */}
      <h1 className="text-[32px] font-bold text-grey-90">Our Story</h1>
      <p className="mt-4 text-[17px] leading-[1.8] text-grey-60">
        Every great brand starts with a simple frustration. Ours was the
        struggle to find quality phone accessories in Ghana &mdash; products
        that fit properly, looked good, and didn&rsquo;t fall apart in weeks.
      </p>

      {/* ── Hero brand banner ── */}
      <div className="mt-8 flex items-center justify-center rounded-[16px] border border-grey-20 bg-grey-5 py-12">
        <Image
          src="/Lets Case Logo black.png"
          alt="Letscase logo"
          width={280}
          height={64}
          className="h-16 w-auto object-contain"
          priority
        />
      </div>

      <div className="mt-12 space-y-10">
        {/* ── The beginning ── */}
        <section>
          <h2 className="text-[22px] font-semibold text-grey-90">
            Where it all began
          </h2>
          <p className="mt-3 text-[15px] leading-[1.8] text-grey-60">
            Letscase started in Accra with a straightforward idea: make it
            effortless for Ghanaians to protect and personalise their devices.
            We noticed that most accessory stores offered the same generic
            products with zero guidance on what actually fits. Customers were
            left guessing &mdash; and often ended up with cases that didn&rsquo;t
            clip on properly, screen protectors that bubbled within days, or
            chargers that stopped working after a month.
          </p>
          <p className="mt-3 text-[15px] leading-[1.8] text-grey-60">
            We decided to change that. We started sourcing accessories from
            trusted manufacturers, testing each product ourselves, and building
            clear product listings that tell you exactly which phone models are
            supported &mdash; no guesswork required.
          </p>
        </section>

        {/* ── What drives us ── */}
        <section>
          <h2 className="text-[22px] font-semibold text-grey-90">
            What drives us
          </h2>
          <div className="mt-4 grid grid-cols-1 small:grid-cols-2 gap-4">
            <div className="rounded-[16px] border border-grey-20 bg-white p-5">
              <p className="text-[15px] font-semibold text-grey-90">Quality over quantity</p>
              <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
                We&rsquo;d rather stock 50 products we trust than 500 we
                can&rsquo;t vouch for. Every item in our store has been
                hand-picked for durability, fit, and value.
              </p>
            </div>
            <div className="rounded-[16px] border border-grey-20 bg-white p-5">
              <p className="text-[15px] font-semibold text-grey-90">Real customer support</p>
              <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
                Not sure which case fits your Samsung A55? Message us on
                WhatsApp and we&rsquo;ll tell you within hours &mdash; not days.
                We treat every customer the way we&rsquo;d want to be treated.
              </p>
            </div>
            <div className="rounded-[16px] border border-grey-20 bg-white p-5">
              <p className="text-[15px] font-semibold text-grey-90">Custom designs</p>
              <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
                Your phone case should say something about you. Our custom case
                service lets you turn any photo, design, or artwork into a
                premium printed case &mdash; made right here in Ghana.
              </p>
            </div>
            <div className="rounded-[16px] border border-grey-20 bg-white p-5">
              <p className="text-[15px] font-semibold text-grey-90">Building locally</p>
              <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
                We&rsquo;re proudly Ghanaian. From our Accra-based team to our
                local delivery partners, we&rsquo;re committed to growing the
                tech accessories market right here at home.
              </p>
            </div>
          </div>
        </section>

        {/* ── Milestones ── */}
        <section>
          <h2 className="text-[22px] font-semibold text-grey-90">
            The journey so far
          </h2>
          <div className="mt-4 space-y-0">
            {[
              {
                year: "2022",
                title: "The idea",
                desc: "Frustrated by poor-quality phone accessories, we began researching suppliers and testing products from our living room.",
              },
              {
                year: "2023",
                title: "First sales",
                desc: "Letscase launched online — starting with phone cases and screen protectors. Word spread fast through WhatsApp and Instagram.",
              },
              {
                year: "2024",
                title: "Custom cases & growth",
                desc: "We introduced custom phone case printing and expanded our catalog to include chargers, earphones, speakers, and laptop bags.",
              },
              {
                year: "2025",
                title: "A new chapter",
                desc: "We launched our full e-commerce store with nationwide delivery, in-store pickup, and plans to expand across West Africa.",
              },
            ].map((milestone, i) => (
              <div key={milestone.year} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-[13px] font-bold">
                    {milestone.year}
                  </div>
                  {i < 3 && (
                    <div className="w-px flex-1 bg-grey-20" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-[15px] font-semibold text-grey-90">
                    {milestone.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-[1.7] text-grey-60">
                    {milestone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Our values ── */}
        <section>
          <h2 className="text-[22px] font-semibold text-grey-90">
            What we stand for
          </h2>
          <ul className="mt-4 grid grid-cols-1 small:grid-cols-3 gap-3 text-[14px] text-grey-60">
            <li className="rounded-[14px] border border-grey-20 bg-white px-4 py-4">
              <p className="font-semibold text-grey-90">Compatibility</p>
              <p className="mt-1">
                Every product listing tells you exactly which devices it supports.
              </p>
            </li>
            <li className="rounded-[14px] border border-grey-20 bg-white px-4 py-4">
              <p className="font-semibold text-grey-90">Durability</p>
              <p className="mt-1">
                We test products for daily wear and tear before adding them to our store.
              </p>
            </li>
            <li className="rounded-[14px] border border-grey-20 bg-white px-4 py-4">
              <p className="font-semibold text-grey-90">Transparency</p>
              <p className="mt-1">
                Honest pricing, clear policies, and support you can actually reach.
              </p>
            </li>
          </ul>
        </section>

        {/* ── Looking ahead ── */}
        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-grey-90">
            What&rsquo;s next
          </h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            We&rsquo;re just getting started. Upcoming plans include expanding our
            product range, adding more personalisation options, and partnering with
            local creators to design exclusive collections. Our goal is to become
            the most trusted tech accessories brand in West Africa &mdash; one
            satisfied customer at a time.
          </p>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-[16px] border border-brand/20 bg-brand/5 p-6 text-center">
          <h2 className="text-[18px] font-semibold text-grey-90">
            Join the Letscase community
          </h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60 max-w-lg mx-auto">
            Follow us on social media for new arrivals, behind-the-scenes looks,
            and exclusive deals. Or explore the store and find the perfect
            accessories for your device.
          </p>
          <div className="mt-5 flex flex-col small:flex-row items-center justify-center gap-3">
            <LocalizedClientLink
              href="/store"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-white text-[14px] font-semibold hover:bg-brand-dark transition"
            >
              Shop now
            </LocalizedClientLink>
            <a
              href="https://www.instagram.com/letscase_gh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-brand hover:text-brand transition"
            >
              Follow @letscase_gh
            </a>
            <LocalizedClientLink
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-brand hover:text-brand transition"
            >
              Get in touch
            </LocalizedClientLink>
          </div>
        </section>
      </div>
    </div>
  )
}
