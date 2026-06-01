import { NextResponse } from "next/server";
import { fetchCatalogForMarketplace } from "@/lib/catalog";
import { isMarketplace, marketplaceFromRequest } from "@/lib/marketplace";
import { primaryOffer } from "@/lib/recommendations";
import { createStructuredResponse } from "@/lib/openai";
import type { FinderInputs, GiftMode, Marketplace, MerchantOffer, Product, Recommendation } from "@/lib/types";

export const runtime = "nodejs";

type AiRecommendation = {
  productId: string;
  offerId: string;
  score: number;
  reason: string;
  caution: string;
};

type AiPayload = {
  profileSummary: string;
  recommendations: AiRecommendation[];
};

const recallStopwords = new Set([
  "and", "birthday", "boy", "buy", "easy", "for", "gift", "holiday", "likes", "need",
  "not", "something", "thank", "that", "the", "too", "who", "with"
]);

function normalizeInputs(value: Partial<FinderInputs>): FinderInputs {
  const mode: GiftMode = value.mode === "badly" || value.mode === "panic" || value.mode === "duel" ? value.mode : "dna";
  return {
    brief: String(value.brief || "").trim(),
    mode,
    marketplace: isMarketplace(value.marketplace) ? value.marketplace : "US",
    answers: value.answers || {},
    excludedProductIds: Array.isArray(value.excludedProductIds) ? value.excludedProductIds.map(String).slice(0, 12) : []
  };
}

function recommendationSchema(resultCount: number) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["profileSummary", "recommendations"],
    properties: {
      profileSummary: { type: "string" },
      recommendations: {
        type: "array",
        minItems: resultCount,
        maxItems: resultCount,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["productId", "offerId", "score", "reason", "caution"],
          properties: {
            productId: { type: "string" },
            offerId: { type: "string" },
            score: { type: "number", minimum: 0, maximum: 1 },
            reason: { type: "string" },
            caution: { type: "string" }
          }
        }
      }
    }
  };
}

function candidateRecallScore(product: Product, offer: MerchantOffer, inputs: FinderInputs) {
  const query = [
    inputs.brief,
    ...Object.values(inputs.answers || {}).map(String)
  ].join(" ").toLowerCase();
  const tokens = [...new Set(query.split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !recallStopwords.has(token)))];
  const searchableText = [
    product.name,
    product.brand,
    product.category,
    ...Object.keys(product.tags || {})
  ].join(" ").toLowerCase();
  const budget = inputs.answers?.budget;
  let score = product.status === "featured" ? 0.25 : 0;
  tokens.forEach((token) => {
    if (searchableText.includes(token)) score += 1;
  });
  if (budget && offer.price > 0 && offer.price <= budget) score += 0.5;
  if (budget && offer.price > budget * 1.5) score -= 0.5;
  return score;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const inputs = normalizeInputs(body.inputs || {});
  inputs.marketplace = marketplaceFromRequest(request, inputs.marketplace);
  const catalog = await fetchCatalogForMarketplace(inputs.marketplace);
  const resultCount = inputs.mode === "dna" ? 5 : inputs.mode === "duel" ? 2 : 3;
  const excludedIds = new Set(inputs.excludedProductIds || []);

  const candidates = catalog.products
    .filter((product) => !excludedIds.has(product.id))
    .map((product) => ({ product, offer: primaryOffer(product, inputs.marketplace, catalog) }))
    .filter((item) => item.offer)
    .sort((a, b) => candidateRecallScore(b.product, b.offer!, inputs) - candidateRecallScore(a.product, a.offer!, inputs))
    .slice(0, 80);

  if (!candidates.length) {
    return NextResponse.json({ marketplace: inputs.marketplace, recommendations: [] });
  }
  const recommendationCount = Math.min(resultCount, candidates.length);

  const candidatePayload = candidates.map(({ product, offer }) => ({
    productId: product.id,
    offerId: offer!.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    marketplace: offer!.marketplace,
    tags: product.tags,
    ...(offer!.price > 0 ? { price: offer!.price, currency: offer!.currency } : {})
  }));

  try {
    const parsed = await createStructuredResponse("gift_recommendations", recommendationSchema(recommendationCount), [
        {
          role: "system",
          content: [
            "You are Giftwise, a sharp and warm gift advisor.",
            "Select only from the provided candidate products. Never invent products, offer IDs, prices, links, or merchants.",
            "Before selecting each product, verify that its exact listing name and category clearly fit the recipient. Reject loosely related, confusing, or inappropriate listings.",
            "Describe only qualities supported by the selected listing name, category, tags, or baseline reason. Do not write a reason for a different product or invent product features.",
            "Prefer products within the user's budget. Recommend an over-budget product only when it is unusually strong and acknowledge the tradeoff in caution.",
            "Apply common-sense safety judgment. Do not recommend weapons or hazardous products for minors.",
            "Infer useful details from the user's natural-language brief. If it is sparse, choose broadly appealing gifts rather than asking questions.",
            inputs.mode === "badly"
              ? "Translate the user's rough description into a witty but kind one-sentence profile summary, then choose three fitting gifts."
              : inputs.mode === "panic"
                ? "Choose three low-risk, easy-to-buy gifts quickly. Favor broad appeal and avoid fragile, overly personal, or sizing-dependent ideas."
              : inputs.mode === "duel"
                ? "Choose exactly two strong products with clearly different personalities so the user faces an interesting choice."
                : "Use the answers and optional brief to choose a thoughtful five-gift shortlist. Write a concise profile summary.",
            "Return concise reasons that feel personal and useful, not salesy."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            task: `Choose exactly ${recommendationCount} gifts from the candidate catalog.`,
            userInputs: inputs,
            candidates: candidatePayload
          })
        }
      ]) as AiPayload;
    const candidateByKey = new Map(candidates.map(({ product, offer }) => [`${product.id}:${offer!.id}`, { product, offer: offer! }]));
    const recommendations: Recommendation[] = [];
    const usedProductIds = new Set<string>();
    parsed.recommendations.forEach((item) => {
      const candidate = candidateByKey.get(`${item.productId}:${item.offerId}`);
      if (!candidate || usedProductIds.has(candidate.product.id)) return;
      usedProductIds.add(candidate.product.id);
      recommendations.push({
        product: candidate.product,
        offer: candidate.offer,
        score: item.score,
        personalizedReason: item.reason,
        caution: item.caution
      });
    });
    candidates.forEach(({ product, offer }) => {
      if (!offer || recommendations.length >= recommendationCount || usedProductIds.has(product.id)) return;
      usedProductIds.add(product.id);
      recommendations.push({
        product,
        offer,
        score: 0.5,
        personalizedReason: `${product.name} is a ${product.category || "gift"} option that matches the available catalog.`,
        caution: "Review the listing details before purchasing."
      });
    });
    return NextResponse.json({ marketplace: inputs.marketplace, profileSummary: parsed.profileSummary, recommendations });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unknown recommendation error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
