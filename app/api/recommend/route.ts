import { NextResponse } from "next/server";
import { fetchCatalogForMarketplace } from "@/lib/catalog";
import { isMarketplace, marketplaceFromRequest } from "@/lib/marketplace";
import { primaryOffer } from "@/lib/recommendations";
import { createStructuredResponse } from "@/lib/openai";
import type { FinderInputs, GiftMode, Marketplace, Recommendation } from "@/lib/types";

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
    .slice(0, 80);

  if (!candidates.length) {
    return NextResponse.json({ marketplace: inputs.marketplace, recommendations: [] });
  }

  const candidatePayload = candidates.map(({ product, offer }) => ({
    productId: product.id,
    offerId: offer!.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: offer!.price,
    currency: offer!.currency,
    marketplace: offer!.marketplace,
    tags: product.tags,
    baselineReason: product.reason
  }));

  try {
    const parsed = await createStructuredResponse("gift_recommendations", recommendationSchema(resultCount), [
        {
          role: "system",
          content: [
            "You are Giftwise, a sharp and warm gift advisor.",
            "Select only from the provided candidate products. Never invent products, offer IDs, prices, links, or merchants.",
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
            task: `Choose exactly ${resultCount} gifts from the candidate catalog.`,
            userInputs: inputs,
            candidates: candidatePayload
          })
        }
      ]) as AiPayload;
    const candidateByKey = new Map(candidates.map(({ product, offer }) => [`${product.id}:${offer!.id}`, { product, offer: offer! }]));
    const recommendations: Recommendation[] = [];
    parsed.recommendations.forEach((item) => {
      const candidate = candidateByKey.get(`${item.productId}:${item.offerId}`);
      if (!candidate) return;
      recommendations.push({
        product: candidate.product,
        offer: candidate.offer,
        score: item.score,
        personalizedReason: item.reason,
        caution: item.caution
      });
    });
    return NextResponse.json({ marketplace: inputs.marketplace, profileSummary: parsed.profileSummary, recommendations });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unknown recommendation error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
