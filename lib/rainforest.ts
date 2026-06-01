type RainforestPrice = {
  currency?: string;
  value?: number;
};

type RainforestSearchResult = {
  asin?: string;
  title?: string;
  image?: string;
  link?: string;
  rank?: number;
  price?: RainforestPrice;
};

type RainforestSearchResponse = {
  search_results?: RainforestSearchResult[];
  bestsellers?: RainforestSearchResult[];
};

export type AmazonSyncItem = {
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    status: "active" | "draft";
    image_url: string;
    reason: string;
    tags: Record<string, never>;
    signals: { clicks: number; saves: number; recommendations: number; freshness: number };
    source: "amazon";
    source_metadata: Record<string, string>;
    updated_at: string;
  };
  offer: {
    id: string;
    product_id: string;
    merchant: "Amazon";
    marketplace: "US";
    source: "amazon";
    external_product_id: string;
    price: number | null;
    currency: "USD";
    availability: "in_stock";
    affiliate_url: string;
    last_synced_at: string;
    updated_at: string;
  };
};

export const defaultAmazonQueries = [
  "gift for mom",
  "gift for dad",
  "gift for teen",
  "gift for coworker",
  "coffee lover gift",
  "cooking gift",
  "wellness gift",
  "tech gift",
  "reading gift",
  "outdoor gift",
  "travel gift",
  "self care gift",
  "housewarming gift",
  "birthday gift for her",
  "birthday gift for him"
];

export const defaultAmazonLists = [
  { label: "gift ideas home", url: "https://www.amazon.com/gp/most-gifted/home-garden" },
  { label: "gift ideas beauty", url: "https://www.amazon.com/gp/most-gifted/beauty" },
  { label: "gift ideas kitchen", url: "https://www.amazon.com/gp/most-gifted/kitchen" },
  { label: "gift ideas toys", url: "https://www.amazon.com/gp/most-gifted/toys-and-games" },
  { label: "most wished for home", url: "https://www.amazon.com/gp/most-wished-for/home-garden" },
  { label: "most wished for beauty", url: "https://www.amazon.com/gp/most-wished-for/beauty" },
  { label: "best sellers home", url: "https://www.amazon.com/gp/bestsellers/home-garden" },
  { label: "best sellers kitchen", url: "https://www.amazon.com/gp/bestsellers/kitchen" },
  { label: "best sellers toys", url: "https://www.amazon.com/gp/bestsellers/toys-and-games" }
];

function requiredRainforestConfig() {
  const apiKey = process.env.RAINFOREST_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    associatesTag: process.env.AMAZON_ASSOCIATES_TAG || "giftwise081-20"
  };
}

export function isRainforestConfigured() {
  return Boolean(requiredRainforestConfig());
}

const excludedTitleTerms = [
  "replacement",
  "refill",
  "replenishment",
  "compatible with",
  "accessory only",
  "spare part",
  "filter cartridge"
];

function mapRainforestItem(item: RainforestSearchResult, discoveryLabel: string, status: "active" | "draft"): AmazonSyncItem | null {
  const asin = item.asin?.trim().toUpperCase() || "";
  const title = item.title?.trim() || "";
  const imageUrl = item.image || "";
  if (!asin || !title || !imageUrl) return null;
  if (excludedTitleTerms.some((term) => title.toLowerCase().includes(term))) return null;

  const config = requiredRainforestConfig();
  if (!config) throw new Error("Rainforest API key is not configured.");
  const now = new Date().toISOString();
  const productId = `amazon-${asin.toLowerCase()}`;
  const price = Number(item.price?.value);
  return {
    product: {
      id: productId,
      name: title,
      brand: "",
      category: "",
      status,
      image_url: imageUrl,
      reason: "Discovered from Amazon and awaiting gift-quality review.",
      tags: {},
      signals: { clicks: 0, saves: 0, recommendations: 0, freshness: 1 },
      source: "amazon",
      source_metadata: {
        asin,
        discoveryLabel,
        productUrl: item.link || "",
        ...(item.rank ? { rank: String(item.rank) } : {})
      },
      updated_at: now
    },
    offer: {
      id: `offer-${productId}`,
      product_id: productId,
      merchant: "Amazon",
      marketplace: "US",
      source: "amazon",
      external_product_id: asin,
      price: Number.isFinite(price) && price > 0 ? price : null,
      currency: "USD",
      availability: "in_stock",
      affiliate_url: `https://www.amazon.com/dp/${asin}?tag=${config.associatesTag}`,
      last_synced_at: now,
      updated_at: now
    }
  };
}

export async function discoverAmazonItems(query: string, page = 1, resultLimit = 10) {
  const config = requiredRainforestConfig();
  if (!config) throw new Error("Rainforest API key is not configured.");
  const params = new URLSearchParams({
    api_key: config.apiKey,
    type: "search",
    amazon_domain: "amazon.com",
    search_term: query,
    page: String(page)
  });
  const response = await fetch(`https://api.rainforestapi.com/request?${params}`);
  if (!response.ok) throw new Error(`Rainforest API failed: ${response.status}`);
  const payload = await response.json() as RainforestSearchResponse;
  return (payload.search_results || [])
    .map((item) => mapRainforestItem(item, query, "draft"))
    .filter((item): item is AmazonSyncItem => item !== null)
    .slice(0, resultLimit);
}

export async function discoverAmazonListItems(label: string, url: string, page = 1, resultLimit = 20) {
  const config = requiredRainforestConfig();
  if (!config) throw new Error("Rainforest API key is not configured.");
  const params = new URLSearchParams({
    api_key: config.apiKey,
    type: "bestsellers",
    url,
    page: String(page)
  });
  const response = await fetch(`https://api.rainforestapi.com/request?${params}`);
  if (!response.ok) throw new Error(`Rainforest API failed: ${response.status}`);
  const payload = await response.json() as RainforestSearchResponse;
  return (payload.bestsellers || [])
    .map((item) => mapRainforestItem(item, label, "active"))
    .filter((item): item is AmazonSyncItem => item !== null)
    .slice(0, resultLimit);
}
