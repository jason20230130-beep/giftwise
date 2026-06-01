import { NextResponse } from "next/server";
import { createStructuredResponse } from "@/lib/openai";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 300;

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

type SupabaseAdmin = ReturnType<typeof getSupabaseAdminClient>;
type ReviewSource = "amazon" | "ebay";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function reviewSchema(productCount: number) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["reviews"],
    properties: {
      reviews: {
        type: "array",
        minItems: productCount,
        maxItems: productCount,
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

async function reviewProducts(products: DraftProduct[]): Promise<ProductReview[]> {
  const payload = await createStructuredResponse("gift_catalog_reviews", reviewSchema(products.length), [
    {
      role: "system",
      content: [
        "You are the product editor for a curated gift recommendation site.",
        "Review each marketplace listing conservatively.",
        "Use featured only for genuinely appealing gifts with clear recipient value.",
        "Use active for reasonable gift options.",
        "Use suppressed for generic clutter, low-quality novelty items, decor signs, replacement parts, generic household basics such as sheets, curtains, bath mats, towels, and tablecloths, overly specific text products, unclear listings, or items unlikely to delight a recipient.",
        "Write a concise, useful recommendation reason.",
        "Return lowercase tags describing recipients, occasions, interests, styles, and risks."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({ task: "Review every listed draft product exactly once.", products })
    }
  ]) as ReviewPayload;

  const validIds = new Set(products.map((product) => product.id));
  const reviewedIds = new Set(payload.reviews.map((review) => review.productId));
  if (payload.reviews.length === products.length && reviewedIds.size === products.length && payload.reviews.every((review) => validIds.has(review.productId))) {
    return payload.reviews;
  }
  if (products.length <= 5) {
    throw new Error("OpenAI editorial review did not cover the full draft batch.");
  }

  const midpoint = Math.ceil(products.length / 2);
  const reviews = await Promise.all([
    reviewProducts(products.slice(0, midpoint)),
    reviewProducts(products.slice(midpoint))
  ]);
  return reviews.flat();
}

async function claimDraftProducts(supabase: SupabaseAdmin, source: ReviewSource, limit: number): Promise<DraftProduct[]> {
  const { data: drafts, error: draftError } = await supabase
    .from("products")
    .select("id")
    .eq("source", source)
    .eq("status", "draft")
    .limit(limit);
  if (draftError) throw new Error(`Draft fetch failed: ${draftError.message}`);
  const draftIds = (drafts || []).map((product) => product.id);
  if (!draftIds.length) return [];

  const { data: claimed, error: claimError } = await supabase
    .from("products")
    .update({ status: "reviewing", updated_at: new Date().toISOString() })
    .in("id", draftIds)
    .eq("status", "draft")
    .select("id,name,category,source_metadata");
  if (claimError) throw new Error(`Draft claim failed: ${claimError.message}`);
  return (claimed || []) as DraftProduct[];
}

async function releaseProducts(supabase: SupabaseAdmin, productIds: string[]) {
  if (!productIds.length) return;
  const { error } = await supabase
    .from("products")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .in("id", productIds)
    .eq("status", "reviewing");
  if (error) console.error("Draft release failed", error.message);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const source: ReviewSource = searchParams.get("source") === "amazon" ? "amazon" : "ebay";
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 20), 1), 20);
    const batches = Math.min(Math.max(Number(searchParams.get("batches") || 5), 1), 5);
    let updated = 0;
    const statuses = { active: 0, featured: 0, suppressed: 0 };
    const staleClaimCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { error: staleClaimError } = await supabase
      .from("products")
      .update({ status: "draft" })
      .eq("source", source)
      .eq("status", "reviewing")
      .lt("updated_at", staleClaimCutoff);
    if (staleClaimError) throw new Error(`Stale draft release failed: ${staleClaimError.message}`);

    for (let batch = 0; batch < batches; batch += 1) {
      const products = await claimDraftProducts(supabase, source, limit);
      if (!products.length) break;
      const productIds = products.map((product) => product.id);
      const reviews = await reviewProducts(products).catch(async (error) => {
        await releaseProducts(supabase, productIds);
        throw error;
      });
      const productById = new Map(products.map((product) => [product.id, product]));
      try {
        for (const review of reviews) {
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
            .eq("status", "reviewing");
          if (updateError) throw new Error(`Product review update failed: ${updateError.message}`);
          statuses[status] += 1;
          updated += 1;
        }
      } catch (error) {
        await releaseProducts(supabase, productIds);
        throw error;
      }
    }

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("source", source)
      .eq("status", "draft");
    if (countError) throw new Error(`Draft count failed: ${countError.message}`);

    return NextResponse.json({ source, reviewed: updated, statuses, remainingDrafts: count || 0 });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unknown review error.";
    console.error("Gift catalog review failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
