"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
const VALID_POSTHOG_KEY =
  typeof POSTHOG_KEY === "string" &&
  POSTHOG_KEY.startsWith("phc_") &&
  POSTHOG_KEY !== "phc_your_project_api_key"

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!VALID_POSTHOG_KEY) return

    posthog.init(POSTHOG_KEY as string, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // we handle this manually for SPA navigations
      capture_pageleave: true,
      autocapture: true,
    })
  }, [])

  if (!VALID_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
