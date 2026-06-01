export type Marketplace = "US" | "CA";
export type CatalogSource = "manual" | "ebay" | "amazon" | "awin";
export type GiftMode = "dna" | "badly" | "panic" | "duel";

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
  source?: CatalogSource;
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
  source?: CatalogSource;
};

export type Catalog = {
  products: Product[];
  merchantOffers: MerchantOffer[];
};

export type FinderInputs = {
  brief: string;
  mode: GiftMode;
  marketplace: Marketplace;
  answers?: {
    recipient?: string;
    personality?: string;
    interest?: string;
    occasion?: string;
    budget?: number;
  };
  excludedProductIds?: string[];
};

export type Recommendation = {
  product: Product;
  offer: MerchantOffer;
  score: number;
  personalizedReason?: string;
  caution?: string;
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

export type DuelChoiceEvent = {
  id: string;
  createdAt: string;
  recommendationEventId: string | null;
  marketplace: Marketplace;
  brief: string;
  winnerProductId: string;
  loserProductId: string;
};
