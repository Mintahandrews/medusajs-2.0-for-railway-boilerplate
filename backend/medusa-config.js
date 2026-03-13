import { loadEnv, Modules, defineConfig } from '@medusajs/utils';
import { letscaseBrandingPlugin } from './vite-plugin-branding.js';
loadEnv(process.env.NODE_ENV, process.cwd());

const required = (value, name) => {
  if (!value) {
    throw new Error(`Environment variable for ${name} is not set`)
  }

  return value
}

const BACKEND_URL =
  process.env.BACKEND_PUBLIC_URL ??
  process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ??
  'http://localhost:9000'
const DATABASE_URL = required(process.env.DATABASE_URL, 'DATABASE_URL')
const REDIS_URL = process.env.REDIS_URL
const ADMIN_CORS = process.env.ADMIN_CORS
const AUTH_CORS = process.env.AUTH_CORS
const STORE_CORS = process.env.STORE_CORS
const JWT_SECRET = required(process.env.JWT_SECRET, 'JWT_SECRET')
const COOKIE_SECRET = required(process.env.COOKIE_SECRET, 'COOKIE_SECRET')
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
const MINIO_BUCKET = process.env.MINIO_BUCKET
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const SENDGRID_FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM
const STRIPE_API_KEY = process.env.STRIPE_API_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL
const WORKER_MODE =
  process.env.MEDUSA_WORKER_MODE ?? 'shared'
const SHOULD_DISABLE_ADMIN = process.env.MEDUSA_DISABLE_ADMIN === 'true'
const ARONIUM_POS_ENABLED = process.env.ARONIUM_POS_ENABLED === 'true'
const ARONIUM_POS_API_KEY = process.env.ARONIUM_POS_API_KEY
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST
const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY
const POSTHOG_EVENTS_API_KEY = process.env.POSTHOG_EVENTS_API_KEY
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com'

const medusaConfig = {
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: false,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET
    },
    build: {
      rollupOptions: {
        external: ["@medusajs/dashboard", "@medusajs/admin-shared"]
      }
    }
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
    vite: (config) => {
      return {
        ...config,
        plugins: [
          ...(config.plugins || []),
          letscaseBrandingPlugin(),
          // Patch admin dashboard upload limit from 1MB to 4MB
          {
            name: 'letscase-upload-limit',
            transform(code, id) {
              if (id.includes('@medusajs/dashboard') && code.includes('DEFAULT_MAX_FILE_SIZE')) {
                return code.replace(
                  /var\s+DEFAULT_MAX_FILE_SIZE\s*=\s*1024\s*\*\s*1024/,
                  'var DEFAULT_MAX_FILE_SIZE = 4 * 1024 * 1024'
                )
              }
            },
          },
        ],
      }
    },
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: '@medusajs/file',
      options: {
        providers: [
          ...(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY ? [{
            resolve: './src/modules/minio-file',
            id: 'minio',
            options: {
              endPoint: MINIO_ENDPOINT,
              accessKey: MINIO_ACCESS_KEY,
              secretKey: MINIO_SECRET_KEY,
              bucket: MINIO_BUCKET // Optional, default: medusa-media
            }
          }] : [{
            resolve: '@medusajs/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: `${BACKEND_URL}/static`
            }
          }])
        ]
      }
    },
    ...(REDIS_URL ? [{
      key: Modules.EVENT_BUS,
      resolve: '@medusajs/event-bus-redis',
      options: {
        redisUrl: REDIS_URL
      }
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: '@medusajs/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        }
      }
    }] : []),
    ...(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL || RESEND_API_KEY && RESEND_FROM_EMAIL ? [{
      key: Modules.NOTIFICATION,
      resolve: '@medusajs/notification',
      options: {
        providers: [
          ...(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL ? [{
            resolve: '@medusajs/notification-sendgrid',
            id: 'sendgrid',
            options: {
              channels: ['email'],
              api_key: SENDGRID_API_KEY,
              from: SENDGRID_FROM_EMAIL,
            }
          }] : []),
          ...(RESEND_API_KEY && RESEND_FROM_EMAIL ? [{
            resolve: './src/modules/email-notifications',
            id: 'resend',
            options: {
              channels: ['email'],
              api_key: RESEND_API_KEY,
              from: RESEND_FROM_EMAIL,
            },
          }] : []),
        ]
      }
    }] : []),
    ...((STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET) || PAYSTACK_SECRET_KEY ? [{
      key: Modules.PAYMENT,
      resolve: '@medusajs/payment',
      options: {
        providers: [
          ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET ? [{
            resolve: '@medusajs/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: STRIPE_API_KEY,
              webhookSecret: STRIPE_WEBHOOK_SECRET,
            },
          }] : []),
          ...(PAYSTACK_SECRET_KEY ? [{
            resolve: './src/modules/paystack-payment',
            id: 'paystack',
            options: {
              secretKey: PAYSTACK_SECRET_KEY,
              callbackUrl: PAYSTACK_CALLBACK_URL,
            },
          }] : []),
        ],
      },
    }] : []),
    ...(ARONIUM_POS_ENABLED ? [{
      key: "posModuleService",
      resolve: './src/modules/pos',
      options: {
        enabled: ARONIUM_POS_ENABLED,
        apiKey: ARONIUM_POS_API_KEY,
      },
    }] : []),
    ...(POSTHOG_EVENTS_API_KEY ? [{
      key: Modules.ANALYTICS,
      resolve: '@medusajs/medusa/analytics',
      options: {
        providers: [
          {
            resolve: '@medusajs/analytics-posthog',
            id: 'posthog',
            options: {
              posthogEventsKey: POSTHOG_EVENTS_API_KEY,
              posthogHost: POSTHOG_HOST,
            },
          },
        ],
      },
    }] : []),
  ],
  plugins: [
  ...(MEILISEARCH_HOST && MEILISEARCH_ADMIN_KEY ? [{
      resolve: '@rokmohar/medusa-plugin-meilisearch',
      options: {
        config: {
          host: MEILISEARCH_HOST,
          apiKey: MEILISEARCH_ADMIN_KEY
        },
        settings: {
          products: {
            type: 'products',
            enabled: true,
            fields: ['id', 'title', 'description', 'handle', 'variant_sku', 'thumbnail'],
            indexSettings: {
              searchableAttributes: ['title', 'description', 'variant_sku'],
              displayedAttributes: ['id', 'handle', 'title', 'description', 'variant_sku', 'thumbnail'],
              filterableAttributes: ['id', 'handle'],
            },
            primaryKey: 'id',
          }
        }
      }
    }] : [])
  ]
};

export default defineConfig(medusaConfig);
