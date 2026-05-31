import type { Marketplace } from "./types";

type EbayMarketplace = "EBAY_US" | "EBAY_CA";

type EbaySearchItem = {
  itemId?: string;
  title?: string;
  itemAffiliateWebUrl?: string;
  itemWebUrl?: string;
  image?: { imageUrl?: string };
  price?: { value?: string; currency?: string };
  condition?: string;
  categories?: Array<{ categoryName?: string }>;
};

type EbaySearchResponse = {
  itemSummaries?: EbaySearchItem[];
};

export type EbaySyncItem = {
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    status: "draft";
    image_url: string;
    reason: string;
    tags: Record<string, never>;
    signals: { clicks: number; saves: number; recommendations: number; freshness: number };
    source: "ebay";
    source_metadata: Record<string, string>;
    updated_at: string;
  };
  offer: {
    id: string;
    product_id: string;
    merchant: "eBay";
    marketplace: Marketplace;
    source: "ebay";
    external_product_id: string;
    price: number;
    currency: "USD" | "CAD";
    availability: "in_stock";
    affiliate_url: string;
    last_synced_at: string;
    updated_at: string;
  };
};

const ebayMarketplaces: Record<Marketplace, EbayMarketplace> = {
  US: "EBAY_US",
  CA: "EBAY_CA"
};

export const defaultEbayQueries = [
  "gift for mom",
  "gift for dad",
  "gift for coworker",
  "housewarming gift",
  "coffee lover gift",
  "graduation gift",
  "gifts under 50"
];

function requiredEbayConfig() {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const campaignId = process.env.EBAY_CAMPAIGN_ID;
  if (!clientId || !clientSecret || !campaignId) return null;
  return { clientId, clientSecret, campaignId };
}

export function isEbayConfigured() {
  return Boolean(requiredEbayConfig());
}

async function getEbayAccessToken() {
  const config = requiredEbayConfig();
  if (!config) throw new Error("eBay credentials are not configured.");
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope"
    })
  });
  if (!response.ok) throw new Error(`eBay OAuth failed: ${response.status}`);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("eBay OAuth response did not include an access token.");
  return payload.access_token;
}

function mapEbayItem(item: EbaySearchItem, marketplace: Marketplace): EbaySyncItem | null {
  const itemId = item.itemId || "";
  const title = item.title?.trim() || "";
  const affiliateUrl = item.itemAffiliateWebUrl || "";
  const imageUrl = item.image?.imageUrl || "";
  const price = Number(item.price?.value || 0);
  const expectedCurrency = marketplace === "CA" ? "CAD" : "USD";
  if (!itemId || !title || !affiliateUrl || !imageUrl || !Number.isFinite(price) || price <= 0 || price > 1000) return null;
  if (item.condition && item.condition.toUpperCase() !== "NEW") return null;
  const now = new Date().toISOString();
  const stableId = Buffer.from(`${marketplace}:${itemId}`).toString("base64url");
  const productId = `ebay-${stableId}`;
  return {
    product: {
      id: productId,
      name: title,
      brand: "",
      category: item.categories?.[0]?.categoryName || "",
      status: "draft",
      image_url: imageUrl,
      reason: "Discovered from eBay and awaiting gift-quality review.",
      tags: {},
      signals: { clicks: 0, saves: 0, recommendations: 0, freshness: 1 },
      source: "ebay",
      source_metadata: { marketplace, itemWebUrl: item.itemWebUrl || "" },
      updated_at: now
    },
    offer: {
      id: `offer-${productId}`,
      product_id: productId,
      merchant: "eBay",
      marketplace,
      source: "ebay",
      external_product_id: itemId,
      price,
      currency: expectedCurrency,
      availability: "in_stock",
      affiliate_url: affiliateUrl,
      last_synced_at: now,
      updated_at: now
    }
  };
}

export async function discoverEbayItems(query: string, marketplace: Marketplace, limit = 30) {
  const config = requiredEbayConfig();
  if (!config) throw new Error("eBay credentials are not configured.");
  const accessToken = await getEbayAccessToken();
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-EBAY-C-MARKETPLACE-ID": ebayMarketplaces[marketplace],
      "X-EBAY-C-ENDUSERCTX": `affiliateCampaignId=${config.campaignId}`
    }
  });
  if (!response.ok) throw new Error(`eBay Browse API failed: ${response.status}`);
  const payload = await response.json() as EbaySearchResponse;
  return (payload.itemSummaries || [])
    .map((item) => mapEbayItem(item, marketplace))
    .filter((item): item is EbaySyncItem => item !== null);
}
