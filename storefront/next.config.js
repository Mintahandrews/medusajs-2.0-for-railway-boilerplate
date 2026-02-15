const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

const safeUrlToRemotePattern = (value) => {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    if (!url.hostname) {
      return null
    }

    const pattern = {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
    }

    if (url.port) {
      pattern.port = url.port
    }

    return pattern
  } catch {
    let rest = String(value).replace(/^https?:\/\//, "").split("/")[0]
    if (!rest) {
      return null
    }

    let hostname = rest
    let port
    if (rest.includes(":")) {
      const parts = rest.split(":")
      hostname = parts[0]
      port = parts[1]
    }

    const pattern = {
      protocol: String(value).startsWith("http://") ? "http" : "https",
      hostname,
    }

    if (port) {
      pattern.port = port
    }

    return pattern
  }
}

const KNOWN_IMAGE_DOMAINS = new Set([
  "letscasegh.com",
  "www.letscasegh.com",
  "images.unsplash.com",
  "i.pravatar.cc",
  "medusa-public-images.s3.eu-west-1.amazonaws.com",
  "medusa-server-testing.s3.amazonaws.com",
  "medusa-server-testing.s3.us-east-1.amazonaws.com",
])

const addDynamicDomain = (value) => {
  const pattern = safeUrlToRemotePattern(value)
  if (pattern?.hostname) {
    KNOWN_IMAGE_DOMAINS.add(pattern.hostname)
  }
  return pattern
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Compress responses (gzip/brotli)
  compress: true,
  // Automatically optimize package imports for tree-shaking
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@medusajs/ui",
      "lodash",
      "@headlessui/react",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/:path(.+\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache Next.js static chunks
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
  images: {
    // Enable Next.js image optimization (sharp is already installed)
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: Array.from(KNOWN_IMAGE_DOMAINS),
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "0.0.0.0",
      },
      {
        protocol: "https",
        hostname: "letscasegh.com",
      },
      {
        protocol: "https",
        hostname: "www.letscasegh.com",
      },
      // Note: needed to serve images from /public folder when using absolute URLs.
      ...(addDynamicDomain(process.env.NEXT_PUBLIC_BASE_URL)
        ? [addDynamicDomain(process.env.NEXT_PUBLIC_BASE_URL)]
        : []),
      // Note: only needed when using local-file for product media
      ...(addDynamicDomain(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)
        ? [addDynamicDomain(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)]
        : []),
      // Note: can be removed after deleting demo products
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
      },
      {
        protocol: "https",
        hostname: "*.up.railway.app",
      },
      ...(addDynamicDomain(process.env.NEXT_PUBLIC_MINIO_ENDPOINT)
        ? [addDynamicDomain(process.env.NEXT_PUBLIC_MINIO_ENDPOINT)]
        : []),
    ].filter(Boolean),
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000
  }
}

module.exports = nextConfig
