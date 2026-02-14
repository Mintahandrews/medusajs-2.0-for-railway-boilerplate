import { Metadata } from "next"
import { MessageCircle, Instagram, Clock, MapPin } from "lucide-react"

import ContactForm from "@modules/common/components/contact-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Contact | Letscase",
  description:
    "Contact Letscase for order support, product questions, and partnership inquiries.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Contact Letscase</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        We&rsquo;re here to help! Reach out through any of the channels below,
        or fill out the form and we&rsquo;ll get back to you.
      </p>

      {/* Quick-help cards */}
      <div className="mt-8 grid grid-cols-1 small:grid-cols-3 gap-4">
        <div className="rounded-[16px] border border-grey-20 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-grey-90">Order support</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Track orders, update delivery details, and get help with checkout.
          </p>
          <div className="mt-3">
            <LocalizedClientLink
              href="/order-tracking"
              className="text-[14px] font-semibold text-brand hover:text-brand-dark hover:underline transition"
            >
              Go to Order Tracking
            </LocalizedClientLink>
          </div>
        </div>

        <div className="rounded-[16px] border border-grey-20 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-grey-90">Returns &amp; refunds</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Review eligibility and steps before starting a return.
          </p>
          <div className="mt-3">
            <LocalizedClientLink
              href="/returns-and-refunds"
              className="text-[14px] font-semibold text-brand hover:text-brand-dark hover:underline transition"
            >
              View policy
            </LocalizedClientLink>
          </div>
        </div>

        <div className="rounded-[16px] border border-grey-20 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-grey-90">Product questions</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Not sure what fits your device? We&rsquo;ll help you pick.
          </p>
          <div className="mt-3">
            <LocalizedClientLink
              href="/faq"
              className="text-[14px] font-semibold text-brand hover:text-brand-dark hover:underline transition"
            >
              Read FAQs
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Reach us directly */}
      <div className="mt-10 rounded-[16px] border border-grey-20 bg-white p-6">
        <h2 className="text-[18px] font-semibold text-grey-90">
          Reach us directly
        </h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
          For the fastest response, message us on WhatsApp. We also reply on
          Instagram, Snapchat, and TikTok.
        </p>

        <div className="mt-5 grid grid-cols-1 small:grid-cols-2 gap-3">
          {/* WhatsApp */}
          <a
            href="https://wa.me/233540451001?text=Hi%20Letscase!%20I%20need%20help%20with%20my%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 hover:border-brand hover:bg-brand/5 transition group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-grey-90 group-hover:text-brand transition">
                WhatsApp
              </div>
              <div className="text-[13px] text-grey-50">+233 54 045 1001</div>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/letscase_gh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 hover:border-brand hover:bg-brand/5 transition group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-grey-90 group-hover:text-brand transition">
                Instagram
              </div>
              <div className="text-[13px] text-grey-50">@letscase_gh</div>
            </div>
          </a>

          {/* Snapchat */}
          <a
            href="https://www.snapchat.com/add/letscase_gh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 hover:border-brand hover:bg-brand/5 transition group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor"><path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1 1 0 0 0-.123-.064l-.219-.111c-.752-.399-1.339-.902-1.746-1.498a3.4 3.4 0 0 1-.3-.531c-.034-.1-.032-.156-.008-.207a.3.3 0 0 1 .097-.1c.129-.086.262-.173.352-.231.162-.104.289-.187.371-.245.309-.216.525-.446.66-.702a1.4 1.4 0 0 0 .069-1.16c-.205-.538-.713-.872-1.329-.872a1.8 1.8 0 0 0-.487.065c.006-.368-.002-.757-.035-1.139-.116-1.344-.587-2.048-1.077-2.61a4.3 4.3 0 0 0-1.095-.881C9.764.216 8.92 0 7.999 0s-1.76.216-2.505.641c-.412.232-.782.53-1.097.883-.49.562-.96 1.267-1.077 2.61-.033.382-.04.772-.036 1.138a1.8 1.8 0 0 0-.487-.065c-.615 0-1.124.335-1.328.873a1.4 1.4 0 0 0 .067 1.161c.136.256.352.486.66.701.082.058.21.14.371.246l.339.221a.4.4 0 0 1 .109.11c.026.053.027.11-.012.217a3.4 3.4 0 0 1-.295.52c-.398.583-.968 1.077-1.696 1.472-.385.204-.786.34-.955.8-.128.348-.044.743.28 1.075q.18.189.409.31a4.4 4.4 0 0 0 1 .4.7.7 0 0 1 .202.09c.118.104.102.26.259.488q.12.178.296.3c.33.229.701.243 1.095.258.355.014.758.03 1.217.18.19.064.389.186.618.328.55.338 1.305.802 2.566.802 1.262 0 2.02-.466 2.576-.806.227-.14.424-.26.609-.321.46-.152.863-.168 1.218-.181.393-.015.764-.03 1.095-.258a1.14 1.14 0 0 0 .336-.368c.114-.192.11-.327.217-.42a.6.6 0 0 1 .19-.087 4.5 4.5 0 0 0 1.014-.404c.16-.087.306-.2.429-.336l.004-.005c.304-.325.38-.709.256-1.047"/></svg>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-grey-90 group-hover:text-brand transition">
                Snapchat
              </div>
              <div className="text-[13px] text-grey-50">@letscase_gh</div>
            </div>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@letscase_gh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-grey-20 bg-grey-5 px-4 py-3 hover:border-brand hover:bg-brand/5 transition group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grey-10 text-grey-90">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-grey-90 group-hover:text-brand transition">
                TikTok
              </div>
              <div className="text-[13px] text-grey-50">@letscase_gh</div>
            </div>
          </a>
        </div>
      </div>

      {/* Response time & business hours */}
      <div className="mt-6 grid grid-cols-1 small:grid-cols-2 gap-4">
        <div className="rounded-[16px] border border-grey-20 bg-white p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-grey-90">Response times</h3>
            <ul className="mt-2 text-[14px] leading-[1.8] text-grey-60 space-y-0.5">
              <li><strong className="text-grey-90">WhatsApp:</strong> within 2-4 hours</li>
              <li><strong className="text-grey-90">Email / form:</strong> within 24 hours</li>
              <li><strong className="text-grey-90">Social media:</strong> within 12 hours</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[16px] border border-grey-20 bg-white p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-grey-90">Visit our store</h3>
            <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
              Accra, Ghana
            </p>
            <p className="mt-1 text-[13px] text-grey-50">
              Mon - Sat: 8:00 AM - 8:00 PM GMT
            </p>
            <div className="mt-2">
              <LocalizedClientLink
                href="/visit-our-store"
                className="text-[13px] font-semibold text-brand hover:text-brand-dark hover:underline transition"
              >
                Get directions
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="mt-10 rounded-[16px] border border-grey-20 bg-white p-6">
        <h2 className="text-[18px] font-semibold text-grey-90">Send a message</h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
          Fill out the form below and we&rsquo;ll reply to your email within 24 hours.
        </p>
        <ContactForm />
      </div>
    </div>
  )
}