import { NextResponse } from "next/server";
import { fetchCatalogForMarketplace } from "@/lib/catalog";
import { isMarketplace, marketplaceFromRequest } from "@/lib/marketplace";
import { primaryOffer } from "@/lib/recommendations";
import { createStructuredResponse } from "@/lib/openai";
import type { FinderInputs, Marketplace, Recommendation } from "@/lib/types";

export const runtime = "nodejs";

type AiRecommendation = {
  productId: string;
  offerId: string;
  score: number;
  reason: string;
  caution: string;
};

type AiPayload = {
  recommendations: AiRecommendation[];
};

function normalizeInputs(value: Partial<FinderInputs>): FinderInputs {
  return {
    recipient: String(value.recipient || "mom"),
    relationship: String(value.relationship || "family"),
    occasion: String(value.occasion || "birthday"),
    ageRange: String(value.ageRange || "adult"),
    budget: Number(value.budget || 50),
    marketplace: isMarketplace(value.marketplace) ? value.marketplace : "US",
    timing: String(value.timing || "flexible"),
    interests: Array.isArray(value.interests) ? value.interests.map(String) : [],
    styles: Array.isArray(value.styles) ? value.styles.map(String) : [],
    avoidances: Array.isArray(value.avoidances) ? value.avoidances.map(String) : []
  };
}

function recommendationSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["recommendations"],
    properties: {
      recommendations: {
        type: "array",
        maxItems: 5,
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

  const candidates = catalog.products
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
    const parsed = await createStructuredResponse("gift_recommendations", recommendationSchema(), [
        {
          role: "system",
          content: [
            "You are Giftwise, a careful gift advisor.",
            "Select only from the provided candidate products. Never invent products, offer IDs, prices, links, or merchants.",
            "Treat budget, recipient, relationship, occasion, timing, interests, style, and avoidances as recommendation factors, not hard filters.",
            "Avoid overly personal gifts for professional or casual relationships unless the user's inputs clearly support them.",
            "Return concise reasons that feel personal and useful, not salesy."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Choose up to 5 best gifts from the candidate catalog.",
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
    return NextResponse.json({ marketplace: inputs.marketplace, recommendations });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unknown recommendation error.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
