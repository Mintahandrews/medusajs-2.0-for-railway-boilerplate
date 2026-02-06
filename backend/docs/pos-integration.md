# POS Integration — Aronium Sync

## Overview

The POS module provides bidirectional sync between Medusa and Aronium POS.
It tracks product mappings, order syncs, and inventory levels via an
in-memory store backed by JSON file persistence (`data/pos-sync.json`).

## Architecture

```
┌──────────────┐      Admin API        ┌───────────────────┐
│  Medusa      │  ◄──────────────────► │  POS Sync Agent   │
│  Backend     │   /admin/pos/*        │  (runs alongside  │
│              │   x-pos-api-key       │   Aronium desktop) │
│  POS Module  │                       └───────────────────┘
│  (service)   │
│              │      Subscriber
│  order.placed├──────────────► createOrderSync()
└──────────────┘
```

## Environment Variables

| Variable               | Required | Description                               |
|------------------------|----------|-------------------------------------------|
| `ARONIUM_POS_ENABLED`  | Yes      | Set to `"true"` to enable POS module      |
| `ARONIUM_POS_API_KEY`  | Yes      | Shared secret for POS agent auth          |

## Files

| Path                                          | Purpose                           |
|-----------------------------------------------|-----------------------------------|
| `src/modules/pos/index.ts`                    | Module registration                |
| `src/modules/pos/service.ts`                  | Core service (CRUD + persistence)  |
| `src/modules/pos/types.ts`                    | TypeScript types                   |
| `src/modules/pos/middleware.ts`               | Auth validation helper             |
| `src/api/admin/pos/route.ts`                  | GET /admin/pos (stats)             |
| `src/api/admin/pos/products/route.ts`         | GET/POST product mappings          |
| `src/api/admin/pos/products/[id]/route.ts`    | PATCH/DELETE product mapping       |
| `src/api/admin/pos/orders/route.ts`           | GET/POST order syncs               |
| `src/api/admin/pos/orders/[id]/route.ts`      | PATCH order sync                   |
| `src/api/admin/pos/inventory/route.ts`        | GET/POST inventory syncs           |
| `src/subscribers/order-pos-sync.ts`           | Auto-queue orders on placement     |
| `src/workflows/pos-sync-orders.ts`            | Workflow: mark order synced        |
| `src/admin/routes/pos/page.tsx`               | Admin dashboard page               |

## API Endpoints

All routes are under `/admin/pos` and require either:
- Admin session cookie (dashboard requests), or
- `x-pos-api-key` header (sync agent requests)

### Stats
- `GET /admin/pos` → `{ stats: PosSyncStats }`

### Products
- `GET /admin/pos/products?sync_status=pending` → `{ product_mappings: [] }`
- `POST /admin/pos/products` → `{ product_mapping: {} }`
- `PATCH /admin/pos/products/:id` → `{ product_mapping: {} }`
- `DELETE /admin/pos/products/:id` → `{ id, deleted: true }`

### Orders
- `GET /admin/pos/orders?sync_status=pending` → `{ order_syncs: [] }`
- `POST /admin/pos/orders` → `{ order_sync: {} }`
- `PATCH /admin/pos/orders/:id` → `{ order_sync: {} }`

### Inventory
- `GET /admin/pos/inventory?sync_status=pending` → `{ inventory_syncs: [] }`
- `POST /admin/pos/inventory` → `{ inventory_sync: {} }`

## Sync Flow

### Products (Medusa → POS)
1. Admin or agent creates a product mapping via `POST /admin/pos/products`
2. Agent reads pending mappings via `GET /admin/pos/products?sync_status=pending`
3. Agent pushes product to Aronium, then `PATCH /admin/pos/products/:id` with `sync_status: "synced"`

### Orders (Medusa → POS)
1. Customer places an order → `order.placed` subscriber fires
2. Subscriber creates an order sync record with `sync_status: "pending"`
3. Agent polls `GET /admin/pos/orders?sync_status=pending`
4. Agent pushes order to Aronium, then `PATCH /admin/pos/orders/:id` with `sync_status: "synced"`

### Inventory (POS → Medusa)
1. Agent reads inventory levels from Aronium
2. Agent posts to `POST /admin/pos/inventory` with quantities
3. Medusa inventory can be updated via the inventory module

## Aronium POS Reference

Based on [Aronium Getting Started](https://help.aronium.com/hc/en-us/categories/201073245-Getting-Started).

### Products
- **Barcode search** — Products can be found by barcode, code, or name
- **Tax rate** — Per-product tax rate (e.g. 15%); inherits from default tax rate
- **Tax-inclusive pricing** — Prices displayed/printed with tax included
- **Cost price & markup** — Aronium calculates sell price from cost + markup %
- **Negative inventory prevention** — Optional warning/block when stock goes below 0

### Orders & Payments
- **Payment types** — Cash, card, mobile money, voucher, credit, other
- **Discount types** — Percentage or fixed, per-item or per-order
- **Discount apply rule** — Before tax or after tax (affects totals)
- **Order number reset** — Can reset on day close (Advanced settings)
- **Separate row per item** — Each unit on its own line vs merged quantities

### Module Options
```typescript
{
  apiKey: "your-shared-secret",
  enabled: true,
  defaultTaxRate: 15,           // Aronium: Settings > Products > Default tax rate
  taxInclusive: true,           // Aronium: Display and print items with tax included
  discountApplyRule: "after_tax", // Aronium: Discount apply rule
  resetOrderNumberOnDayClose: false,
  documentConfig: {
    format: "%YEAR%-%TYPE%-%COUNTER%",
    typeOverrides: {
      sale: "INV-%COUNTER%",
      refund: "R-%COUNTER%"
    }
  }
}
```

## Aronium Document Numbering

Based on [Aronium Documents Settings](https://help.aronium.com/hc/en-us/articles/13306315342354-Documents-settings).

### Default Format
```
%YEAR%-%TYPE%-%COUNTER%
```
Example: first sale in 2025 → `25-200-000001`

### Placeholders
| Placeholder  | Description                          |
|-------------|--------------------------------------|
| `%YEAR%`    | Two-digit year (e.g. `25`)           |
| `%TYPE%`    | Document type code (see below)       |
| `%COUNTER%` | Auto-incrementing 6-digit counter    |

### Document Type Codes
| Type       | Code  |
|-----------|-------|
| Sale       | `200` |
| Refund     | `201` |
| Purchase   | `300` |
| Transfer   | `400` |
| Custom     | `500` |

### Custom Formats
You can override per document type via `PosModuleOptions.documentConfig`:
```json
{
  "format": "%YEAR%-%TYPE%-%COUNTER%",
  "typeOverrides": {
    "sale": "INV-%COUNTER%",
    "refund": "R-%COUNTER%"
  }
}
```
Result: sales → `INV-000001`, refunds → `R-000001`, others → default.

## Data Persistence

Sync state is stored in-memory using `Map` collections and persisted to
`data/pos-sync.json` on every write operation. Data is reloaded on service
construction (server restart).

The `data/` directory is gitignored.
