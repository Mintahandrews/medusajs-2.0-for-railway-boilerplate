import { unstable_cache } from "next/cache";
import { getProducts, getProductByHandle, getProductById, getNewArrivals, getBestSellers } from "@/lib/medusa-data";
import { transformMedusaProduct, transformMedusaProducts, StorefrontProduct } from "@/types/medusa";

// ==================== PRODUCT QUERIES ====================

/**
 * Get products with ID and title only
 */
export const getProductsIdAndTitle = unstable_cache(
  async () => {
    const { products } = await getProducts(100); // Get up to 100 products
    return products.map((p: any) => ({
      id: p.id,
      title: p.title,
    }));
  },
  ['products-id-title'],
  { tags: ['products'] }
);

/**
 * Get new arrival products
 */
export const getNewArrivalsProduct = unstable_cache(
  async () => {
    const products = await getNewArrivals(8);
    return transformMedusaProducts(products);
  },
  ['new-arrivals'],
  { tags: ['products'] }
);

/**
 * Get best selling products
 */
export const getBestSellingProducts = unstable_cache(
  async () => {
    const products = await getBestSellers(6);
    return transformMedusaProducts(products);
  },
  ['best-sellers'],
  { tags: ['products'] }
);

/**
 * Get latest products (for featured section)
 */
export const getLatestProducts = unstable_cache(
  async () => {
    const products = await getNewArrivals(3);
    return transformMedusaProducts(products);
  },
  ['latest-products'],
  { tags: ['products'] }
);

/**
 * Get all products with optional ordering
 */
export const getAllProducts = unstable_cache(
  async () => {
    const { products } = await getProducts(100);
    return transformMedusaProducts(products);
  },
  ['all-products'],
  { tags: ['products'] }
);

/**
 * Get product by slug/handle
 */
export const getProductBySlug = async (slug: string) => {
  const product = await getProductByHandle(slug);
  if (!product) return null;

  const transformed = transformMedusaProduct(product);

  // Add additional fields expected by the product page
  return {
    ...transformed,
    description: product.description,
    category: product.collection ? {
      title: product.collection.title,
      slug: product.collection.handle,
    } : null,
    additionalInformation: [],
    customAttributes: [],
    body: product.description || '',
    tags: product.tags?.map((t: any) => t.value) || [],
    offers: [],
    sku: product.variants?.[0]?.sku || null,
  };
};

/**
 * Get product by ID
 */
export { getProductById };

/**
 * Get related products based on collection/tags
 */
export const getRelatedProducts = unstable_cache(
  async (category: string, tags: string[] | undefined, currentProductId: string, productTitle: string) => {
    // Get products from the same collection if available
    const { products } = await getProducts(12);

    // Filter out current product and return similar ones
    const filtered = products
      .filter((p: any) => p.id !== currentProductId)
      .slice(0, 8);

    return transformMedusaProducts(filtered);
  },
  ['related-products'],
  { tags: ['products'] }
);
