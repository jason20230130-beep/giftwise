import { merchantOffers, products } from "./data";
import type { FinderInputs, Marketplace, MerchantOffer, Product, Recommendation } from "./types";

const offersByProductId = merchantOffers.reduce<Record<string, MerchantOffer[]>>((index, offer) => {
  if (!index[offer.productId]) index[offer.productId] = [];
  index[offer.productId].push(offer);
  return index;
}, {});

export function inferMarketplace(): Marketplace {
  if (typeof navigator === "undefined") return "US";
  const locale = navigator.language || "";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (locale.toLowerCase().endsWith("-ca") || timeZone.includes("Canada") || timeZone === "America/Edmonton") {
    return "CA";
  }
  return "US";
}

export function primaryOffer(product: Product, marketplace: Marketplace = "US"): MerchantOffer | null {
  const offers = offersByProductId[product.id] || [];
  return offers.find((offer) => offer.marketplace === marketplace && offer.availability === "in_stock")
    || offers.find((offer) => offer.availability === "in_stock")
    || null;
}

export function trendScore(product: Product, clicks: Record<string, number> = {}): number {
  const localClicks = clicks[product.id] || 0;
  const clickRate = product.signals.clicks / Math.max(product.signals.recommendations, 1);
  return clickRate * 2 + product.signals.saves / 120 + product.signals.freshness + localClicks * 0.08;
}

export function scoreProduct(product: Product, inputs: FinderInputs, clicks: Record<string, number> = {}): number {
  const offer = primaryOffer(product, inputs.marketplace);
  if (!["active", "featured"].includes(product.status)) return -Infinity;
  if (!offer || !offer.affiliateUrl) return -Infinity;
  if (offer.price > inputs.budget * 1.2) return -Infinity;

  const tagScore = [
    product.tags[inputs.recipient] || 0,
    product.tags[inputs.relationship] || 0,
    product.tags[inputs.occasion] || 0,
    inputs.ageRange === "any" ? 0.4 : product.tags[inputs.ageRange] || 0,
    product.tags[inputs.timing] || 0,
    ...inputs.interests.map((tag) => product.tags[tag] || 0),
    ...inputs.styles.map((tag) => product.tags[tag] || 0)
  ].reduce((sum, value) => sum + value, 0);

  const riskPenalty = inputs.avoidances
    .map((tag) => product.tags[tag] || 0)
    .reduce((sum, value) => sum + value, 0) * 1.25;
  const budgetFit = Math.max(0, 1 - Math.abs(offer.price - inputs.budget * 0.72) / inputs.budget);
  const qualityBoost = product.status === "featured" ? 0.45 : 0.15;
  const behaviorBoost = trendScore(product, clicks) * 0.65;
  const commerceBoost = offer.price >= 35 ? 0.18 : 0.08;
  const timingBoost = inputs.timing === "last-minute" && offer.price <= 50 ? 0.25 : 0;

  return tagScore + budgetFit + qualityBoost + behaviorBoost + commerceBoost + timingBoost - riskPenalty;
}

export function recommend(inputs: FinderInputs, clicks: Record<string, number> = {}): Recommendation[] {
  return products
    .map((product) => ({ product, offer: primaryOffer(product, inputs.marketplace), score: scoreProduct(product, inputs, clicks) }))
    .filter((item): item is Recommendation => Number.isFinite(item.score) && item.offer !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function money(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}
