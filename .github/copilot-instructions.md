# Copilot instructions (Medusa backend + Next.js storefront)

## Repo layout
- `backend/`: Medusa v2 backend (Node 22). Config: `backend/medusa-config.js` + envs in `backend/src/lib/constants.ts`.
- `storefront/`: Next.js App Router storefront (Next 15). Routes live under `storefront/src/app/[countryCode]/…`.

## Critical workflows (run from each package folder)
### Backend
- Install: `cd backend && pnpm install`
- Init DB + seed: `pnpm ib` (runs migrations + seeds using `backend/src/scripts/seed.ts`)
- Dev server: `pnpm dev` (admin dashboard at `http://localhost:9000/app`)
- Prod-ish run: `pnpm build && pnpm start`
- Email template preview (react-email): `pnpm email:dev` (serves previews on `http://localhost:3002`)

### Storefront
- Install: `cd storefront && pnpm install`
- Dev server: `pnpm dev` (runs `await-backend` then launches Next)
- E2E tests: `pnpm test-e2e` (Playwright; **drops & recreates** the test DB, see `storefront/e2e/README.md`)

## Railway-specific notes
- Backend public URL: `backend/src/lib/constants.ts` uses `BACKEND_PUBLIC_URL` then falls back to Railway’s `RAILWAY_PUBLIC_DOMAIN_VALUE` (else `http://localhost:9000`). This affects links in emails and file URLs.
- Backend production build: `pnpm build` creates `.medusa/server`; `backend/src/scripts/postBuild.js` installs prod deps inside `.medusa/server` and copies `pnpm-lock.yaml` (and `.env` if present).
- Backend start: `pnpm start` runs `init-backend` then starts Medusa from `.medusa/server`.
- Storefront env template: see `storefront/.env.local.template` (Railway typically provides MeiliSearch/MinIO endpoints; set `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_BASE_URL`, and MeiliSearch vars as needed).

## Backend conventions (Medusa v2)
- **Centralize env access** in `backend/src/lib/constants.ts` (uses `assertValue` to fail fast on required vars).
- `backend/medusa-config.js` conditionally enables integrations based on env vars:
  - MinIO file storage via `backend/src/modules/minio-file` (fallbacks to `@medusajs/file-local`)
  - Redis event bus + workflow engine when `REDIS_URL` is set
  - Notifications via SendGrid or Resend (`backend/src/modules/email-notifications`)
  - Stripe payment provider when Stripe secrets are set
  - MeiliSearch plugin when MeiliSearch env vars are set
- Medusa caches config in `.medusa/server`. When changing env-driven module config (especially MinIO bucket/provider), delete `.medusa/server` before restarting (see `backend/src/modules/minio-file/README.md`).
- Custom API routes use file-based routing under `backend/src/api/**/route.ts` and resolve services from the container via `req.scope.resolve(Modules.*)`.
  - Example: `backend/src/api/key-exchange/route.ts` returns the publishable API key token for the API key titled `Webshop`.
- Event-driven logic lives in `backend/src/subscribers/*.ts` (e.g. `invite.created`, `order.placed`) and typically uses `Modules.NOTIFICATION` + react-email templates.

## Storefront conventions (Next.js App Router)
- Region/country routing is enforced in `storefront/src/middleware.ts`:
  - Fetches regions from `${NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/regions` with header `x-publishable-api-key: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- Medusa client singleton is `storefront/src/lib/config.ts` (`@medusajs/js-sdk`).
- Server actions/data fetchers live in `storefront/src/lib/data/*.ts`:
  - Common patterns: `cache(...)`, `revalidateTag("cart"|"products"|"regions")`, and cookie-based session/cart.
  - Cookies: `_medusa_cart_id` and `_medusa_jwt` helpers in `storefront/src/lib/data/cookies.ts`.
- Search uses MeiliSearch by default (`storefront/src/lib/search-client.ts`); Algolia is optional.
