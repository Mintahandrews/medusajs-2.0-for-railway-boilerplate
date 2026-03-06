import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you were looking for could not be found.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-72px)] px-4">
      <span className="text-6xl font-bold text-grey-20">404</span>
      <h1 className="text-2xl-semi text-ui-fg-base">Page not found</h1>
      <p className="text-small-regular text-ui-fg-muted text-center max-w-md">
        The page you tried to access does not exist or may have been moved.
      </p>
      <LocalizedClientLink
        href="/"
        className="mt-2 px-6 py-2.5 rounded-lg bg-ui-bg-interactive text-ui-fg-on-color text-small-semi hover:bg-ui-bg-interactive-hover transition-colors"
      >
        Back to Home
      </LocalizedClientLink>
    </div>
  )
}

