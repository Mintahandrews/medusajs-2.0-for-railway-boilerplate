# MedusaJS Upgrade Guide: 2.12.1 → 2.13.1

## Why Upgrade

| Version | Key Changes |
|---------|------------|
| **2.12.2** | Bug fixes, minor improvements |
| **2.12.3** | Bug fixes |
| **2.12.4** | **CRITICAL: Fixes a data-loss bug** — custom entity translations module option removed in favor of a new approach. Also adds translation support improvements. |
| **2.13.0** | New features, improvements (introduced a regression with order totals on listing) |
| **2.13.1** | **Fixes regression** with totals on order listing introduced in 2.13.0 |

> ⚠️ **v2.12.4 contains a critical data-loss fix.** Upgrading at least to 2.12.4 is strongly recommended.

## Pre-Upgrade Checklist

- [ ] Back up your database
- [ ] Ensure you have no uncommitted changes (`git status`)
- [ ] Note any custom patches or modifications to Medusa internals

## Upgrade Steps

### 1. Backend Packages

Run from the `backend/` directory:

```bash
# Update all @medusajs/* packages to 2.13.1
npx npm-check-updates -u --filter "@medusajs/*" --target 2.13.1
npm install

# Or manually update package.json, changing these from 2.12.1 → 2.13.1:
#   @medusajs/admin-sdk
#   @medusajs/admin-shared
#   @medusajs/cli
#   @medusajs/dashboard
#   @medusajs/draft-order
#   @medusajs/framework
#   @medusajs/medusa
#   @medusajs/notification-sendgrid
#   @medusajs/payment-stripe
#   @medusajs/workflow-engine-redis
#   @medusajs/test-utils
```

### 2. Run Migrations

```bash
cd backend
npx medusa db:migrate
```

### 3. Storefront Packages

The storefront uses `preview` tagged packages (`@medusajs/js-sdk`, `@medusajs/types`, `@medusajs/ui`). These auto-resolve to latest preview. Run:

```bash
cd storefront
npm update @medusajs/js-sdk @medusajs/types @medusajs/ui @medusajs/ui-preset @medusajs/client-types
```

### 4. Build & Test

```bash
# Backend
cd backend
npm run build

# Storefront
cd ../storefront
npm run build
```

### 5. Verify

- [ ] Admin dashboard loads at `/app`
- [ ] Storefront loads and can browse products
- [ ] Cart add/checkout flow works
- [ ] Order placement triggers email notifications
- [ ] AI preview generates correctly

## Breaking Changes to Watch For

1. **v2.12.4**: The `Translations` module option for custom entities was removed. If you configured custom entity translations in `medusa-config.js`, update to the new approach per the release notes.
2. **v2.13.0 → 2.13.1**: Order listing totals regression was fixed. Always go to 2.13.1, never stop at 2.13.0.

## Rollback

If issues arise:
```bash
git stash  # or git checkout .
npm install  # restores previous lock file versions
npx medusa db:rollback  # if migrations were applied
```
