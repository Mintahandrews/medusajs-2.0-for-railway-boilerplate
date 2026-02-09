import { defineWidgetConfig } from "@medusajs/admin-sdk"
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

/** Check if a URL is a cloud URL (not a base64 data URL) */
function isCloudUrl(url?: string): boolean {
  return !!url && (url.startsWith("http://") || url.startsWith("https://"))
}

/**
 * Admin widget that displays custom design previews for customized order items.
 * Shown on the order detail page in the Medusa admin dashboard.
 *
 * The widget receives { data } where data is the AdminOrder object directly.
 * It extracts line items with is_customized metadata and shows preview/print links.
 */
const CustomDesignWidget = ({ data }: { data: any }) => {
  const [customItems, setCustomItems] = useState<CustomLineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!data?.id) {
      setLoading(false)
      return
    }

    const orderItems = data.items || []

    const items = orderItems
      .filter((item: any) => {
        const meta = item.metadata
        return meta?.is_customized === "true" || meta?.is_customized === true
      })
      .map((item: any) => ({
        id: item.id,
        title: item.title || item.product_title || "Custom Case",
        variant_title: item.variant_title || item.variant?.title || "",
        quantity: item.quantity,
        metadata: (item.metadata || {}) as LineItemMetadata,
      }))

    setCustomItems(items)
    setLoading(false)
  }, [data])

  if (loading) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-subtle text-sm">Loading custom designs...</Text>
      </Container>
    )
  }

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
        {customItems.map((item) => {
          const hasPreview = !!item.metadata.preview_image
          const hasCloudPreview = isCloudUrl(item.metadata.preview_image)
          const hasPrintFile = isCloudUrl(item.metadata.print_file)

          return (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle"
            >
              {/* Preview thumbnail — works with both cloud URLs and base64 data URLs */}
              <div className="shrink-0">
                {hasPreview ? (
                  <a
                    href={hasCloudPreview ? item.metadata.preview_image : undefined}
                    target={hasCloudPreview ? "_blank" : undefined}
                    rel={hasCloudPreview ? "noopener noreferrer" : undefined}
                  >
                    <img
                      src={item.metadata.preview_image}
                      alt="Design preview"
                      className="w-28 h-40 object-cover rounded-md border border-ui-border-base shadow-sm hover:shadow-md transition-shadow"
                    />
                  </a>
                ) : (
                  <div className="w-28 h-40 rounded-md border border-dashed border-ui-border-base bg-ui-bg-base flex items-center justify-center">
                    <Text size="small" className="text-ui-fg-muted text-center px-2">
                      No preview
                    </Text>
                  </div>
                )}
              </div>

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

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {hasCloudPreview && (
                    <a
                      href={item.metadata.preview_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-ui-bg-base border border-ui-border-base text-ui-fg-base hover:bg-ui-bg-base-hover transition-colors"
                    >
                      View Preview
                    </a>
                  )}
                  {hasPrintFile && (
                    <a
                      href={item.metadata.print_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-ui-button-inverted text-ui-fg-on-inverted hover:bg-ui-button-inverted-hover transition-colors"
                    >
                      Download Print File
                    </a>
                  )}
                </div>

                {/* Warning when cloud files are missing */}
                {!hasPrintFile && (
                  <div className="mt-3 px-3 py-2 rounded-md bg-ui-bg-base border border-orange-200">
                    <Text size="small" className="text-orange-700">
                      Print file not available. The cloud upload may have failed during checkout.
                      {hasPreview && !hasCloudPreview && " A low-res preview thumbnail is shown instead."}
                      {" "}Contact the customer if a high-resolution print file is needed.
                    </Text>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default CustomDesignWidget
