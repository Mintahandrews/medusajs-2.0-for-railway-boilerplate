import { unstable_cache } from "next/cache";

// ==================== HEADER SETTINGS ====================
// Using environment variables since we removed Prisma

export const getHeaderSettings = unstable_cache(
  async () => {
    return {
      headerLogo: process.env.HEADER_LOGO || "/images/logo.svg",
      emailLogo: process.env.EMAIL_LOGO || "/images/logo.png",
      topBarText: process.env.TOP_BAR_TEXT || "Free shipping on orders over $50!",
      showTopBar: process.env.SHOW_TOP_BAR !== "false",
      showSearch: process.env.SHOW_SEARCH !== "false",
      showCart: process.env.SHOW_CART !== "false",
      showWishlist: process.env.SHOW_WISHLIST !== "false",
    };
  },
  ['header-setting'],
  { tags: ['header-setting'] }
);
