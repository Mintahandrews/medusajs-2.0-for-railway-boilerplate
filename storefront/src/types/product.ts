

export type Product = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  slug: string;
  quantity: number;
  updatedAt: Date | string;
  reviews: number;
  shortDescription: string | null;
  productVariants: {
    color: string | null;
    image: string | null;
    size: string | null;
    isDefault: boolean;
  }[];
};


export type IProductByDetails = {
  id: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  discountedPrice?: number | null;
  slug: string;
  quantity: number;
  updatedAt: Date | string;
  category: {
    title: string;
    slug: string;
  } | null;
  productVariants: {
    color: string | null;
    image: string | null;
    size: string | null;
    isDefault: boolean;
  }[];
  reviews: number;
  additionalInformation: {
    name: string;
    description: string;
  }[];
  customAttributes: {
    attributeName: string;
    attributeValues: {
      id: string;
      title: string;
    }[];
  }[];
  body: string | null;
  tags: string[] | null;
  offers: string[] | null;
  sku: string | null;
};

