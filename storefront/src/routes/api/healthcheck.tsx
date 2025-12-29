import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/healthcheck')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/healthcheck"!</div>
}
