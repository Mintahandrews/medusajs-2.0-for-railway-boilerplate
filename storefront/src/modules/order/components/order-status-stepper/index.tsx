"use client"

import React from "react"

type Step = {
  label: string
  icon: React.ReactNode
}

const STEPS: Step[] = [
  {
    label: "Order placed",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Processing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7H17M3 7V15C3 15.5523 3.44772 16 4 16H16C16.5523 16 17 15.5523 17 15V7M3 7L4.5 4H15.5L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Shipped",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 5H2V13H13M13 5L17 8V13H13M13 5V13M5.5 15.5C5.5 16.3284 4.82843 17 4 17C3.17157 17 2.5 16.3284 2.5 15.5C2.5 14.6716 3.17157 14 4 14C4.82843 14 5.5 14.6716 5.5 15.5ZM16.5 15.5C16.5 16.3284 15.8284 17 15 17C14.1716 17 13.5 16.3284 13.5 15.5C13.5 14.6716 14.1716 14 15 14C15.8284 14 16.5 14.6716 16.5 15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Delivered",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2L3 6V14L10 18L17 14V6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

/**
 * Maps an order status string to a step index (0-3).
 * 0 = Order placed, 1 = Processing, 2 = Shipped, 3 = Delivered
 */
function statusToStepIndex(status: string): number {
  const s = status.toLowerCase().replace(/[_\s]+/g, "")
  if (s.includes("deliver") || s.includes("completed") || s.includes("complete")) return 3
  if (s.includes("ship") || s.includes("intransit") || s.includes("transit")) return 2
  if (s.includes("process") || s.includes("packing") || s.includes("fulfil")) return 1
  // "pending", "placed", "confirmed", or unknown → step 0
  return 0
}

type OrderStatusStepperProps = {
  orderStatus: string
  paymentStatus?: string
}

const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({
  orderStatus,
  paymentStatus,
}) => {
  const currentStep = statusToStepIndex(orderStatus)

  return (
    <div className="w-full py-6">
      {/* Stepper */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line (background) */}
        <div className="absolute top-5 left-5 right-5 h-[2px] bg-grey-20" />
        {/* Connecting line (progress) */}
        <div
          className="absolute top-5 left-5 h-[2px] bg-brand transition-all duration-500"
          style={{
            width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 40px)`,
            maxWidth: "calc(100% - 40px)",
          }}
        />

        {STEPS.map((step, i) => {
          const isCompleted = i <= currentStep
          const isCurrent = i === currentStep

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center">
              {/* Circle */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? "border-brand bg-brand text-white"
                    : "border-grey-20 bg-white text-grey-40"
                } ${isCurrent ? "ring-4 ring-brand-100" : ""}`}
              >
                {step.icon}
              </div>
              {/* Label */}
              <span
                className={`mt-2 text-[12px] font-medium text-center max-w-[80px] leading-tight ${
                  isCompleted ? "text-brand-600" : "text-grey-40"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Status pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        <StatusBadge label="Order" value={orderStatus} />
        {paymentStatus && <StatusBadge label="Payment" value={paymentStatus} />}
      </div>
    </div>
  )
}

function StatusBadge({ label, value }: { label: string; value: string }) {
  const colors = getStatusColors(value)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium ${colors}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}: {value}
    </span>
  )
}

function getStatusColors(status: string): string {
  const s = status.toLowerCase()
  if (s.includes("deliver") || s.includes("complet") || s.includes("paid") || s.includes("captured"))
    return "bg-brand-50 text-brand-700"
  if (s.includes("ship") || s.includes("transit"))
    return "bg-blue-50 text-blue-700"
  if (s.includes("process") || s.includes("packing") || s.includes("fulfil"))
    return "bg-yellow-50 text-yellow-700"
  if (s.includes("cancel") || s.includes("refund") || s.includes("fail"))
    return "bg-red-50 text-red-700"
  if (s.includes("await") || s.includes("pending"))
    return "bg-grey-10 text-grey-60"
  return "bg-grey-10 text-grey-60"
}

export default OrderStatusStepper
export { getStatusColors }
