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

    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
    }
  } catch {
    const hostname = String(value).replace(/^https?:\/\//, "").split("/")[0].split(":")[0]
    if (!hostname) {
      return null
    }

    return {
      protocol: "https",
      hostname,
    }
  }
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
    ]
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
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
      ...(safeUrlToRemotePattern(process.env.NEXT_PUBLIC_BASE_URL)
        ? [safeUrlToRemotePattern(process.env.NEXT_PUBLIC_BASE_URL)]
        : []),
      // Note: only needed when using local-file for product media
      ...(safeUrlToRemotePattern(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)
        ? [safeUrlToRemotePattern(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)]
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
      ...(process.env.NEXT_PUBLIC_MINIO_ENDPOINT
        ? [safeUrlToRemotePattern(process.env.NEXT_PUBLIC_MINIO_ENDPOINT)].filter(Boolean)
        : []),
    ].filter(Boolean),
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000
  }
}

module.exports = nextConfig
