/** Sync status for a product or order record */
export type SyncStatus = "pending" | "synced" | "failed" | "skipped"

/** Direction of sync operation */
export type SyncDirection = "medusa_to_pos" | "pos_to_medusa"

/** A product mapping between Medusa and Aronium POS */
export type PosProductMapping = {
  id: string
  medusa_product_id: string
  medusa_variant_id: string
  pos_product_id: string | null
  pos_sku: string | null
  /** Aronium barcode (used for barcode search in POS) */
  pos_barcode: string | null
  /** Aronium product name override */
  pos_name: string | null
  /** Tax rate in percent (e.g. 15 = 15%). Maps to Aronium "Default tax rate" */
  tax_rate: number | null
  /** Whether price is tax-inclusive (Aronium: Display and print items with tax included) */
  tax_inclusive: boolean
  /** Cost price for Aronium margin/markup calculation */
  cost_price: number | null
  /** Markup percentage (Aronium auto-calculates sell price from cost + markup) */
  markup: number | null
  sync_status: SyncStatus
  last_synced_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

/**
 * Aronium document type codes.
 * Default format: %YEAR%-%TYPE%-%COUNTER%
 * e.g. first sale in 2023 → "23-200-000001"
 */
export type AroniumDocumentType = "sale" | "refund" | "purchase" | "transfer" | "custom"

export const ARONIUM_DOC_TYPE_CODES: Record<AroniumDocumentType, string> = {
  sale: "200",
  refund: "201",
  purchase: "300",
  transfer: "400",
  custom: "500",
}

/** Aronium document format configuration */
export type AroniumDocumentConfig = {
  /** Document number format. Default: "%YEAR%-%TYPE%-%COUNTER%" */
  format: string
  /** Per-type overrides. e.g. { sale: "INV-%COUNTER%", refund: "R-%COUNTER%" } */
  typeOverrides?: Partial<Record<AroniumDocumentType, string>>
}

/** An order sync record tracking push to POS */
export type PosOrderSync = {
  id: string
  medusa_order_id: string
  pos_order_id: string | null
  /** Aronium document number (e.g. "23-200-000001" or "INV-000123") */
  pos_document_number: string | null
  /** Aronium document type */
  pos_document_type: AroniumDocumentType
  sync_status: SyncStatus
  sync_direction: SyncDirection
  total_amount: number
  /** Tax total for the order */
  tax_total: number
  /** Discount total for the order */
  discount_total: number
  currency_code: string
  /** Aronium payment type used */
  payment_type: AroniumPaymentType
  /** Order line items snapshot for POS push */
  line_items: PosOrderLineItem[]
  error_message: string | null
  created_at: string
  updated_at: string
}

/** Aronium payment type identifier */
export type AroniumPaymentType = "cash" | "card" | "mobile_money" | "voucher" | "credit" | "other"

/** Line item in a POS order sync */
export type PosOrderLineItem = {
  medusa_item_id: string
  title: string
  quantity: number
  unit_price: number
  /** Tax amount per unit */
  tax_amount: number
  /** Discount amount (fixed) or percentage applied to this item */
  discount_amount: number
  /** Aronium discount type: "percentage" or "fixed" */
  discount_type: "percentage" | "fixed" | null
  pos_product_id?: string | null
}

/** An inventory sync record */
export type PosInventorySync = {
  id: string
  medusa_variant_id: string
  pos_product_id: string
  medusa_quantity: number
  pos_quantity: number
  sync_status: SyncStatus
  sync_direction: SyncDirection
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

/** POS module configuration options */
export type PosModuleOptions = {
  apiKey?: string
  enabled?: boolean
  /** Aronium document number format config */
  documentConfig?: AroniumDocumentConfig
  /** Default tax rate for new products (Aronium: Settings > Products > Default tax rate) */
  defaultTaxRate?: number
  /** Whether prices are tax-inclusive by default (Aronium: Display and print items with tax included) */
  taxInclusive?: boolean
  /** Discount apply rule: "before_tax" or "after_tax" (Aronium: Discount apply rule) */
  discountApplyRule?: "before_tax" | "after_tax"
  /** Whether to reset order number on day close (Aronium: Advanced settings) */
  resetOrderNumberOnDayClose?: boolean
}

/** Input for creating a product mapping */
export type CreateProductMappingInput = {
  medusa_product_id: string
  medusa_variant_id: string
  pos_product_id?: string
  pos_sku?: string
  pos_barcode?: string
  pos_name?: string
  tax_rate?: number
  tax_inclusive?: boolean
  cost_price?: number
  markup?: number
}

/** Input for recording an order sync */
export type CreateOrderSyncInput = {
  medusa_order_id: string
  total_amount: number
  tax_total?: number
  discount_total?: number
  currency_code: string
  payment_type?: AroniumPaymentType
  sync_direction?: SyncDirection
  pos_document_type?: AroniumDocumentType
  line_items?: PosOrderLineItem[]
}

/** Input for recording an inventory sync */
export type CreateInventorySyncInput = {
  medusa_variant_id: string
  pos_product_id: string
  medusa_quantity: number
  pos_quantity: number
  sync_direction?: SyncDirection
}

/** Summary stats returned by the POS dashboard */
export type PosSyncStats = {
  products: { total: number; synced: number; pending: number; failed: number }
  orders: { total: number; synced: number; pending: number; failed: number }
  inventory: { total: number; synced: number; pending: number; failed: number }
  last_sync_at: string | null
}
