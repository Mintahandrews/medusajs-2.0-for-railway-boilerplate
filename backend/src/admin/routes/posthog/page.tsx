import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState } from "react"
import { Container, Heading, Text, Badge, Button, Input, Toaster, toast } from "@medusajs/ui"
import { ArrowUpRightOnBox, ChartPie } from "@medusajs/icons"

const POSTHOG_DASHBOARD_URL = "https://us.posthog.com"

const EnvStatus = ({ label, value }: { label: string; value: boolean }) => (
  <div className="flex items-center justify-between py-2 border-b border-ui-border-base last:border-b-0">
    <Text size="small" className="text-ui-fg-subtle">{label}</Text>
    <Badge color={value ? "green" : "red"}>
      {value ? "Configured" : "Not Set"}
    </Badge>
  </div>
)

const PostHogPage = () => {
  const [dashboardUrl, setDashboardUrl] = useState(POSTHOG_DASHBOARD_URL)

  const trackedEvents = [
    { event: "$pageview", source: "Storefront", description: "Every page navigation (SPA-aware)" },
    { event: "product_viewed", source: "Storefront", description: "Product detail page viewed" },
    { event: "add_to_cart", source: "Storefront", description: "Item added to cart" },
    { event: "checkout_completed", source: "Storefront", description: "Order confirmation page" },
    { event: "order_placed", source: "Backend", description: "Server-side order tracking via Analytics Module" },
    { event: "$identify", source: "Storefront", description: "Customer identified on account login" },
    { event: "$pageleave", source: "Storefront", description: "Auto-captured when user leaves page" },
    { event: "$autocapture", source: "Storefront", description: "Clicks, inputs, and form submissions" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Toaster />

      {/* Header */}
      <Container className="flex items-center justify-between p-4">
        <div>
          <Heading level="h1">PostHog Analytics</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Product analytics, session recordings, and event tracking
          </Text>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            window.open(dashboardUrl, "_blank")
          }}
        >
          <ArrowUpRightOnBox />
          Open PostHog Dashboard
        </Button>
      </Container>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Container className="p-4">
          <Heading level="h2" className="mb-3">Backend Configuration</Heading>
          <div className="flex flex-col">
            <EnvStatus
              label="POSTHOG_EVENTS_API_KEY"
              value={false}
            />
            <EnvStatus
              label="POSTHOG_HOST"
              value={false}
            />
            <EnvStatus
              label="Analytics Module"
              value={false}
            />
          </div>
          <Text size="small" className="text-ui-fg-muted mt-3">
            Note: Status shows config check at build time. Set env vars and redeploy to activate.
          </Text>
        </Container>

        <Container className="p-4">
          <Heading level="h2" className="mb-3">Storefront Configuration</Heading>
          <div className="flex flex-col">
            <EnvStatus
              label="NEXT_PUBLIC_POSTHOG_KEY"
              value={false}
            />
            <EnvStatus
              label="NEXT_PUBLIC_POSTHOG_HOST"
              value={false}
            />
          </div>
          <Text size="small" className="text-ui-fg-muted mt-3">
            These env vars must be set in the storefront environment.
          </Text>
        </Container>
      </div>

      {/* Custom Dashboard URL */}
      <Container className="p-4">
        <Heading level="h2" className="mb-3">PostHog Dashboard URL</Heading>
        <Text size="small" className="text-ui-fg-subtle mb-3">
          Set your PostHog project URL to quickly access your analytics dashboard.
        </Text>
        <div className="flex gap-2">
          <Input
            placeholder="https://us.posthog.com/project/12345"
            value={dashboardUrl}
            onChange={(e) => setDashboardUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => {
              if (dashboardUrl) {
                window.open(dashboardUrl, "_blank")
              } else {
                toast.error("Enter a PostHog dashboard URL first")
              }
            }}
          >
            <ArrowUpRightOnBox />
            Open
          </Button>
        </div>
      </Container>

      {/* Tracked Events */}
      <Container className="p-4">
        <Heading level="h2" className="mb-3">Tracked Events</Heading>
        <Text size="small" className="text-ui-fg-subtle mb-4">
          Events automatically tracked across the storefront and backend.
        </Text>

        <div className="border border-ui-border-base rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_2fr] gap-2 px-4 py-2 bg-ui-bg-subtle border-b border-ui-border-base">
            <Text size="small" weight="plus" className="text-ui-fg-subtle">Event</Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">Source</Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">Description</Text>
          </div>
          {trackedEvents.map((evt) => (
            <div
              key={evt.event}
              className="grid grid-cols-[1fr_100px_2fr] gap-2 px-4 py-2.5 border-b border-ui-border-base last:border-b-0"
            >
              <Text size="small" className="font-mono text-ui-fg-base">{evt.event}</Text>
              <Badge color={evt.source === "Backend" ? "purple" : "blue"} className="w-fit">
                {evt.source}
              </Badge>
              <Text size="small" className="text-ui-fg-subtle">{evt.description}</Text>
            </div>
          ))}
        </div>
      </Container>

      {/* Setup Guide */}
      <Container className="p-4">
        <Heading level="h2" className="mb-2">Setup Guide</Heading>
        <ol className="list-decimal list-inside mt-2 text-sm text-ui-fg-subtle space-y-2">
          <li>
            Create a free account at{" "}
            <a href="https://posthog.com" target="_blank" rel="noopener noreferrer" className="text-ui-fg-interactive hover:underline">
              posthog.com
            </a>
          </li>
          <li>
            Copy your <strong>Project API Key</strong> from PostHog &rarr; Project Settings
          </li>
          <li>
            Set backend env vars: <code className="bg-ui-bg-subtle px-1 py-0.5 rounded text-xs">POSTHOG_EVENTS_API_KEY=phc_xxx</code> and{" "}
            <code className="bg-ui-bg-subtle px-1 py-0.5 rounded text-xs">POSTHOG_HOST=https://us.i.posthog.com</code>
          </li>
          <li>
            Set storefront env vars: <code className="bg-ui-bg-subtle px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_POSTHOG_KEY=phc_xxx</code> and{" "}
            <code className="bg-ui-bg-subtle px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com</code>
          </li>
          <li>Redeploy both backend and storefront</li>
          <li>Visit your store and check the PostHog dashboard for incoming events</li>
        </ol>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "PostHog Analytics",
  icon: ChartPie,
})

export default PostHogPage
