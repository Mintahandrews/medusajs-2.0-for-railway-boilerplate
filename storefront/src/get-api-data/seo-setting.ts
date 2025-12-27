import { unstable_cache } from "next/cache";

// ==================== SEO SETTINGS ====================
// These are now static/environment-based since we removed Prisma
// You can extend this to use Medusa's store settings API if needed

/**
 * Get SEO settings
 */
export const getSeoSettings = unstable_cache(
  async () => {
    return {
      siteTitle: process.env.SITE_TITLE || "Letcase - Tech Store",
      metadescription: process.env.SITE_DESCRIPTION || "Your premium destination for tech accessories and gadgets. Shop the latest phone cases, chargers, and tech gear.",
      metaKeywords: process.env.SITE_KEYWORDS || "tech store, phone cases, accessories, gadgets, electronics, Letcase",
      metaImage: process.env.SITE_IMAGE || null,
      favicon: process.env.SITE_FAVICON || "/favicon.ico",
      gtmId: process.env.GTM_ID || null,
    };
  },
  ['seo-setting'],
  { tags: ['seo-setting'] }
);

/**
 * Get site name
 */
export const getSiteName = unstable_cache(
  async () => {
    return process.env.SITE_NAME || "Letcase";
  },
  ['site-name'],
  { tags: ['site-name'] }
);

/**
 * Get logo
 */
export const getLogo = unstable_cache(
  async () => {
    return process.env.SITE_LOGO || "/images/logo.svg";
  },
  ['header-logo'],
  { tags: ['header-logo'] }
);

/**
 * Get email logo
 */
export const getEmailLogo = unstable_cache(
  async () => {
    return process.env.EMAIL_LOGO || "/images/logo.png";
  },
  ['email-logo'],
  { tags: ['email-logo'] }
);
