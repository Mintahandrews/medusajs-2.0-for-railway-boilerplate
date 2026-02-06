"use client"

import { usePathname } from "next/navigation"

const WHATSAPP_NUMBER = "233540451001"
const WHATSAPP_MESSAGE = "Hi Letscase! I have a question about your products."

export default function WhatsAppWidget() {
  const pathname = usePathname()

  const isCheckout = pathname?.includes("/checkout")
  if (isCheckout) return null

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:shadow-xl animate-bounce-once group"
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M16.004 2.667A13.26 13.26 0 0 0 2.76 15.893a13.16 13.16 0 0 0 1.795 6.63L2.667 29.333l7.04-1.846a13.3 13.3 0 0 0 6.28 1.6h.006A13.27 13.27 0 0 0 16.004 2.667Zm0 24.266a11.01 11.01 0 0 1-5.612-1.536l-.403-.239-4.176 1.095 1.115-4.074-.263-.418a10.97 10.97 0 0 1-1.685-5.854 11.01 11.01 0 0 1 22.02-.013 11.02 11.02 0 0 1-10.996 11.04Zm6.035-8.242c-.331-.166-1.96-.967-2.264-1.078-.304-.11-.525-.166-.746.166s-.856 1.078-1.05 1.3c-.193.22-.386.248-.717.083a9.04 9.04 0 0 1-2.66-1.64 9.98 9.98 0 0 1-1.84-2.29c-.193-.332-.02-.51.145-.675.148-.149.331-.387.497-.58.166-.194.221-.332.331-.553.111-.222.056-.415-.028-.58-.083-.166-.745-1.798-1.022-2.462-.269-.646-.542-.559-.745-.569l-.636-.01a1.22 1.22 0 0 0-.883.414 3.71 3.71 0 0 0-1.16 2.764c0 1.628 1.188 3.201 1.354 3.422.166.221 2.338 3.57 5.665 5.006.791.342 1.41.546 1.89.699.795.253 1.518.217 2.09.132.638-.095 1.96-.801 2.236-1.575.277-.773.277-1.436.194-1.575-.083-.138-.304-.221-.636-.387Z" />
      </svg>

      {/* Tooltip */}
      <span className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-grey-90 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        Chat with us
        <span className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-grey-90" />
      </span>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wa-bounce {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-8px); }
          40% { transform: translateY(0); }
          60% { transform: translateY(-4px); }
          80% { transform: translateY(0); }
        }
        .animate-bounce-once {
          animation: wa-bounce 1.5s ease-in-out 1s 1;
        }
      `}} />
    </a>
  )
}
