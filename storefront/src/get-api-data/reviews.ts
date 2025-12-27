import { unstable_cache } from "next/cache";

// ==================== REVIEWS ====================
// Reviews would typically be stored in a separate system or as Medusa metadata
// For now, returning empty reviews. You can integrate a review service later.

export interface Review {
  id: string;
  name: string;
  email: string;
  comment: string;
  ratings: number;
  productSlug: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get reviews for a product
 * Note: Medusa doesn't have built-in reviews. Integrate with a review service
 * like Judge.me, Yotpo, or build your own review system.
 */
export const getReviews = unstable_cache(
  async (productSlug: string) => {
    // TODO: Integrate with a review service or Medusa product metadata
    const reviews: Review[] = [];

    return {
      reviews,
      avgRating: 0,
      totalRating: 0,
    };
  },
  ["reviews"],
  { tags: ["reviews"] }
);

/**
 * Get all reviews (for admin or testimonials)
 */
export const getAllReviews = unstable_cache(
  async () => {
    // TODO: Integrate with a review service
    return [];
  },
  ["all-reviews"],
  { tags: ["reviews"] }
);
