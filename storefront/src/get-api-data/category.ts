import { unstable_cache } from "next/cache";
import { getCollections, getCollectionByHandle } from "@/lib/medusa-data";

// ==================== CATEGORY/COLLECTION QUERIES ====================

/**
 * Get all categories (Medusa collections)
 */
export const getCategories = unstable_cache(
  async () => {
    const collections = await getCollections();
    return collections.map((c: any) => ({
      id: c.id,
      title: c.title,
      slug: c.handle,
      description: c.metadata?.description || null,
      img: c.metadata?.image || null,
      updatedAt: c.updated_at,
      createdAt: c.created_at,
    }));
  },
  ['categories'],
  { tags: ['categories'] }
);

/**
 * Get category by slug/handle
 */
export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    const collection = await getCollectionByHandle(slug);
    if (!collection) return null;

    return {
      id: collection.id,
      title: collection.title,
      slug: collection.handle,
      description: collection.metadata?.description || null,
      img: collection.metadata?.image || null,
      updatedAt: collection.updated_at,
      createdAt: collection.created_at,
    };
  },
  ['categories'],
  { tags: ['categories'] }
);

/**
 * Get category by ID
 */
export const getCategoryById = unstable_cache(
  async (id: string) => {
    // For Medusa, we can use the collections list and filter
    const collections = await getCollections();
    const collection = collections.find((c: any) => c.id === id);

    if (!collection) return null;

    return {
      id: collection.id,
      title: collection.title,
      slug: collection.handle,
      description: collection.metadata?.description || null,
      img: collection.metadata?.image || null,
      updatedAt: collection.updated_at,
      createdAt: collection.created_at,
    };
  },
  ['categories'],
  { tags: ['categories'] }
);