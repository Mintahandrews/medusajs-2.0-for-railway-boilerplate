"use client"

import { forwardRef } from "react"
import { formatCurrency, generateReceiptNumber } from "@/lib/utils"
import type { POSCartItem } from "@/lib/store"

export interface ReceiptData {
  items: POSCartItem[]
  subtotal: number
  itemDiscounts: number
  cartDiscount: number
  cartDiscountLabel: string
  total: number
  currency: string
  paymentMethod: string
  cashReceived?: number
  change?: number
  customerName?: string
  staffName: string
  note?: string
  splitPayments?: Array<{ method: string; amount: number }>
}

const Receipt = forwardRef<HTMLDivElement, { data: ReceiptData }>(
  ({ data }, ref) => {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Letscase POS"
    const receiptNo = generateReceiptNumber()
    const now = new Date()

    return (
      <div
        ref={ref}
        className="bg-white text-black p-6 w-[300px] font-mono text-xs leading-relaxed"
      >
        {/* Header */}
        <div className="text-center mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-black.png" alt="Letscase" width={48} height={48} className="mx-auto mb-2" />
          <p className="text-base font-bold">{storeName}</p>
          <p className="text-[10px] text-gray-500">
            {now.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}{" "}
            {now.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-[10px] text-gray-500">Receipt #{receiptNo}</p>
          {data.staffName && (
            <p className="text-[10px] text-gray-500">Staff: {data.staffName}</p>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Customer */}
        {data.customerName && (
          <>
            <p className="text-[10px]">Customer: {data.customerName}</p>
            <div className="border-t border-dashed border-gray-400 my-2" />
          </>
        )}

        {/* Items */}
        <div className="space-y-1.5">
          {data.items.map((item, idx) => {
            const lineTotal = item.unit_price * item.quantity - item.discount_amount
            return (
              <div key={idx}>
                <div className="flex justify-between">
                  <span className="truncate max-w-[180px]">{item.title}</span>
                  <span>{formatCurrency(lineTotal, data.currency)}</span>
                </div>
                <div className="text-[10px] text-gray-500 pl-2">
                  {item.quantity} x {formatCurrency(item.unit_price, data.currency)}
                  {item.discount_amount > 0 && (
                    <span className="ml-1">
                      (-{formatCurrency(item.discount_amount, data.currency)})
                    </span>
                  )}
                </div>
                {item.note && (
                  <div className="text-[10px] text-gray-500 pl-2 italic">
                    Note: {item.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(data.subtotal, data.currency)}</span>
          </div>
          {data.itemDiscounts > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Item Discounts</span>
              <span>-{formatCurrency(data.itemDiscounts, data.currency)}</span>
            </div>
          )}
          {data.cartDiscount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Discount {data.cartDiscountLabel}</span>
              <span>-{formatCurrency(data.cartDiscount, data.currency)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 my-2" />

        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{formatCurrency(data.total, data.currency)}</span>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Payment */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Payment</span>
            <span>{data.paymentMethod}</span>
          </div>
          {data.splitPayments && data.splitPayments.length > 1 && (
            <div className="pl-2 space-y-0.5">
              {data.splitPayments.map((sp, idx) => (
                <div key={idx} className="flex justify-between text-[10px] text-gray-600">
                  <span>{sp.method}</span>
                  <span>{formatCurrency(sp.amount, data.currency)}</span>
                </div>
              ))}
            </div>
          )}
          {data.cashReceived != null && data.cashReceived > 0 && (
            <>
              <div className="flex justify-between">
                <span>Cash Received</span>
                <span>{formatCurrency(data.cashReceived, data.currency)}</span>
              </div>
              {data.change != null && data.change > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Change</span>
                  <span>{formatCurrency(data.change, data.currency)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Note */}
        {data.note && (
          <>
            <div className="border-t border-dashed border-gray-400 my-2" />
            <p className="text-[10px] text-gray-500 italic">Note: {data.note}</p>
          </>
        )}

        {/* Footer */}
        <div className="border-t border-dashed border-gray-400 my-3" />
        <div className="text-center text-[10px] text-gray-500 space-y-0.5">
          <p>Thank you for your purchase!</p>
          <p>{storeName}</p>
          <p className="font-medium">www.letscasegh.com</p>
        </div>
      </div>
    )
  }
)

Receipt.displayName = "Receipt"

export default Receipt
