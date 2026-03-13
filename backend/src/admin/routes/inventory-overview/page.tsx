import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState, useMemo } from "react"
import {
  Container,
  Heading,
  Text,
  Badge,
  Input,
  Table,
  Toaster,
  toast,
} from "@medusajs/ui"
import { ArchiveBox } from "@medusajs/icons"

type InventoryRow = {
  productId: string
  productTitle: string
  variantId: string
  variantTitle: string
  sku: string
  barcode: string
  inventoryQuantity: number
  manageInventory: boolean
  thumbnail: string | null
}

const InventoryOverviewPage = () => {
  const [rows, setRows] = useState<InventoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all products with variants and inventory info
      const res = await fetch(
        "/admin/products?limit=200&fields=id,title,thumbnail,variants.id,variants.title,variants.sku,variants.barcode,variants.inventory_quantity,variants.manage_inventory",
        { credentials: "include" }
      )
      if (!res.ok) throw new Error("Failed to fetch products")

      const data = await res.json()
      const products = data.products || []

      const inventoryRows: InventoryRow[] = []
      for (const product of products) {
        for (const variant of product.variants || []) {
          inventoryRows.push({
            productId: product.id,
            productTitle: product.title || "Untitled",
            variantId: variant.id,
            variantTitle: variant.title || "Default",
            sku: variant.sku || "",
            barcode: variant.barcode || "",
            inventoryQuantity: variant.inventory_quantity ?? 0,
            manageInventory: variant.manage_inventory ?? false,
            thumbnail: product.thumbnail || null,
          })
        }
      }

      setRows(inventoryRows)
    } catch (err) {
      toast.error("Failed to fetch inventory data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.productTitle.toLowerCase().includes(q) ||
        r.variantTitle.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.barcode.toLowerCase().includes(q)
    )
  }, [rows, search])

  const stats = useMemo(() => {
    const total = rows.length
    const tracked = rows.filter((r) => r.manageInventory).length
    const outOfStock = rows.filter(
      (r) => r.manageInventory && r.inventoryQuantity <= 0
    ).length
    const lowStock = rows.filter(
      (r) => r.manageInventory && r.inventoryQuantity > 0 && r.inventoryQuantity <= 5
    ).length
    return { total, tracked, outOfStock, lowStock }
  }, [rows])

  return (
    <div className="flex flex-col gap-4">
      <Toaster />

      <Container className="flex items-center justify-between p-4">
        <div>
          <Heading level="h1">Inventory Overview</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            All products and variants with clear identification
          </Text>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium border border-ui-border-base rounded-md hover:bg-ui-bg-base-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </Container>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Container className="p-4">
          <Text size="small" className="text-ui-fg-subtle">
            Total Variants
          </Text>
          <Heading level="h2">{stats.total}</Heading>
        </Container>
        <Container className="p-4">
          <Text size="small" className="text-ui-fg-subtle">
            Inventory Tracked
          </Text>
          <Heading level="h2">{stats.tracked}</Heading>
        </Container>
        <Container className="p-4">
          <Text size="small" className="text-ui-fg-subtle">
            Out of Stock
          </Text>
          <Heading level="h2" className="text-ui-tag-red-text">
            {stats.outOfStock}
          </Heading>
        </Container>
        <Container className="p-4">
          <Text size="small" className="text-ui-fg-subtle">
            Low Stock (≤5)
          </Text>
          <Heading level="h2" className="text-ui-tag-orange-text">
            {stats.lowStock}
          </Heading>
        </Container>
      </div>

      {/* Search & Table */}
      <Container className="p-4">
        <div className="mb-4">
          <Input
            placeholder="Search by product, variant, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
          />
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <Text className="text-ui-fg-subtle">Loading inventory...</Text>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <Text className="text-ui-fg-subtle">
              {search ? "No matching items found." : "No products found."}
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product — Variant</Table.HeaderCell>
                <Table.HeaderCell>SKU</Table.HeaderCell>
                <Table.HeaderCell>Barcode</Table.HeaderCell>
                <Table.HeaderCell>Stock</Table.HeaderCell>
                <Table.HeaderCell>Tracked</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((row) => (
                <Table.Row key={row.variantId}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {row.thumbnail && (
                        <img
                          src={row.thumbnail}
                          alt=""
                          className="w-8 h-8 rounded object-cover bg-ui-bg-subtle shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ui-fg-base truncate">
                          {row.productTitle}
                        </p>
                        <p className="text-xs text-ui-fg-subtle truncate">
                          {row.variantTitle}
                        </p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-mono text-xs">
                      {row.sku || "—"}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-mono text-xs">
                      {row.barcode || "—"}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {row.manageInventory ? (
                      <Badge
                        color={
                          row.inventoryQuantity <= 0
                            ? "red"
                            : row.inventoryQuantity <= 5
                              ? "orange"
                              : "green"
                        }
                      >
                        {row.inventoryQuantity}
                      </Badge>
                    ) : (
                      <span className="text-xs text-ui-fg-muted">∞</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={row.manageInventory ? "green" : "grey"}>
                      {row.manageInventory ? "Yes" : "No"}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        <div className="mt-3">
          <Text size="small" className="text-ui-fg-muted">
            Showing {filtered.length} of {rows.length} variant
            {rows.length !== 1 ? "s" : ""}
          </Text>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Inventory Overview",
  icon: ArchiveBox,
})

export default InventoryOverviewPage
