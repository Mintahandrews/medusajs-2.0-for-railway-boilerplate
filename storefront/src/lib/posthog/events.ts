import posthog from "posthog-js"

/**
 * PostHog e-commerce event helpers.
 * These fire client-side events that complement the server-side
 * Medusa Analytics Module (order_placed, etc.).
 */

export function trackProductViewed(product: {
  id: string
  title: string
  handle?: string
  thumbnail?: string | null
  collection?: { title: string } | null
  price?: string
}) {
  posthog.capture("product_viewed", {
    product_id: product.id,
    product_name: product.title,
    product_handle: product.handle,
    product_image: product.thumbnail,
    collection: product.collection?.title,
    price: product.price,
  })
}

export function trackAddToCart(item: {
  variant_id: string
  product_id?: string
  title: string
  quantity: number
  price?: string
}) {
  posthog.capture("add_to_cart", {
    variant_id: item.variant_id,
    product_id: item.product_id,
    product_name: item.title,
    quantity: item.quantity,
    price: item.price,
  })
}

export function trackRemoveFromCart(item: {
  variant_id: string
  product_id?: string
  title: string
}) {
  posthog.capture("remove_from_cart", {
    variant_id: item.variant_id,
    product_id: item.product_id,
    product_name: item.title,
  })
}

export function trackSearch(query: string, resultCount?: number) {
  posthog.capture("search", {
    search_query: query,
    result_count: resultCount,
  })
}

export function trackCheckoutStarted(cart: {
  id: string
  total?: number
  items_count?: number
}) {
  posthog.capture("checkout_started", {
    cart_id: cart.id,
    cart_total: cart.total,
    items_count: cart.items_count,
  })
}

export function trackCheckoutCompleted(order: {
  id: string
  total?: number
  items_count?: number
}) {
  posthog.capture("checkout_completed", {
    order_id: order.id,
    order_total: order.total,
    items_count: order.items_count,
  })
}

export function trackCategoryViewed(category: {
  id: string
  name: string
  handle?: string
}) {
  posthog.capture("category_viewed", {
    category_id: category.id,
    category_name: category.name,
    category_handle: category.handle,
  })
}

export function trackCollectionViewed(collection: {
  id: string
  title: string
  handle?: string
}) {
  posthog.capture("collection_viewed", {
    collection_id: collection.id,
    collection_name: collection.title,
    collection_handle: collection.handle,
  })
}

export function identifyUser(customerId: string, traits?: Record<string, any>) {
  posthog.identify(customerId, traits)
}

export function resetUser() {
  posthog.reset()
}
