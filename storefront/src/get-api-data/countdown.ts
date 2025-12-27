import { unstable_cache } from "next/cache";
import { getNewArrivals } from "@/lib/medusa-data";
import { getProductPrice, getProductImage } from "@/lib/medusa-data";

// ==================== COUNTDOWN/DEALS ====================
// Using Medusa products for countdown deals

/**
 * Get countdown deals (using featured products)
 */
export const getCountdowns = unstable_cache(
  async () => {
    const products = await getNewArrivals(3);

    // Create countdown deals based on products
    // In a real app, you might want to add a "sale_ends_at" metadata field to products
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // Deal ends in 7 days

    return products.map((product: any) => ({
      id: product.id,
      title: "Limited Time Offer",
      subtitle: "Don't Miss This Deal",
      endDate: futureDate.toISOString(),
      countdownImage: getProductImage(product),
      link: `/products/${product.handle}`,
      discountPercentage: 20, // Default discount
      product: {
        title: product.title,
        price: getProductPrice(product) || 0,
      },
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));
  },
  ['countdowns'],
  { tags: ['countdowns'] }
);