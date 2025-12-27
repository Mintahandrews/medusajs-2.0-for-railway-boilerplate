import { medusa } from "./medusa"

// ==================== PRODUCTS ====================

/**
 * Get all products with optional pagination
 */
export async function getProducts(limit = 12, offset = 0) {
    if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
        console.warn("WARNING: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing. Requests to Medusa may fail.");
    }
    try {
        const { products, count } = await medusa.store.product.list({
            limit,
            offset,
        })
        return { products: products || [], count: count || 0 }
    } catch (error) {
        // @ts-ignore
        if (error?.status === 400 && error?.message?.includes("x-publishable-api-key")) {
            console.error("CRITICAL ERROR: Missing Publishable API Key. Please add NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY to your env vars.")
        } else {
            console.error("Error fetching products:", error)
        }
        return { products: [], count: 0 }
    }
}

/**
 * Get product by handle/slug
 */
export async function getProductByHandle(handle: string) {
    try {
        const { products } = await medusa.store.product.list({
            handle,
        })
        return products?.[0] || null
    } catch (error) {
        // @ts-ignore
        if (error?.status === 400 && error?.message?.includes("x-publishable-api-key")) {
            console.error("CRITICAL ERROR: Missing Publishable API Key.")
        } else {
            console.error("Error fetching product by handle:", error)
        }
        return null
    }
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string) {
    try {
        const { product } = await medusa.store.product.retrieve(productId)
        return product || null
    } catch (error) {
        // @ts-ignore
        if (error?.status === 400 && error?.message?.includes("x-publishable-api-key")) {
            console.error("CRITICAL ERROR: Missing Publishable API Key.")
        } else {
            console.error("Error fetching product by ID:", error)
        }
        return null
    }
}

/**
 * Get new arrivals (most recently created products)
 */
export async function getNewArrivals(limit = 8) {
    if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
        console.warn("WARNING: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY missing for new arrivals.");
    }
    try {
        const { products } = await medusa.store.product.list({
            limit,
            order: "-created_at",
        })
        return products || []
    } catch (error) {
        // @ts-ignore
        if (error?.status === 400 && error?.message?.includes("x-publishable-api-key")) {
            console.error("CRITICAL ERROR (New Arrivals): Missing Publishable API Key.")
        } else {
            console.error("Error fetching new arrivals:", error)
        }
        return []
    }
}

/**
 * Get best sellers (featured products or by sales if available)
 */
export async function getBestSellers(limit = 6) {
    if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
        console.warn("WARNING: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY missing for best sellers.");
    }
    try {
        // For now, get featured products or latest updated
        const { products } = await medusa.store.product.list({
            limit,
            order: "-updated_at",
        })
        return products || []
    } catch (error) {
        // @ts-ignore
        if (error?.status === 400 && error?.message?.includes("x-publishable-api-key")) {
            console.error("CRITICAL ERROR (Best Sellers): Missing Publishable API Key.")
        } else {
            console.error("Error fetching best sellers:", error)
        }
        return []
    }
}

// ==================== COLLECTIONS/CATEGORIES ====================

/**
 * Get all collections (product categories)
 */
export async function getCollections() {
    if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
        console.warn("WARNING: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY missing for collections.");
    }
    try {
        const { collections } = await medusa.store.collection.list()
        return collections || []
    } catch (error) {
        // @ts-ignore
        if (error?.status === 400 && error?.message?.includes("x-publishable-api-key")) {
            console.error("CRITICAL ERROR (Collections): Missing Publishable API Key.")
        } else {
            console.error("Error fetching collections:", error)
        }
        return []
    }
}

/**
 * Get collection by handle
 */
export async function getCollectionByHandle(handle: string) {
    try {
        const { collections } = await medusa.store.collection.list({
            handle: [handle],
        })
        return collections?.[0] || null
    } catch (error) {
        // @ts-ignore
        if (error?.status === 400 && error?.message?.includes("x-publishable-api-key")) {
            console.error("CRITICAL ERROR: Missing Publishable API Key.")
        } else {
            console.error("Error fetching collection:", error)
        }
        return null
    }
}

/**
 * Get products by collection ID
 */
export async function getProductsByCollection(collectionId: string, limit = 12) {
    try {
        const { products } = await medusa.store.product.list({
            collection_id: [collectionId],
            limit,
        })
        return products || []
    } catch (error) {
        // @ts-ignore
        if (error?.status === 400 && error?.message?.includes("x-publishable-api-key")) {
            console.error("CRITICAL ERROR: Missing Publishable API Key.")
        } else {
            console.error("Error fetching products by collection:", error)
        }
        return []
    }
}

// ==================== REGIONS ====================

/**
 * Get all regions
 */
export async function getRegions() {
    try {
        const { regions } = await medusa.store.region.list()
        return regions || []
    } catch (error) {
        console.error("Error fetching regions:", error)
        return []
    }
}

/**
 * Get region by ID
 */
export async function getRegionById(regionId: string) {
    try {
        const { region } = await medusa.store.region.retrieve(regionId)
        return region || null
    } catch (error) {
        console.error("Error fetching region:", error)
        return null
    }
}

// ==================== CART ====================

/**
 * Create a new cart
 */
export async function createCart(regionId?: string) {
    try {
        const { cart } = await medusa.store.cart.create({
            region_id: regionId,
        })
        return cart
    } catch (error) {
        console.error("Error creating cart:", error)
        return null
    }
}

/**
 * Get cart by ID
 */
export async function getCart(cartId: string) {
    try {
        const { cart } = await medusa.store.cart.retrieve(cartId)
        return cart
    } catch (error) {
        console.error("Error fetching cart:", error)
        return null
    }
}

/**
 * Add item to cart
 */
export async function addToCart(cartId: string, variantId: string, quantity = 1) {
    try {
        const { cart } = await medusa.store.cart.createLineItem(cartId, {
            variant_id: variantId,
            quantity,
        })
        return cart
    } catch (error) {
        console.error("Error adding to cart:", error)
        return null
    }
}

/**
 * Update cart line item quantity
 */
export async function updateCartItem(cartId: string, lineItemId: string, quantity: number) {
    try {
        const { cart } = await medusa.store.cart.updateLineItem(cartId, lineItemId, {
            quantity,
        })
        return cart
    } catch (error) {
        console.error("Error updating cart item:", error)
        return null
    }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartId: string, lineItemId: string) {
    try {
        await medusa.store.cart.deleteLineItem(cartId, lineItemId)
        // After deletion, fetch the updated cart
        const { cart } = await medusa.store.cart.retrieve(cartId)
        return cart
    } catch (error) {
        console.error("Error removing from cart:", error)
        return null
    }
}

// ==================== HELPERS ====================

/**
 * Get the cheapest variant price for a product
 */
export function getProductPrice(product: any) {
    if (!product?.variants?.length) return null

    const prices = product.variants
        .map((v: any) => v.calculated_price?.calculated_amount)
        .filter((p: any) => p !== undefined && p !== null)

    if (prices.length === 0) return null

    return Math.min(...prices)
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currencyCode = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
    }).format(amount / 100)
}

/**
 * Get product thumbnail or first image
 */
export function getProductImage(product: any) {
    return product?.thumbnail || product?.images?.[0]?.url || "/images/placeholder.png"
}
