import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Container, Heading, Text, Badge, Button, Table, Toaster, toast } from "@medusajs/ui"
import { ChartBar } from "@medusajs/icons"

type SyncStatusCounts = {
  total: number
  synced: number
  pending: number
  failed: number
}

type PosStats = {
  products: SyncStatusCounts
  orders: SyncStatusCounts
  inventory: SyncStatusCounts
  last_sync_at: string | null
}

type ProductMapping = {
  id: string
  medusa_product_id: string
  medusa_variant_id: string
  pos_product_id: string | null
  pos_sku: string | null
  sync_status: string
  last_synced_at: string | null
  error_message: string | null
  updated_at: string
}

type OrderSync = {
  id: string
  medusa_order_id: string
  pos_order_id: string | null
  pos_document_number: string | null
  pos_document_type: string
  sync_status: string
  total_amount: number
  tax_total: number
  discount_total: number
  currency_code: string
  payment_type: string
  line_items: { medusa_item_id: string; title: string; quantity: number; unit_price: number; tax_amount: number; discount_amount: number }[]
  error_message: string | null
  updated_at: string
}

const StatusBadge = ({ status }: { status: string }) => {
  const color =
    status === "synced"
      ? "green"
      : status === "pending"
        ? "orange"
        : status === "failed"
          ? "red"
          : "grey"
  return <Badge color={color}>{status}</Badge>
}

const StatCard = ({
  title,
  counts,
}: {
  title: string
  counts: SyncStatusCounts
}) => (
  <Container className="p-4">
    <Text size="small" weight="plus" className="text-ui-fg-subtle mb-2">
      {title}
    </Text>
    <Heading level="h2" className="mb-3">
      {counts.total}
    </Heading>
    <div className="flex gap-3 text-xs">
      <span className="text-ui-fg-subtle">
        Synced: <strong className="text-ui-fg-base">{counts.synced}</strong>
      </span>
      <span className="text-ui-fg-subtle">
        Pending: <strong className="text-ui-tag-orange-text">{counts.pending}</strong>
      </span>
      <span className="text-ui-fg-subtle">
        Failed: <strong className="text-ui-tag-red-text">{counts.failed}</strong>
      </span>
    </div>
  </Container>
)

const PosPage = () => {
  const [stats, setStats] = useState<PosStats | null>(null)
  const [products, setProducts] = useState<ProductMapping[]>([])
  const [orders, setOrders] = useState<OrderSync[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        fetch("/admin/pos", { credentials: "include" }),
        fetch("/admin/pos/products", { credentials: "include" }),
        fetch("/admin/pos/orders", { credentials: "include" }),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.product_mappings || [])
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setOrders(data.order_syncs || [])
      }
    } catch (err) {
      toast.error("Failed to fetch POS data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "products" as const, label: "Products" },
    { key: "orders" as const, label: "Orders" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Toaster />

      {/* Header */}
      <Container className="flex items-center justify-between p-4">
        <div>
          <Heading level="h1">POS Integration</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Manage Aronium POS sync for products, orders, and inventory
          </Text>
        </div>
        <Button variant="secondary" onClick={fetchData} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </Container>

      {/* Tabs */}
      <Container className="p-0">
        <div className="flex border-b border-ui-border-base">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-ui-fg-base text-ui-fg-base"
                  : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Container>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Products" counts={stats.products} />
            <StatCard title="Orders" counts={stats.orders} />
            <StatCard title="Inventory" counts={stats.inventory} />
          </div>

          <Container className="p-4">
            <Text size="small" className="text-ui-fg-subtle">
              Last sync:{" "}
              {stats.last_sync_at
                ? new Date(stats.last_sync_at).toLocaleString()
                : "Never"}
            </Text>
          </Container>

          <Container className="p-4">
            <Heading level="h2" className="mb-2">
              Setup Guide
            </Heading>
            <Text className="text-ui-fg-subtle text-sm leading-relaxed">
              To connect Aronium POS:
            </Text>
            <ol className="list-decimal list-inside mt-2 text-sm text-ui-fg-subtle space-y-1">
              <li>Set <code>ARONIUM_POS_ENABLED=true</code> in your environment</li>
              <li>Set <code>ARONIUM_POS_API_KEY</code> to a secure shared secret</li>
              <li>Install the Letscase POS Sync Agent on the machine running Aronium</li>
              <li>Configure the agent with your Medusa backend URL and API key</li>
              <li>The agent will automatically sync products, orders, and inventory</li>
            </ol>
          </Container>
        </>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <Container className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2">Product Mappings</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {products.length} mapping{products.length !== 1 ? "s" : ""}
            </Text>
          </div>

          {products.length === 0 ? (
            <Text className="text-ui-fg-subtle text-sm py-8 text-center">
              No product mappings yet. The POS sync agent will create mappings when it runs.
            </Text>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Variant ID</Table.HeaderCell>
                  <Table.HeaderCell>POS SKU</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Last Synced</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {products.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell className="font-mono text-xs">
                      {p.medusa_variant_id.slice(0, 16)}...
                    </Table.Cell>
                    <Table.Cell>{p.pos_sku || "—"}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={p.sync_status} />
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-subtle">
                      {p.last_synced_at
                        ? new Date(p.last_synced_at).toLocaleString()
                        : "Never"}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Container>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <Container className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2">Order Syncs</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {orders.length} record{orders.length !== 1 ? "s" : ""}
            </Text>
          </div>

          {orders.length === 0 ? (
            <Text className="text-ui-fg-subtle text-sm py-8 text-center">
              No orders synced yet. Orders will appear here when placed and POS sync is enabled.
            </Text>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order ID</Table.HeaderCell>
                  <Table.HeaderCell>Doc Number</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>Items</Table.HeaderCell>
                  <Table.HeaderCell>POS Order</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Updated</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {orders.map((o) => (
                  <Table.Row key={o.id}>
                    <Table.Cell className="font-mono text-xs">
                      {o.medusa_order_id.slice(0, 16)}...
                    </Table.Cell>
                    <Table.Cell className="font-mono text-xs">
                      {o.pos_document_number || "—"}
                    </Table.Cell>
                    <Table.Cell>
                      {(o.total_amount / 100).toFixed(2)} {o.currency_code.toUpperCase()}
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      {o.line_items?.length ?? 0}
                    </Table.Cell>
                    <Table.Cell className="font-mono text-xs">
                      {o.pos_order_id || "—"}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={o.sync_status} />
                    </Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-subtle">
                      {new Date(o.updated_at).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Container>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "POS Integration",
  icon: ChartBar,
})

export default PosPage
