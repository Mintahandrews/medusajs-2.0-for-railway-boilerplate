import { defineWidgetConfig } from "@medusajs/admin-shared"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

type LineItemMetadata = {
  is_customized?: string
  case_type?: string
  device_model?: string
  device_handle?: string
  preview_image?: string
  preview_key?: string
  print_file?: string
  print_file_key?: string
  print_dpi?: string
  print_width_mm?: string
  print_height_mm?: string
  print_bleed_mm?: string
}

type CustomLineItem = {
  id: string
  title: string
  variant_title: string
  quantity: number
  metadata: LineItemMetadata
}

/**
 * Admin widget that displays custom design previews for customized order items.
 * Shown on the order detail page in the Medusa admin dashboard.
 */
const CustomDesignWidget = ({ data }: { data: any }) => {
  const [customItems, setCustomItems] = useState<CustomLineItem[]>([])

  useEffect(() => {
    if (!data?.order?.id) return

    // Extract customized line items from the order
    const items = (data.order.items || [])
      .filter((item: any) => item.metadata?.is_customized === "true")
      .map((item: any) => ({
        id: item.id,
        title: item.title || item.product_title || "Custom Case",
        variant_title: item.variant_title || item.variant?.title || "",
        quantity: item.quantity,
        metadata: item.metadata as LineItemMetadata,
      }))

    setCustomItems(items)
  }, [data?.order?.id, data?.order?.items])

  if (customItems.length === 0) return null

  return (
    <Container className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Heading level="h2">Custom Designs</Heading>
        <Badge color="purple">{customItems.length}</Badge>
      </div>
      <Text className="text-ui-fg-subtle text-sm mb-4">
        These items have customer-uploaded custom designs that need to be printed.
      </Text>

      <div className="grid gap-4">
        {customItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle"
          >
            {/* Preview thumbnail */}
            {item.metadata.preview_image && (
              <div className="shrink-0">
                <a
                  href={item.metadata.preview_image}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={item.metadata.preview_image}
                    alt="Design preview"
                    className="w-24 h-36 object-cover rounded-md border border-ui-border-base shadow-sm hover:shadow-md transition-shadow"
                  />
                </a>
              </div>
            )}

            {/* Item info */}
            <div className="flex-1 min-w-0">
              <Text weight="plus" className="truncate">
                {item.title}
              </Text>
              {item.variant_title && (
                <Text size="small" className="text-ui-fg-subtle">
                  {item.variant_title}
                </Text>
              )}
              <Text size="small" className="text-ui-fg-subtle">
                Qty: {item.quantity}
              </Text>
              {item.metadata.case_type && (
                <Text size="small" className="text-ui-fg-subtle">
                  Case Type: {item.metadata.case_type.charAt(0).toUpperCase() + item.metadata.case_type.slice(1)}
                </Text>
              )}
              {item.metadata.device_model && (
                <Text size="small" className="text-ui-fg-subtle">
                  Device: {item.metadata.device_model}
                </Text>
              )}
              {item.metadata.print_dpi && item.metadata.print_width_mm && item.metadata.print_height_mm && (
                <Text size="small" className="text-ui-fg-subtle">
                  Print: {item.metadata.print_dpi} DPI &middot; {item.metadata.print_width_mm}&times;{item.metadata.print_height_mm}mm &middot; {item.metadata.print_bleed_mm}mm bleed
                </Text>
              )}

              {/* Action links */}
              <div className="flex flex-wrap gap-3 mt-3">
                {item.metadata.preview_image && (
                  <a
                    href={item.metadata.preview_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    View Preview
                  </a>
                )}
                {item.metadata.print_file && (
                  <a
                    href={item.metadata.print_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                  >
                    Download Print File
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default CustomDesignWidget
