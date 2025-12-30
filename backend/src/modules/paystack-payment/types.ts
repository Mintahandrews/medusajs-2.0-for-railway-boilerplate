export type PaystackOptions = {
  /** Paystack secret key (starts with `sk_`). */
  secretKey: string

  /** Optional: override Paystack API base URL. */
  baseUrl?: string

  /** Optional: default callback URL for Paystack hosted page. */
  callbackUrl?: string
}

type PaystackResponse<T> = {
  status: boolean
  message: string
  data: T
}

export type PaystackInitializeData = {
  authorization_url: string
  access_code: string
  reference: string
}

export type PaystackInitializeResponse = PaystackResponse<PaystackInitializeData>

export type PaystackVerifyData = {
  id: number
  domain: string
  status: string
  reference: string
  amount: number
  currency: string
  paid_at?: string
  created_at?: string
  channel?: string
  ip_address?: string
  metadata?: Record<string, any>
  customer?: {
    id: number
    email: string
    customer_code?: string
  }
}

export type PaystackVerifyResponse = PaystackResponse<PaystackVerifyData>

export type PaystackWebhookEvent = {
  event: string
  data: {
    status?: string
    reference?: string
    amount?: number
    currency?: string
    metadata?: {
      session_id?: string
      [key: string]: any
    }
    [key: string]: any
  }
}
