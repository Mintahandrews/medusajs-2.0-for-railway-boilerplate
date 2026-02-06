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
  sync_status: SyncStatus
  last_synced_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

/** An order sync record tracking push to POS */
export type PosOrderSync = {
  id: string
  medusa_order_id: string
  pos_order_id: string | null
  sync_status: SyncStatus
  sync_direction: SyncDirection
  total_amount: number
  currency_code: string
  error_message: string | null
  created_at: string
  updated_at: string
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
}

/** Input for creating a product mapping */
export type CreateProductMappingInput = {
  medusa_product_id: string
  medusa_variant_id: string
  pos_product_id?: string
  pos_sku?: string
}

/** Input for recording an order sync */
export type CreateOrderSyncInput = {
  medusa_order_id: string
  total_amount: number
  currency_code: string
  sync_direction?: SyncDirection
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
