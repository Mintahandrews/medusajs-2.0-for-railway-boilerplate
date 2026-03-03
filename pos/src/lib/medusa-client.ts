/**
 * Medusa Admin API client for POS system.
 * Communicates with the Medusa backend via Admin REST APIs.
 */

function normalizeBackendUrl(raw: string): string {
  const trimmed = (raw || "").trim().replace(/\/+$/, "")
  if (!trimmed) return "http://localhost:9000"

  try {
    const url = new URL(trimmed)
    // Guard against misconfiguration where the admin domain was appended
    // as a path segment, e.g. https://<railway-app>.app/admin.letscasegh.com
    if (url.pathname.startsWith("/admin.")) {
      url.pathname = ""
    }
    return url.toString().replace(/\/+$/, "")
  } catch {
    // If it's not a valid URL, fall back to the raw value (best effort)
    return trimmed
  }
}

const BACKEND_URL = normalizeBackendUrl(
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
)

function buildUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${BACKEND_URL}${p}`
}

type RequestOptions = {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  next?: NextFetchRequestConfig
}

async function getToken(): Promise<string> {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pos_admin_token") || ""
  }
  return process.env.MEDUSA_ADMIN_API_TOKEN || ""
}

async function medusaRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = await getToken()
  const { method = "GET", body, headers = {}, next } = options

  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(next ? { next } : {}),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error?.message || `API Error: ${res.status}`)
  }

  return res.json()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(
  email: string,
  password: string
): Promise<{ token: string }> {
  // Medusa v2 admin auth: POST /auth/user/emailpass
  const res = await fetch(buildUrl("/auth/user/emailpass"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || "Invalid credentials")
  }

  const data = await res.json()
  return { token: data.token }
}

export async function getAdminUser(): Promise<any> {
  return medusaRequest("/admin/users/me")
}

export async function updateAdminUser(
  userId: string,
  data: { metadata?: Record<string, unknown> }
): Promise<any> {
  return medusaRequest(`/admin/users/${userId}`, {
    method: "POST",
    body: data,
  })
}

export async function getAdminUsers(): Promise<{ users: any[] }> {
  return medusaRequest("/admin/users?limit=100")
}

export async function inviteStaffWithRole(data: {
  email: string
  pos_role: string
  pos_pin?: string
}): Promise<any> {
  return medusaRequest("/admin/pos/invite", {
    method: "POST",
    body: data,
  })
}

export async function getPendingInvites(): Promise<{ invites: any[] }> {
  return medusaRequest("/admin/pos/invite")
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(params?: {
  q?: string
  category_id?: string[]
  collection_id?: string[]
  limit?: number
  offset?: number
}): Promise<{ products: any[]; count: number }> {
  const searchParams = new URLSearchParams()
  if (params?.q) searchParams.set("q", params.q)
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.offset) searchParams.set("offset", String(params.offset))
  if (params?.category_id) {
    params.category_id.forEach((id) => searchParams.append("category_id[]", id))
  }
  if (params?.collection_id) {
    params.collection_id.forEach((id) =>
      searchParams.append("collection_id[]", id)
    )
  }
  searchParams.set(
    "fields",
    "+variants.barcode,+variants.ean,+variants.upc,+variants.inventory_quantity,*variants.prices"
  )

  const qs = searchParams.toString()
  return medusaRequest(`/admin/products${qs ? `?${qs}` : ""}`)
}

export async function getProductByBarcode(
  barcode: string
): Promise<{ products: any[] }> {
  return medusaRequest(
    `/admin/products?variants.barcode=${encodeURIComponent(barcode)}&fields=+variants.barcode,+variants.inventory_quantity,*variants.prices`
  )
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<{
  product_categories: any[]
}> {
  return medusaRequest(
    "/admin/product-categories?limit=50&include_descendants_tree=true"
  )
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function getCollections(): Promise<{
  collections: any[]
}> {
  return medusaRequest("/admin/collections?limit=50")
}

// ─── Customers ───────────────────────────────────────────────────────────────

export async function searchCustomers(q: string): Promise<{
  customers: any[]
}> {
  return medusaRequest(`/admin/customers?q=${encodeURIComponent(q)}&limit=10`)
}

export async function createCustomer(data: {
  first_name: string
  last_name: string
  email: string
  phone?: string
}): Promise<{ customer: any }> {
  return medusaRequest("/admin/customers", {
    method: "POST",
    body: data,
  })
}

export async function getCustomer(
  id: string
): Promise<{ customer: any }> {
  return medusaRequest(`/admin/customers/${id}`)
}

// ─── Draft Orders ────────────────────────────────────────────────────────────

export async function createDraftOrder(data: {
  region_id: string
  email: string
  items: Array<{
    variant_id: string
    quantity: number
    unit_price?: number
    metadata?: Record<string, string>
  }>
  shipping_methods: Array<{
    option_id: string
    price: number
  }>
  customer_id?: string
  no_notification_order?: boolean
  metadata?: Record<string, unknown>
}): Promise<{ draft_order: any }> {
  return medusaRequest("/admin/draft-orders", {
    method: "POST",
    body: data,
  })
}

export async function markDraftOrderPaid(
  draftOrderId: string
): Promise<{ order: any }> {
  return medusaRequest(
    `/admin/draft-orders/${draftOrderId}/pay`,
    { method: "POST" }
  )
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(params?: {
  limit?: number
  offset?: number
  created_at?: { gte?: string; lte?: string }
  status?: string[]
}): Promise<{ orders: any[]; count: number }> {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.offset) searchParams.set("offset", String(params.offset))
  if (params?.created_at?.gte)
    searchParams.set("created_at[gte]", params.created_at.gte)
  if (params?.created_at?.lte)
    searchParams.set("created_at[lte]", params.created_at.lte)
  if (params?.status) {
    params.status.forEach((s) => searchParams.append("status[]", s))
  }
  const qs = searchParams.toString()
  return medusaRequest(`/admin/orders${qs ? `?${qs}` : ""}`)
}

export async function getOrder(id: string): Promise<{ order: any }> {
  return medusaRequest(`/admin/orders/${id}`)
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

export async function createRefund(
  orderId: string,
  data: {
    amount: number
    reason: string
    note?: string
  }
): Promise<{ order: any }> {
  return medusaRequest(`/admin/orders/${orderId}/refunds`, {
    method: "POST",
    body: data,
  })
}

// ─── Regions ─────────────────────────────────────────────────────────────────

export async function getRegions(): Promise<{ regions: any[] }> {
  return medusaRequest("/admin/regions")
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export async function getInventoryItems(params?: {
  sku?: string
  limit?: number
}): Promise<{ inventory_items: any[] }> {
  const searchParams = new URLSearchParams()
  if (params?.sku) searchParams.set("sku", params.sku)
  if (params?.limit) searchParams.set("limit", String(params.limit))
  const qs = searchParams.toString()
  return medusaRequest(`/admin/inventory-items${qs ? `?${qs}` : ""}`)
}

// ─── Sales Channels ──────────────────────────────────────────────────────────

export async function getSalesChannels(): Promise<{
  sales_channels: any[]
}> {
  return medusaRequest("/admin/sales-channels")
}

// ─── Shipping Options ────────────────────────────────────────────────────────

export async function getShippingOptions(
  regionId: string
): Promise<{ shipping_options: any[] }> {
  return medusaRequest(
    `/admin/shipping-options?region_id=${regionId}`
  )
}
