import { ulid } from "ulid"
import * as fs from "fs"
import * as path from "path"
import type {
  PosProductMapping,
  PosOrderSync,
  PosInventorySync,
  PosModuleOptions,
  CreateProductMappingInput,
  CreateOrderSyncInput,
  CreateInventorySyncInput,
  PosSyncStats,
  SyncStatus,
} from "./types"

/** Shape of the persisted JSON file */
type PersistedData = {
  productMappings: [string, PosProductMapping][]
  orderSyncs: [string, PosOrderSync][]
  inventorySyncs: [string, PosInventorySync][]
}

/**
 * POS Module Service
 *
 * Manages sync state between Medusa and Aronium POS.
 * Uses in-memory Maps backed by JSON file persistence.
 * A dedicated sync agent (running alongside Aronium) calls
 * the admin API routes to push/pull data.
 */
export default class PosModuleService {
  private options_: PosModuleOptions
  private productMappings: Map<string, PosProductMapping> = new Map()
  private orderSyncs: Map<string, PosOrderSync> = new Map()
  private inventorySyncs: Map<string, PosInventorySync> = new Map()
  private dataFilePath: string

  constructor(_: any, options: PosModuleOptions) {
    this.options_ = options || {}
    this.dataFilePath = path.resolve(process.cwd(), "data", "pos-sync.json")
    this.loadFromDisk()
  }

  // ─── Persistence ────────────────────────────────────────

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, "utf-8")
        const data: PersistedData = JSON.parse(raw)
        if (data.productMappings) this.productMappings = new Map(data.productMappings)
        if (data.orderSyncs) this.orderSyncs = new Map(data.orderSyncs)
        if (data.inventorySyncs) this.inventorySyncs = new Map(data.inventorySyncs)
        console.log(`[POS] Loaded ${this.productMappings.size} products, ${this.orderSyncs.size} orders, ${this.inventorySyncs.size} inventory records from disk`)
      }
    } catch (err) {
      console.error("[POS] Failed to load persisted data:", err)
    }
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.dataFilePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const data: PersistedData = {
        productMappings: Array.from(this.productMappings.entries()),
        orderSyncs: Array.from(this.orderSyncs.entries()),
        inventorySyncs: Array.from(this.inventorySyncs.entries()),
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), "utf-8")
    } catch (err) {
      console.error("[POS] Failed to persist data:", err)
    }
  }

  // ─── Auth ──────────────────────────────────────────────────

  validateApiKey(key: string): boolean {
    if (!this.options_.apiKey) return true
    return key === this.options_.apiKey
  }

  isEnabled(): boolean {
    return this.options_.enabled !== false
  }

  // ─── Product Mappings ──────────────────────────────────────

  async createProductMapping(
    input: CreateProductMappingInput
  ): Promise<PosProductMapping> {
    const now = new Date().toISOString()
    const mapping: PosProductMapping = {
      id: ulid(),
      medusa_product_id: input.medusa_product_id,
      medusa_variant_id: input.medusa_variant_id,
      pos_product_id: input.pos_product_id || null,
      pos_sku: input.pos_sku || null,
      sync_status: "pending",
      last_synced_at: null,
      error_message: null,
      created_at: now,
      updated_at: now,
    }
    this.productMappings.set(mapping.id, mapping)
    this.saveToDisk()
    return mapping
  }

  async updateProductMapping(
    id: string,
    data: Partial<
      Pick<
        PosProductMapping,
        "pos_product_id" | "pos_sku" | "sync_status" | "error_message"
      >
    >
  ): Promise<PosProductMapping | null> {
    const mapping = this.productMappings.get(id)
    if (!mapping) return null
    const updated = {
      ...mapping,
      ...data,
      updated_at: new Date().toISOString(),
      ...(data.sync_status === "synced"
        ? { last_synced_at: new Date().toISOString() }
        : {}),
    }
    this.productMappings.set(id, updated)
    this.saveToDisk()
    return updated
  }

  async listProductMappings(filters?: {
    sync_status?: SyncStatus
  }): Promise<PosProductMapping[]> {
    let results = Array.from(this.productMappings.values())
    if (filters?.sync_status) {
      results = results.filter((m) => m.sync_status === filters.sync_status)
    }
    return results.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  }

  async getProductMappingByVariant(
    variantId: string
  ): Promise<PosProductMapping | null> {
    for (const mapping of this.productMappings.values()) {
      if (mapping.medusa_variant_id === variantId) return mapping
    }
    return null
  }

  async deleteProductMapping(id: string): Promise<boolean> {
    const deleted = this.productMappings.delete(id)
    if (deleted) this.saveToDisk()
    return deleted
  }

  // ─── Order Syncs ───────────────────────────────────────────

  async createOrderSync(input: CreateOrderSyncInput): Promise<PosOrderSync> {
    const now = new Date().toISOString()
    const sync: PosOrderSync = {
      id: ulid(),
      medusa_order_id: input.medusa_order_id,
      pos_order_id: null,
      sync_status: "pending",
      sync_direction: input.sync_direction || "medusa_to_pos",
      total_amount: input.total_amount,
      currency_code: input.currency_code,
      error_message: null,
      created_at: now,
      updated_at: now,
    }
    this.orderSyncs.set(sync.id, sync)
    this.saveToDisk()
    return sync
  }

  async updateOrderSync(
    id: string,
    data: Partial<
      Pick<PosOrderSync, "pos_order_id" | "sync_status" | "error_message">
    >
  ): Promise<PosOrderSync | null> {
    const sync = this.orderSyncs.get(id)
    if (!sync) return null
    const updated = {
      ...sync,
      ...data,
      updated_at: new Date().toISOString(),
    }
    this.orderSyncs.set(id, updated)
    this.saveToDisk()
    return updated
  }

  async listOrderSyncs(filters?: {
    sync_status?: SyncStatus
  }): Promise<PosOrderSync[]> {
    let results = Array.from(this.orderSyncs.values())
    if (filters?.sync_status) {
      results = results.filter((o) => o.sync_status === filters.sync_status)
    }
    return results.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  }

  async getOrderSyncByOrderId(
    orderId: string
  ): Promise<PosOrderSync | null> {
    for (const sync of this.orderSyncs.values()) {
      if (sync.medusa_order_id === orderId) return sync
    }
    return null
  }

  // ─── Inventory Syncs ───────────────────────────────────────

  async createInventorySync(
    input: CreateInventorySyncInput
  ): Promise<PosInventorySync> {
    const now = new Date().toISOString()
    const sync: PosInventorySync = {
      id: ulid(),
      medusa_variant_id: input.medusa_variant_id,
      pos_product_id: input.pos_product_id,
      medusa_quantity: input.medusa_quantity,
      pos_quantity: input.pos_quantity,
      sync_status: "pending",
      sync_direction: input.sync_direction || "pos_to_medusa",
      last_synced_at: null,
      created_at: now,
      updated_at: now,
    }
    this.inventorySyncs.set(sync.id, sync)
    this.saveToDisk()
    return sync
  }

  async updateInventorySync(
    id: string,
    data: Partial<
      Pick<PosInventorySync, "medusa_quantity" | "pos_quantity" | "sync_status">
    >
  ): Promise<PosInventorySync | null> {
    const sync = this.inventorySyncs.get(id)
    if (!sync) return null
    const updated = {
      ...sync,
      ...data,
      updated_at: new Date().toISOString(),
      ...(data.sync_status === "synced"
        ? { last_synced_at: new Date().toISOString() }
        : {}),
    }
    this.inventorySyncs.set(id, updated)
    this.saveToDisk()
    return updated
  }

  async listInventorySyncs(filters?: {
    sync_status?: SyncStatus
  }): Promise<PosInventorySync[]> {
    let results = Array.from(this.inventorySyncs.values())
    if (filters?.sync_status) {
      results = results.filter((i) => i.sync_status === filters.sync_status)
    }
    return results.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  }

  // ─── Stats ─────────────────────────────────────────────────

  async getStats(): Promise<PosSyncStats> {
    const productList = Array.from(this.productMappings.values())
    const orderList = Array.from(this.orderSyncs.values())
    const inventoryList = Array.from(this.inventorySyncs.values())

    const count = (
      list: { sync_status: SyncStatus }[],
      status: SyncStatus
    ) => list.filter((i) => i.sync_status === status).length

    const allDates = [
      ...productList
        .filter((p) => p.last_synced_at)
        .map((p) => p.last_synced_at!),
      ...inventoryList
        .filter((i) => i.last_synced_at)
        .map((i) => i.last_synced_at!),
      ...orderList.map((o) => o.updated_at),
    ]
    const last_sync_at = allDates.length
      ? allDates.sort().reverse()[0]
      : null

    return {
      products: {
        total: productList.length,
        synced: count(productList, "synced"),
        pending: count(productList, "pending"),
        failed: count(productList, "failed"),
      },
      orders: {
        total: orderList.length,
        synced: count(orderList, "synced"),
        pending: count(orderList, "pending"),
        failed: count(orderList, "failed"),
      },
      inventory: {
        total: inventoryList.length,
        synced: count(inventoryList, "synced"),
        pending: count(inventoryList, "pending"),
        failed: count(inventoryList, "failed"),
      },
      last_sync_at,
    }
  }
}
