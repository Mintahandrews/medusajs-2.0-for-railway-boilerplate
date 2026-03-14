import { loadEnv } from '@medusajs/framework/utils'

import { assertValue } from 'utils/assert-value'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * Is development environment
 */
export const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Public URL for the backend
 */
export const BACKEND_URL = process.env.BACKEND_PUBLIC_URL ?? process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ?? 'http://localhost:9000'

/**
 * (optional) Public URL for the storefront (used in emails)
 */
export const STOREFRONT_URL = process.env.STOREFRONT_URL;

/**
 * (optional) Support email used for reply-to in notifications
 */
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

/**
 * Database URL for Postgres instance used by the backend
 */
export const DATABASE_URL = assertValue(
  process.env.DATABASE_URL,
  'Environment variable for DATABASE_URL is not set',
)

/**
 * (optional) Redis URL for Redis instance used by the backend
 */
export const REDIS_URL = process.env.REDIS_URL;

/**
 * Admin CORS origins
 */
export const ADMIN_CORS = process.env.ADMIN_CORS;

/**
 * Auth CORS origins
 */
export const AUTH_CORS = process.env.AUTH_CORS;

/**
 * Store/frontend CORS origins
 */
export const STORE_CORS = process.env.STORE_CORS;

/**
 * JWT Secret used for signing JWT tokens
 */
export const JWT_SECRET = assertValue(
  process.env.JWT_SECRET,
  'Environment variable for JWT_SECRET is not set',
)

/**
 * Cookie secret used for signing cookies
 */
export const COOKIE_SECRET = assertValue(
  process.env.COOKIE_SECRET,
  'Environment variable for COOKIE_SECRET is not set',
)

/**
 * (optional) Minio configuration for file storage
 */
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
export const MINIO_BUCKET = process.env.MINIO_BUCKET; // Optional, if not set bucket will be called: medusa-media

/**
 * (optional) Resend API Key and from Email - do not set if using SendGrid
 */
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;

/**
 * (optionl) SendGrid API Key and from Email - do not set if using Resend
 */
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM;

/**
 * (optional) Stripe API key and webhook secret
 */
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * (optional) Paystack secret key and default callback URL
 */
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
export const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL;

/**
 * (optional) Meilisearch configuration
 */
export const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
export const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY;

/**
 * Worker mode
 */
export const WORKER_MODE =
  (process.env.MEDUSA_WORKER_MODE as 'worker' | 'server' | 'shared' | undefined) ?? 'shared'

/**
 * Disable Admin
 */
export const SHOULD_DISABLE_ADMIN = process.env.MEDUSA_DISABLE_ADMIN === 'true'

/**
 * (optional) PostHog analytics configuration
 * POSTHOG_EVENTS_API_KEY: your PostHog project API key
 * POSTHOG_HOST: PostHog API host (defaults to https://us.i.posthog.com)
 */
export const POSTHOG_EVENTS_API_KEY = process.env.POSTHOG_EVENTS_API_KEY
export const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com'

/**
 * (optional) SMSOnlineGH configuration for SMS notifications
 * SMSONLINEGH_API_KEY: your API key from portal.smsonlinegh.com
 * SMSONLINEGH_SENDER_ID: registered sender name (e.g. "LetsCase")
 */
export const SMSONLINEGH_API_KEY = process.env.SMSONLINEGH_API_KEY
export const SMSONLINEGH_SENDER_ID = process.env.SMSONLINEGH_SENDER_ID || 'LetsCase'

/**
 * (optional) WebAuthn / Passkey configuration
 * WEBAUTHN_RP_NAME: human-readable site name shown in passkey prompts
 * WEBAUTHN_RP_ID: must match the domain (e.g. "letscasegh.com")
 * WEBAUTHN_ORIGIN: full origin URL (e.g. "https://letscasegh.com")
 */
export const WEBAUTHN_RP_NAME = process.env.WEBAUTHN_RP_NAME || 'Lets Case'
export const WEBAUTHN_RP_ID = process.env.WEBAUTHN_RP_ID || 'letscasegh.com'
export const WEBAUTHN_ORIGIN = process.env.WEBAUTHN_ORIGIN || 'https://letscasegh.com'

/**
 * Guest / synthetic email detection.
 * Phone-only customers get a generated email in one of two formats:
 *   - Legacy:     `233599470437@letscasegh.com`
 *   - Storefront: `phone_233599470437@sms.letscase.com`
 * Neither is a real mailbox — skip email sending for them.
 */
const GUEST_EMAIL_LEGACY_RE = /^\d+@letscasegh\.com$/i
const GUEST_EMAIL_PHONE_RE = /^phone_\d+@sms\.letscase\.com$/i
export function isGuestEmail(email?: string | null): boolean {
  if (!email) return false
  const trimmed = email.trim()
  return GUEST_EMAIL_LEGACY_RE.test(trimmed) || GUEST_EMAIL_PHONE_RE.test(trimmed)
}

/**
 * Extract phone digits from a synthetic email.
 * Handles both formats:
 *   - `233599470437@letscasegh.com`       → `233599470437`
 *   - `phone_233599470437@sms.letscase.com` → `233599470437`
 * Returns undefined for non-synthetic emails.
 */
export function phoneFromGuestEmail(email?: string | null): string | undefined {
  if (!email) return undefined
  const trimmed = email.trim()
  const legacyMatch = trimmed.match(/^(\d+)@letscasegh\.com$/i)
  if (legacyMatch) return legacyMatch[1]
  const phoneMatch = trimmed.match(/^phone_(\d+)@sms\.letscase\.com$/i)
  if (phoneMatch) return phoneMatch[1]
  return undefined
}
