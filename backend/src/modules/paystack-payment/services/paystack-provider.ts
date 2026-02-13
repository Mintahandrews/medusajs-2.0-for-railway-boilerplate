import crypto from "crypto"

import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CreateAccountHolderInput,
  CreateAccountHolderOutput,
  DeleteAccountHolderInput,
  DeleteAccountHolderOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ListPaymentMethodsInput,
  ListPaymentMethodsOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  SavePaymentMethodInput,
  SavePaymentMethodOutput,
  UpdateAccountHolderInput,
  UpdateAccountHolderOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

import {
  AbstractPaymentProvider,
  isDefined,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"

import { getAmountFromSmallestUnit, getSmallestUnit } from "../utils/get-smallest-unit"
import {
  PaystackInitializeResponse,
  PaystackOptions,
  PaystackVerifyResponse,
  PaystackWebhookEvent,
} from "../types"

type PaystackSessionData = {
  reference?: string
  authorization_url?: string
  access_code?: string
  email?: string
  currency?: string
  amount?: number
  metadata?: Record<string, any>
  session_id?: string
  [key: string]: any
}

const DEFAULT_BASE_URL = "https://api.paystack.co"

function toNumber(value: any): number {
  if (value == null) {
    return 0
  }

  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (typeof value === "bigint") {
    return Number(value)
  }

  if (typeof value === "object") {
    if (typeof (value as any).toNumber === "function") {
      return (value as any).toNumber()
    }

    if (typeof (value as any).toString === "function") {
      const parsed = Number((value as any).toString())
      return Number.isFinite(parsed) ? parsed : 0
    }
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

class PaystackProviderService extends AbstractPaymentProvider<PaystackOptions> {
  static identifier = "paystack"

  protected readonly options_: PaystackOptions
  protected container_: Record<string, unknown>

  static validateOptions(options: PaystackOptions): void {
    if (!isDefined(options.secretKey)) {
      throw new Error("Required option `secretKey` is missing in Paystack provider")
    }
  }

  constructor(cradle: Record<string, unknown>, options: PaystackOptions) {
    // @ts-ignore
    super(...arguments)
    this.container_ = cradle
    this.options_ = options
  }

  protected get baseUrl_(): string {
    return (this.options_.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "")
  }

  protected async request<T>(
    path: string,
    options: Omit<RequestInit, "body"> & { body?: object; idempotencyKey?: string }
  ): Promise<T> {
    const headers = new Headers(options.headers)
    headers.set("Authorization", `Bearer ${this.options_.secretKey}`)
    headers.set("Content-Type", "application/json")

    if (options.idempotencyKey) {
      headers.set("Idempotency-Key", options.idempotencyKey)
    }

    const resp = await fetch(`${this.baseUrl_}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const json = (await resp.json()) as any

    if (!resp.ok) {
      const message =
        json?.message ||
        json?.error ||
        `Paystack API request failed (${resp.status})`
      throw new Error(message)
    }

    if (json && json.status === false) {
      throw new Error(json.message || "Paystack API request failed")
    }

    return json as T
  }

  protected mapVerifyStatus(status?: string): PaymentSessionStatus {
    switch ((status ?? "").toLowerCase()) {
      case "success":
        return PaymentSessionStatus.CAPTURED
      case "failed":
        return PaymentSessionStatus.ERROR
      case "abandoned":
        return PaymentSessionStatus.CANCELED
      case "reversed":
        return PaymentSessionStatus.CANCELED
      case "ongoing":
      case "pending":
      default:
        return PaymentSessionStatus.PENDING
    }
  }

  protected getReference(data?: PaystackSessionData): string | undefined {
    return data?.reference || data?.id
  }

  protected async verifyTransaction(
    data?: PaystackSessionData
  ): Promise<{ status: PaymentSessionStatus; data: PaystackSessionData }>
  {
    const reference = this.getReference(data)

    if (!reference) {
      return {
        status: PaymentSessionStatus.PENDING,
        data: data ?? {},
      }
    }

    const verifyResp = await this.request<PaystackVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
      { method: "GET" }
    )

    const verified = verifyResp.data

    return {
      status: this.mapVerifyStatus(verified?.status),
      data: {
        ...(data ?? {}),
        reference: verified.reference,
        currency: verified.currency?.toLowerCase(),
        amount: verified.amount,
        verification: {
          ...verified,
          amount: getAmountFromSmallestUnit(verified.amount, verified.currency),
        },
      },
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return await this.verifyTransaction(input?.data as PaystackSessionData)
  }

  async initiatePayment({
    currency_code,
    amount,
    data,
    context,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {


    const email =
      (context as any)?.customer?.email ??
      (context as any)?.email ??
      (data as any)?.email

    if (!email) {
      throw new Error(
        "Paystack initiatePayment requires customer email (missing in context/data)"
      )
    }

    const callbackUrl =
      (context as any)?.callback_url ??
      (data as any)?.callback_url ??
      this.options_.callbackUrl

    const amountInSmallestUnit = getSmallestUnit(toNumber(amount), currency_code)

    const metadata =
      data?.metadata && typeof data.metadata === "object" ? (data.metadata as any) : {}

    // Extract channels array (e.g. ["mobile_money"], ["card"], ["bank"]) if provided
    const channels = Array.isArray((data as any)?.channels)
      ? (data as any).channels
      : undefined

    const requestBody: Record<string, unknown> = {
      email,
      amount: amountInSmallestUnit,
      currency: currency_code?.toUpperCase(),
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        session_id: (data as any)?.session_id,
      },
    }

    // Only include channels when explicitly specified to restrict payment options
    if (channels && channels.length > 0) {
      requestBody.channels = channels
    }

    try {
      const initResp = await this.request<PaystackInitializeResponse>(
        "/transaction/initialize",
        {
          method: "POST",
          idempotencyKey: (context as any)?.idempotency_key,
          body: requestBody,
        }
      )
      const reference = initResp.data.reference

      return {
        id: reference,
        status: PaymentSessionStatus.PENDING,
        data: {
          ...(data ?? {}),
          reference,
          authorization_url: initResp.data.authorization_url,
          access_code: initResp.data.access_code,
          email,
          currency: currency_code?.toLowerCase(),
          amount: amountInSmallestUnit,
        },
      }
    } catch (error: any) {
      throw error
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return await this.getPaymentStatus(input)
  }

  async cancelPayment({ data }: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // Paystack doesn't support canceling an initialized transaction through the API.
    return { data }
  }

  async capturePayment({ data }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // Paystack transactions are captured as part of the charge flow.
    const status = await this.verifyTransaction(data as PaystackSessionData)
    return { data: status.data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return await this.cancelPayment(input)
  }

  async refundPayment({
    amount,
    data,
    context,
  }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const reference = this.getReference(data as PaystackSessionData)

    if (!reference) {
      throw new Error("No Paystack reference provided while refunding payment")
    }

    // Paystack expects amount in the smallest currency unit.
    const currency =
      (data as any)?.currency ?? (data as any)?.verification?.currency

    if (!currency) {
      throw new Error("No currency provided while refunding Paystack payment")
    }

    const amountInSmallestUnit = getSmallestUnit(toNumber(amount), currency)

    await this.request("/refund", {
      method: "POST",
      idempotencyKey: (context as any)?.idempotency_key,
      body: {
        transaction: reference,
        amount: amountInSmallestUnit,
      },
    })

    return { data }
  }

  async retrievePayment({ data }: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const verified = await this.verifyTransaction(data as PaystackSessionData)
    return { data: verified.data }
  }

  async updatePayment({ data }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // Paystack doesn't support updating a transaction; just return latest status.
    return await this.getPaymentStatus({ data } as any)
  }

  async createAccountHolder(
    { context }: CreateAccountHolderInput
  ): Promise<CreateAccountHolderOutput> {
    const existing = (context as any)?.account_holder?.data?.id
    const customerId = (context as any)?.customer?.id
    const customerEmail = (context as any)?.customer?.email

    return {
      id: String(existing ?? customerId ?? customerEmail ?? crypto.randomUUID()),
    }
  }

  async updateAccountHolder(
    _input: UpdateAccountHolderInput
  ): Promise<UpdateAccountHolderOutput> {
    return {}
  }

  async deleteAccountHolder(
    _input: DeleteAccountHolderInput
  ): Promise<DeleteAccountHolderOutput> {
    return {}
  }

  async listPaymentMethods(
    _input: ListPaymentMethodsInput
  ): Promise<ListPaymentMethodsOutput> {
    return []
  }

  async savePaymentMethod(
    _input: SavePaymentMethodInput
  ): Promise<SavePaymentMethodOutput> {
    throw new Error("Paystack: savePaymentMethod is not supported")
  }

  async getWebhookActionAndData(
    webhookData: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const event = this.constructWebhookEvent(webhookData)
    const sessionId = event?.data?.metadata?.session_id

    const amount = event.data.amount
      ? getAmountFromSmallestUnit(event.data.amount, event.data.currency ?? "")
      : 0

    switch ((event?.event ?? "").toLowerCase()) {
      case "charge.success":
        return {
          action: PaymentActions.SUCCESSFUL,
          data: {
            session_id: sessionId,
            amount,
          },
        }

      case "charge.failed":
        return {
          action: PaymentActions.FAILED,
          data: {
            session_id: sessionId,
            amount,
          },
        }

      default:
        return { action: PaymentActions.NOT_SUPPORTED }
    }
  }

  constructWebhookEvent(
    data: ProviderWebhookPayload["payload"]
  ): PaystackWebhookEvent {
    const signature =
      (data.headers["x-paystack-signature"] as string | undefined) ??
      (data.headers["X-Paystack-Signature"] as string | undefined)

    if (!signature) {
      throw new Error("Missing Paystack webhook signature")
    }

    const raw =
      typeof data.rawData === "string"
        ? Buffer.from(data.rawData)
        : Buffer.isBuffer(data.rawData)
        ? data.rawData
        : Buffer.from(String(data.rawData ?? ""))

    const computed = crypto
      .createHmac("sha512", this.options_.secretKey)
      .update(raw)
      .digest("hex")

    if (computed !== signature) {
      throw new Error("Invalid Paystack webhook signature")
    }

    return JSON.parse(raw.toString("utf8")) as PaystackWebhookEvent
  }
}

export default PaystackProviderService
