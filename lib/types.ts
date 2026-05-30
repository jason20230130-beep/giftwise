export type Marketplace = "US" | "CA";

export type Option = {
  value: string;
  label: string;
};

export type ProductStatus = "draft" | "active" | "featured" | "suppressed" | "archived";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  status: ProductStatus;
  image: string;
  reason: string;
  tags: Record<string, number>;
  signals: {
    clicks: number;
    saves: number;
    recommendations: number;
    freshness: number;
  };
};

export type MerchantOffer = {
  id: string;
  productId: string;
  merchant: string;
  marketplace: Marketplace;
  externalProductId: string;
  price: number;
  currency: "USD" | "CAD";
  availability: "in_stock" | "out_of_stock" | "unknown";
  affiliateUrl: string;
  commissionRate: number | null;
  lastSyncedAt: string | null;
};

export type Catalog = {
  products: Product[];
  merchantOffers: MerchantOffer[];
};

export type FinderInputs = {
  recipient: string;
  relationship: string;
  occasion: string;
  ageRange: string;
  budget: number;
  marketplace: Marketplace;
  timing: string;
  interests: string[];
  styles: string[];
  avoidances: string[];
};

export type Recommendation = {
  product: Product;
  offer: MerchantOffer;
  score: number;
};

export type RecommendationEvent = {
  id: string;
  createdAt: string;
  inputs: FinderInputs;
  marketplace: Marketplace;
  recommendedProducts: Array<{
    productId: string;
    offerId: string;
    merchant: string;
    marketplace: Marketplace;
    score: number;
    position: number;
  }>;
};

export type ClickEvent = {
  id: string;
  createdAt: string;
  productId: string;
  offerId: string;
  merchant: string | null;
  marketplace: Marketplace;
  placement: "recommendation-card";
};
