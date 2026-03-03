# Letscase POS

A standalone Point of Sale system built with Next.js, integrated with Medusa admin backend.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Medusa backend URL and admin credentials

# Start development server (runs on port 3001)
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Medusa backend URL | `http://localhost:9000` |
| `MEDUSA_ADMIN_API_TOKEN` | Admin API token (optional, for server-side) | - |
| `NEXT_PUBLIC_STORE_NAME` | Store name displayed in POS | `Letscase POS` |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Default currency code | `GHS` |

## Features

- **Sales Terminal** — Product grid, search, barcode scanning (USB wedge), cart management
- **Payment** — Cash (with change calculation) and Mobile Money
- **Discounts** — Percentage or fixed, per-item or whole cart
- **Hold/Park Sales** — Save current sale and start a new one
- **Notes** — Add notes to items or the entire sale
- **Reports** — Sales by hour/day, payment breakdown, order history
- **Cash Drawer** — Track cash in/out, sales, refunds
- **Keyboard Shortcuts** — F2 (Search), F4 (Pay), F8 (Clear), F9 (Hold)

## Medusa Integration

Uses Medusa Admin API for:
- Product & variant lookup (including barcode search)
- Category and collection browsing
- Draft Orders for POS transactions
- Order history and refunds
- Customer management
- Inventory tracking via Sales Channels

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS** (dark POS theme)
- **Zustand** (persisted cart/session state)
- **Recharts** (analytics charts)
- **Lucide React** (icons)
- **date-fns** (date utilities)
