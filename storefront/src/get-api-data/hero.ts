import { unstable_cache } from "next/cache";
import { getNewArrivals } from "@/lib/medusa-data";
import { getProductPrice, getProductImage } from "@/lib/medusa-data";

// ==================== HERO CONTENT ====================
// Using Medusa products for featured content

/**
 * Get hero banners (using featured products from Medusa)
 */
export const getHeroBanners = unstable_cache(
  async () => {
    const products = await getNewArrivals(3);

    return products.map((product: any, index: number) => ({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle || "New Arrival",
      image: getProductImage(product),
      link: `/products/${product.handle}`,
      order: index,
      product: {
        title: product.title,
        slug: product.handle,
        price: getProductPrice(product) || 0,
        discountedPrice: null,
      },
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));
  },
  ['heroBanners'],
  { tags: ['heroBanners'] }
);

/**
 * Get hero sliders (using featured products from Medusa)
 */
export const getHeroSliders = unstable_cache(
  async () => {
    const products = await getNewArrivals(5);

    return products.map((product: any, index: number) => ({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle || "Featured Product",
      description: product.description?.substring(0, 150) || "",
      image: getProductImage(product),
      link: `/products/${product.handle}`,
      order: index,
      product: {
        title: product.title,
        slug: product.handle,
        shortDescription: product.subtitle || product.description?.substring(0, 100),
        price: getProductPrice(product) || 0,
        discountedPrice: null,
      },
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));
  },
  ['heroSliders'],
  { tags: ['heroSliders'] }
);

/**
 * Get a single hero banner by ID
 */
export const getSingleHeroBanner = async (id: string) => {
  const banners = await getHeroBanners();
  return banners.find((b: any) => b.id === id) || null;
};
