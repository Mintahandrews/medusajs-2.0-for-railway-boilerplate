// Medusa Store API Types for TypeScript
// These types are simplified versions of the full Medusa types for storefront use

export interface MedusaProduct {
    id: string
    title: string
    handle: string
    subtitle: string | null
    description: string | null
    thumbnail: string | null
    status: string
    created_at: string
    updated_at: string
    images: MedusaImage[]
    variants: MedusaVariant[]
    options: MedusaOption[]
    collection?: MedusaCollection | null
    collection_id?: string | null
    categories?: MedusaCategory[]
    tags?: MedusaTag[]
    metadata?: Record<string, unknown>
}

export interface MedusaImage {
    id: string
    url: string
    created_at: string
    updated_at: string
}

export interface MedusaVariant {
    id: string
    title: string
    sku: string | null
    barcode: string | null
    ean: string | null
    upc: string | null
    inventory_quantity: number
    allow_backorder: boolean
    manage_inventory: boolean
    weight: number | null
    length: number | null
    height: number | null
    width: number | null
    product_id: string
    created_at: string
    updated_at: string
    options: MedusaOptionValue[]
    calculated_price?: {
        calculated_amount: number
        original_amount: number
        currency_code: string
    }
    prices?: MedusaPrice[]
}

export interface MedusaOption {
    id: string
    title: string
    product_id: string
    values: MedusaOptionValue[]
}

export interface MedusaOptionValue {
    id: string
    value: string
    option_id: string
}

export interface MedusaPrice {
    id: string
    currency_code: string
    amount: number
    min_quantity: number | null
    max_quantity: number | null
}

export interface MedusaCollection {
    id: string
    title: string
    handle: string
    created_at: string
    updated_at: string
    metadata?: Record<string, unknown>
}

export interface MedusaCategory {
    id: string
    name: string
    handle: string
    description: string | null
    parent_category_id: string | null
    created_at: string
    updated_at: string
}

export interface MedusaTag {
    id: string
    value: string
    created_at: string
    updated_at: string
}

export interface MedusaRegion {
    id: string
    name: string
    currency_code: string
    tax_rate: number
    tax_code: string | null
    countries: MedusaCountry[]
    payment_providers: MedusaPaymentProvider[]
    created_at: string
    updated_at: string
}

export interface MedusaCountry {
    id: string
    name: string
    iso_2: string
    iso_3: string
    num_code: number
    display_name: string
    region_id: string
}

export interface MedusaPaymentProvider {
    id: string
    is_installed: boolean
}

export interface MedusaCart {
    id: string
    email: string | null
    billing_address_id: string | null
    shipping_address_id: string | null
    region_id: string
    region: MedusaRegion
    items: MedusaLineItem[]
    subtotal: number
    tax_total: number
    shipping_total: number
    discount_total: number
    total: number
    created_at: string
    updated_at: string
}

export interface MedusaLineItem {
    id: string
    cart_id: string
    title: string
    description: string | null
    thumbnail: string | null
    variant_id: string
    variant: MedusaVariant
    product_id: string
    quantity: number
    unit_price: number
    subtotal: number
    tax_total: number
    total: number
    created_at: string
    updated_at: string
}

export interface MedusaCustomer {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    has_account: boolean
    created_at: string
    updated_at: string
    metadata?: Record<string, unknown>
}

// Helper type for transforming Medusa products to storefront format
export interface StorefrontProduct {
    id: string
    title: string
    slug: string
    shortDescription: string | null
    description: string | null
    price: number
    discountedPrice: number | null
    quantity: number
    updatedAt: string
    reviews: number
    productVariants: {
        image: string | null
        color: string | null
        size: string | null
        isDefault: boolean
    }[]
}

/**
 * Transform a Medusa product to storefront format
 */
export function transformMedusaProduct(product: any): StorefrontProduct {
    const defaultVariant = product?.variants?.[0]
    const price = defaultVariant?.calculated_price?.calculated_amount ||
        defaultVariant?.prices?.[0]?.amount || 0

    return {
        id: product?.id || '',
        title: product?.title || '',
        slug: product?.handle || '',
        shortDescription: product?.subtitle || null,
        description: product?.description || null,
        price: price,
        discountedPrice: null, // Medusa handles discounts differently
        quantity: product?.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0,
        updatedAt: product?.updated_at || new Date().toISOString(),
        reviews: 0, // Would need separate reviews system
        productVariants: product?.variants?.map((variant: any, index: number) => ({
            image: product?.images?.[index]?.url || product?.thumbnail || null,
            color: variant?.options?.find((o: any) => o.value?.toLowerCase?.()?.includes('color'))?.value || null,
            size: variant?.options?.find((o: any) => o.value?.toLowerCase?.()?.includes('size'))?.value || null,
            isDefault: index === 0,
        })) || [{
            image: product?.thumbnail || null,
            color: null,
            size: null,
            isDefault: true,
        }],
    }
}

/**
 * Transform multiple Medusa products to storefront format
 */
export function transformMedusaProducts(products: any[]): StorefrontProduct[] {
    if (!products || !Array.isArray(products)) return []
    return products.map(transformMedusaProduct)
}

