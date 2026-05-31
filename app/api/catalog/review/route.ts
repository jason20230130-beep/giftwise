import { NextResponse } from "next/server";
import { createStructuredResponse } from "@/lib/openai";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

type DraftProduct = {
  id: string;
  name: string;
  category: string | null;
  source_metadata: Record<string, unknown>;
};

type ProductReview = {
  productId: string;
  status: "active" | "featured" | "suppressed";
  giftQualityScore: number;
  reason: string;
  tags: string[];
};

type ReviewPayload = {
  reviews: ProductReview[];
};

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function reviewSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["reviews"],
    properties: {
      reviews: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["productId", "status", "giftQualityScore", "reason", "tags"],
          properties: {
            productId: { type: "string" },
            status: { type: "string", enum: ["active", "featured", "suppressed"] },
            giftQualityScore: { type: "number", minimum: 0, maximum: 1 },
            reason: { type: "string" },
            tags: {
              type: "array",
              maxItems: 10,
              items: { type: "string" }
            }
          }
        }
      }
    }
  };
}

function normalizeTags(tags: string[]) {
  return Object.fromEntries(tags.map((tag) => [tag.toLowerCase().trim().replace(/\s+/g, "-"), 1]));
}

function statusFromScore(score: number): ProductReview["status"] {
  if (score >= 0.85) return "featured";
  if (score >= 0.62) return "active";
  return "suppressed";
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 20), 1), 30);
    const batches = Math.min(Math.max(Number(searchParams.get("batches") || 3), 1), 3);
    let updated = 0;
    const statuses = { active: 0, featured: 0, suppressed: 0 };

    for (let batch = 0; batch < batches; batch += 1) {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,category,source_metadata")
        .eq("source", "ebay")
        .eq("status", "draft")
        .limit(limit);
      if (error) throw new Error(`Draft fetch failed: ${error.message}`);

      const products = (data || []) as DraftProduct[];
      if (!products.length) break;
      const payload = await createStructuredResponse("gift_catalog_reviews", reviewSchema(), [
        {
          role: "system",
          content: [
            "You are the product editor for a curated gift recommendation site.",
            "Review each marketplace listing conservatively.",
            "Use featured only for genuinely appealing gifts with clear recipient value.",
            "Use active for reasonable gift options.",
            "Use suppressed for generic clutter, low-quality novelty items, decor signs, replacement parts, overly specific text products, unclear listings, or items unlikely to delight a recipient.",
            "Write a concise, useful recommendation reason.",
            "Return lowercase tags describing recipients, occasions, interests, styles, and risks."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({ task: "Review every listed draft product exactly once.", products })
        }
      ]) as ReviewPayload;

      const productById = new Map(products.map((product) => [product.id, product]));
      const reviewedIds = new Set(payload.reviews.map((review) => review.productId));
      if (payload.reviews.length !== products.length || reviewedIds.size !== products.length || payload.reviews.some((review) => !productById.has(review.productId))) {
        throw new Error("OpenAI editorial review did not cover the full draft batch.");
      }
      for (const review of payload.reviews) {
        const product = productById.get(review.productId)!;
        const reviewedAt = new Date().toISOString();
        const status = statusFromScore(review.giftQualityScore);
        const { error: updateError } = await supabase
          .from("products")
          .update({
            status,
            reason: review.reason,
            tags: normalizeTags(review.tags),
            source_metadata: {
              ...product.source_metadata,
              giftQualityScore: review.giftQualityScore,
              reviewedAt,
              reviewedBy: process.env.OPENAI_MODEL || "gpt-4o-mini"
            },
            updated_at: reviewedAt
          })
          .eq("id", review.productId)
          .eq("status", "draft");
        if (updateError) throw new Error(`Product review update failed: ${updateError.message}`);
        statuses[status] += 1;
        updated += 1;
      }
    }

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("source", "ebay")
      .eq("status", "draft");
    if (countError) throw new Error(`Draft count failed: ${countError.message}`);

    return NextResponse.json({ reviewed: updated, statuses, remainingDrafts: count || 0 });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unknown review error.";
    console.error("Gift catalog review failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
