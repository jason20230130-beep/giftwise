import { fallbackCatalog } from "./catalog";
import { getSupabaseBrowserClient } from "./supabase";
import type { Catalog, ClickEvent, DuelChoiceEvent, FinderInputs, Marketplace, Recommendation, RecommendationEvent } from "./types";

const recommendationKey = "giftwise_recommendation_events";
const clickKey = "giftwise_click_events";
const clicksKey = "giftwise_clicks";
const duelChoicesKey = "giftwise_duel_choice_events";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readClicks(): Record<string, number> {
  return readJson<Record<string, number>>(clicksKey, {});
}

export function readRecommendationEvents(): RecommendationEvent[] {
  return readJson<RecommendationEvent[]>(recommendationKey, []);
}

export function readClickEvents(): ClickEvent[] {
  return readJson<ClickEvent[]>(clickKey, []);
}

export function recordDuelChoice(event: DuelChoiceEvent): void {
  const events = readJson<DuelChoiceEvent[]>(duelChoicesKey, []);
  writeJson(duelChoicesKey, [...events, event].slice(-250));
}

export async function saveDuelChoiceEvent(event: DuelChoiceEvent): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("duel_choice_events").insert({
    id: event.id,
    created_at: event.createdAt,
    recommendation_event_id: event.recommendationEventId,
    marketplace: event.marketplace,
    brief: event.brief,
    winner_product_id: event.winnerProductId,
    loser_product_id: event.loserProductId
  });
  if (error) {
    console.warn("Supabase duel choice event insert failed", error.message);
  }
}

export function recordRecommendation(inputs: FinderInputs, items: Recommendation[]): RecommendationEvent[] {
  const events = readRecommendationEvents();
  events.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    inputs,
    marketplace: inputs.marketplace,
    recommendedProducts: items.map(({ product, offer, score }, index) => ({
      productId: product.id,
      offerId: offer.id,
      merchant: offer.merchant,
      marketplace: offer.marketplace,
      score: Number(score.toFixed(3)),
      position: index + 1
    }))
  });
  const next = events.slice(-100);
  writeJson(recommendationKey, next);
  return next;
}

export async function saveRecommendationEvent(event: RecommendationEvent): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.from("recommendation_events").insert({
    id: event.id,
    created_at: event.createdAt,
    marketplace: event.marketplace,
    inputs: event.inputs,
    recommended_products: event.recommendedProducts
  });
  if (error) {
    console.warn("Supabase recommendation event insert failed", error.message);
  }
}

export function recordClick(productId: string, offerId: string, fallbackMarketplace: Marketplace, catalog: Catalog = fallbackCatalog): {
  clicks: Record<string, number>;
  events: ClickEvent[];
} {
  const offer = catalog.merchantOffers.find((item) => item.id === offerId) || null;
  const clicks = readClicks();
  clicks[productId] = (clicks[productId] || 0) + 1;
  writeJson(clicksKey, clicks);

  const events = readClickEvents();
  events.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    productId,
    offerId,
    merchant: offer ? offer.merchant : null,
    marketplace: offer ? offer.marketplace : fallbackMarketplace,
    placement: "recommendation-card"
  });
  const nextEvents = events.slice(-250);
  writeJson(clickKey, nextEvents);

  return { clicks, events: nextEvents };
}

export async function saveClickEvent(event: ClickEvent): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.from("click_events").insert({
    id: event.id,
    created_at: event.createdAt,
    product_id: event.productId,
    offer_id: event.offerId,
    merchant: event.merchant,
    marketplace: event.marketplace,
    placement: event.placement
  });
  if (error) {
    console.warn("Supabase click event insert failed", error.message);
  }
}

export function topEventProduct(events: RecommendationEvent[] | ClickEvent[], mode: "recommendations" | "clicks", catalog: Catalog = fallbackCatalog): string {
  const counts = events.reduce<Record<string, number>>((index, event) => {
    const productIds = mode === "recommendations" && "recommendedProducts" in event
      ? event.recommendedProducts.map((item) => item.productId)
      : ["productId" in event ? event.productId : ""];
    productIds.filter(Boolean).forEach((id) => {
      index[id] = (index[id] || 0) + 1;
    });
    return index;
  }, {});
  const [productId, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
  const product = catalog.products.find((item) => item.id === productId);
  return product ? `${product.name} (${count})` : "None yet";
}
