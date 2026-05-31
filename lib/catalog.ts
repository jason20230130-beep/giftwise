import { merchantOffers as fallbackOffers, products as fallbackProducts } from "./data";
import { getSupabaseBrowserClient } from "./supabase";
import type { Catalog, Marketplace, MerchantOffer, Product, ProductStatus } from "./types";

type ProductRow = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  status: ProductStatus;
  image_url: string;
  reason: string;
  tags: Record<string, number>;
  signals: Product["signals"];
};

type OfferRow = {
  id: string;
  product_id: string;
  merchant: string;
  marketplace: MerchantOffer["marketplace"];
  external_product_id: string | null;
  price: number | null;
  currency: MerchantOffer["currency"] | null;
  availability: MerchantOffer["availability"];
  affiliate_url: string;
  commission_rate: number | null;
  last_synced_at: string | null;
};

export const fallbackCatalog: Catalog = {
  products: fallbackProducts,
  merchantOffers: fallbackOffers
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || "",
    category: row.category || "",
    status: row.status,
    image: row.image_url,
    reason: row.reason,
    tags: row.tags || {},
    signals: row.signals || { clicks: 0, saves: 0, recommendations: 0, freshness: 1 }
  };
}

function mapOffer(row: OfferRow): MerchantOffer {
  return {
    id: row.id,
    productId: row.product_id,
    merchant: row.merchant,
    marketplace: row.marketplace,
    externalProductId: row.external_product_id || "",
    price: Number(row.price || 0),
    currency: row.currency || "USD",
    availability: row.availability,
    affiliateUrl: row.affiliate_url,
    commissionRate: row.commission_rate,
    lastSyncedAt: row.last_synced_at
  };
}

export async function fetchCatalog(): Promise<Catalog> {
  const supabase = getSupabaseBrowserClient();

  const [{ data: productRows, error: productError }, { data: offerRows, error: offerError }] = await Promise.all([
    supabase.from("products").select("id,name,brand,category,status,image_url,reason,tags,signals").in("status", ["active", "featured"]),
    supabase.from("merchant_offers").select("id,product_id,merchant,marketplace,external_product_id,price,currency,availability,affiliate_url,commission_rate,last_synced_at").eq("availability", "in_stock")
  ]);

  if (productError || offerError || !productRows?.length || !offerRows?.length) {
    if (productError) console.warn("Supabase products fetch failed", productError.message);
    if (offerError) console.warn("Supabase offers fetch failed", offerError.message);
    return fallbackCatalog;
  }

  return {
    products: (productRows as ProductRow[]).map(mapProduct),
    merchantOffers: (offerRows as OfferRow[]).map(mapOffer)
  };
}

export async function fetchCatalogForMarketplace(marketplace: Marketplace): Promise<Catalog> {
  const catalog = await fetchCatalog();
  const merchantOffers = catalog.merchantOffers.filter((offer) => (
    offer.marketplace === marketplace
    && offer.availability === "in_stock"
    && Boolean(offer.affiliateUrl)
  ));
  const productIds = new Set(merchantOffers.map((offer) => offer.productId));
  return {
    products: catalog.products.filter((product) => productIds.has(product.id)),
    merchantOffers
  };
}
