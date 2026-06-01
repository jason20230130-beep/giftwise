import { NextResponse } from "next/server";
import { defaultAmazonQueries, discoverAmazonItems, isRainforestConfigured } from "@/lib/rainforest";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isRainforestConfigured()) {
    return NextResponse.json({
      configured: false,
      message: "Add RAINFOREST_API_KEY to enable Amazon candidate sync."
    });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const queryStart = Math.min(Math.max(Number(searchParams.get("queryStart") || 0), 0), defaultAmazonQueries.length);
    const queryCount = Math.min(Math.max(Number(searchParams.get("queryCount") || 1), 1), 5);
    const page = Math.min(Math.max(Number(searchParams.get("page") || 1), 1), 10);
    const resultLimit = Math.min(Math.max(Number(searchParams.get("resultLimit") || 10), 1), 20);
    const queries = defaultAmazonQueries.slice(queryStart, queryStart + queryCount);
    let discovered = 0;
    let newProducts = 0;

    for (const query of queries) {
      const items = await discoverAmazonItems(query, page, resultLimit);
      discovered += items.length;
      if (!items.length) continue;
      const productIds = items.map((item) => item.product.id);
      const { data: existingProducts, error: existingError } = await supabase
        .from("products")
        .select("id")
        .in("id", productIds);
      if (existingError) throw new Error(`Existing product check failed: ${existingError.message}`);
      const existingIds = new Set((existingProducts || []).map((product) => product.id));
      const newItems = items.filter((item) => !existingIds.has(item.product.id));
      if (!newItems.length) continue;
      const { error: productError } = await supabase.from("products").insert(newItems.map((item) => item.product));
      if (productError) throw new Error(`Amazon product staging failed: ${productError.message}`);
      const { error: offerError } = await supabase.from("merchant_offers").insert(newItems.map((item) => item.offer));
      if (offerError) throw new Error(`Amazon offer staging failed: ${offerError.message}`);
      newProducts += newItems.length;
    }

    return NextResponse.json({
      configured: true,
      queryStart,
      queryCount: queries.length,
      page,
      resultLimit,
      discovered,
      staged: newProducts
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unknown sync error.";
    console.error("Amazon candidate sync failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
