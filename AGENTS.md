# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

Monorepo for a MedusaJS 2.0 e-commerce platform (currently v2.13.1) pre-configured for Railway deployment. Three packages share a single Git root — no workspace manager at the repo level; each package manages its own dependencies independently.

## Packages

- `backend/` — Medusa v2 backend (Node 22, pnpm). Config: `medusa-config.js`. Admin dashboard served at `/app`.
- `storefront/` — Next.js 15 App Router storefront (React 19, pnpm/npm). Country-based routing under `src/app/[countryCode]/…`.
- `pos/` — Standalone Next.js 15 POS terminal (React 19, Zustand for state). Runs on port 3001. Uses Medusa Admin API for products, draft orders, and inventory.

## Build & Dev Commands

All commands run from inside each package directory.

### Backend (`cd backend/`)
- `pnpm install` — install dependencies
- `pnpm dev` — start dev server (admin at `http://localhost:9000/app`)
- `pnpm ib` — initialize backend: run migrations + seed database (uses `src/scripts/seed.ts`)
- `pnpm build && pnpm start` — production build and start (builds to `.medusa/server/`, `src/scripts/postBuild.js` installs prod deps there)
- `pnpm email:dev` — preview react-email templates on `http://localhost:3002`
- `npx medusa db:migrate` — run database migrations only
- `npx medusa db:rollback` — rollback last migration

### Storefront (`cd storefront/`)
- `pnpm install` — install dependencies
- `pnpm dev` — runs `await-backend` then starts Next.js dev server
- `pnpm build` — production build (via `launch-storefront` wrapper)
- `pnpm lint` — ESLint
- `pnpm test-e2e` — Playwright e2e tests (**drops & recreates** the test DB; see `e2e/README.md`)

### POS (`cd pos/`)
- `npm install` — install dependencies
- `npm run dev` — dev server on port 3001
- `npm run build` — production build
- `npm run lint` — ESLint

## Architecture

### Backend Module System

`medusa-config.js` conditionally enables modules/plugins based on environment variables. All env vars are centralized in `backend/src/lib/constants.ts` with `assertValue` for required vars. Key conditional modules:

- **File storage**: MinIO (`src/modules/minio-file`) when `MINIO_ENDPOINT`/`MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY` are set; otherwise falls back to `@medusajs/file-local`.
- **Event bus + workflow engine**: Redis-backed when `REDIS_URL` is set; otherwise in-memory defaults.
- **Notifications**: Resend (`src/modules/email-notifications`) or SendGrid, based on which API key/from-email pair is set. Email templates are react-email components in `src/modules/email-notifications/templates/`.
- **Payments**: Stripe (`@medusajs/payment-stripe`) when `STRIPE_API_KEY` + `STRIPE_WEBHOOK_SECRET` are set. Paystack (`src/modules/paystack-payment`) when `PAYSTACK_SECRET_KEY` is set. Both can be active simultaneously.
- **Search**: MeiliSearch plugin (`@rokmohar/medusa-plugin-meilisearch`) when `MEILISEARCH_HOST` + `MEILISEARCH_ADMIN_KEY` are set.
- **POS module**: `src/modules/pos` when `ARONIUM_POS_ENABLED=true`.
- **Analytics**: PostHog when `POSTHOG_EVENTS_API_KEY` is set.

**Important**: Medusa caches config in `.medusa/server/`. When changing env-driven module config (especially file storage providers), delete `.medusa/server/` before restarting.

### Backend API Routes

File-based routing under `backend/src/api/`:
- `api/key-exchange/route.ts` — public endpoint returning the publishable API key for the key titled "Webshop"
- `api/store/custom/…` — storefront-facing custom endpoints (design upload, AI preview, contact form, device configs, line-item metadata)
- `api/admin/custom/…` — admin custom endpoints
- `api/admin/pos/…` — POS-specific admin endpoints (products, orders, inventory, invites)
- `api/middlewares.ts` — defines POS RBAC middleware on `/admin/*` and body-parser size limit (10MB) for `/store/custom/*`

Services are resolved from the Medusa container via `req.scope.resolve(Modules.*)`.

### Backend Subscribers

Event-driven handlers in `backend/src/subscribers/`:
- `order-placed.ts`, `order-shipped.ts`, `order-delivered.ts`, `order-cancelled.ts` — email notifications via `Modules.NOTIFICATION` + react-email templates
- `invite-created.ts` — sends invite emails
- `design-file-cleanup.ts` — cleans up uploaded design files
- `order-pos-sync.ts` — syncs orders to POS system
- `user-created-role.ts` — handles role assignment on user creation

### Backend RBAC

`api/middlewares.ts` implements role-based access control using `user.metadata.pos_role`:
- `admin` — full access
- `manager` — read+write on operational routes (orders, products, inventory, etc.), read-only on admin config routes
- `cashier` — read-only on most routes, can create draft orders

### Storefront Architecture

- **Region/country routing**: `src/middleware.ts` fetches regions from Medusa and redirects to `/{countryCode}/…`. Falls back to `NEXT_PUBLIC_DEFAULT_REGION`.
- **Medusa SDK singleton**: `src/lib/config.ts` — uses `@medusajs/js-sdk` with `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- **Data fetching**: Server actions in `src/lib/data/*.ts` use `cache(...)`, `revalidateTag("cart"|"products"|"regions")`, and cookie-based sessions.
- **Cookies**: `_medusa_cart_id` and `_medusa_jwt` managed in `src/lib/data/cookies.ts`.
- **Search**: MeiliSearch by default via `src/lib/search-client.ts`; Algolia available as commented alternative.
- **UI components**: `src/modules/` organized by domain (account, cart, checkout, products, customizer, layout, search, etc.). Each domain has `components/` and `templates/` subdirectories.
- **Customizer**: Phone case design tool using Fabric.js canvas (`src/modules/customizer/`), with AI preview generation and design upload.

### POS Architecture

Standalone Next.js app communicating with Medusa Admin API:
- **State**: Zustand store (`src/lib/store.ts`) with persistence for cart/session
- **RBAC**: Client-side role enforcement in `src/lib/rbac.ts` (mirrors backend middleware roles)
- **Medusa client**: `src/lib/medusa-client.ts` wraps Admin API calls
- **Payments**: Paystack integration (`src/hooks/usePaystack.ts`, `src/lib/paystack.ts`)
- **Offline support**: `src/lib/offline.ts`

## Environment Setup

- Backend: copy `backend/.env.template` → `backend/.env`
- Storefront: copy `storefront/.env.local.template` → `storefront/.env.local`
- POS: copy `pos/.env.local.example` → `pos/.env.local`

Required backend env vars: `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`. Everything else is optional and enables conditional features.

The storefront requires `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` to function. The publishable key can be retrieved from the running backend at `/key-exchange` or created in the Medusa Admin under Settings → Publishable API Keys.

## Railway Deployment Notes

- `BACKEND_PUBLIC_URL` falls back to Railway's `RAILWAY_PUBLIC_DOMAIN_VALUE` env var, then `http://localhost:9000`.
- Backend `pnpm start` runs `init-backend` (from `medusajs-launch-utils`), then migrates and starts from `.medusa/server/`.
- `src/scripts/postBuild.js` copies lock files and installs prod deps into `.medusa/server/` for the production image.
- Storefront uses `await-backend` and `launch-storefront` wrappers from `medusajs-launch-utils` to wait for the backend before building/starting.

## Key Conventions

- Centralize all backend env var access in `backend/src/lib/constants.ts` — do not read `process.env` directly elsewhere in backend code.
- Backend TypeScript path aliases: `*` → `./src/*` and `@/*` → `./src/*` (configured in `tsconfig.json`).
- Custom API routes follow Medusa's file-based routing: `src/api/{scope}/{resource}/route.ts` exporting HTTP method handlers (`GET`, `POST`, etc.).
- Subscribers follow the pattern: `src/subscribers/{event-name}.ts`.
- Admin UI extensions: custom pages in `src/admin/routes/` and widgets in `src/admin/widgets/`.
