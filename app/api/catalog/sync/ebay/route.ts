import { NextResponse } from "next/server";
import { defaultEbayQueries, discoverEbayItems, getEbayAccessToken, isEbayConfigured } from "@/lib/ebay";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Marketplace } from "@/lib/types";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isEbayConfigured()) {
    return NextResponse.json({
      configured: false,
      message: "Add eBay credentials to enable catalog sync."
    });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const accessToken = await getEbayAccessToken();
    const marketplaces: Marketplace[] = ["US", "CA"];
    let discovered = 0;
    let newProducts = 0;
    let updatedOffers = 0;

    for (const marketplace of marketplaces) {
      for (const query of defaultEbayQueries) {
        const items = await discoverEbayItems(query, marketplace, 40, accessToken);
        discovered += items.length;
        if (!items.length) continue;
        const productIds = items.map((item) => item.product.id);
        const { data: existingProducts, error: existingError } = await supabase
          .from("products")
          .select("id")
          .in("id", productIds);
        if (existingError) throw new Error(`Existing product check failed: ${existingError.message}`);
        const existingIds = new Set((existingProducts || []).map((product) => product.id));
        newProducts += productIds.filter((id) => !existingIds.has(id)).length;
        const { error: productError } = await supabase
          .from("products")
          .upsert(items.map((item) => item.product), { ignoreDuplicates: true });
        if (productError) throw new Error(`Product staging failed: ${productError.message}`);
        const { error: offerError } = await supabase.from("merchant_offers").upsert(items.map((item) => item.offer));
        if (offerError) throw new Error(`Offer staging failed: ${offerError.message}`);
        updatedOffers += items.length;
      }
    }

    return NextResponse.json({ configured: true, discovered, newProducts, updatedOffers });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unknown sync error.";
    console.error("eBay catalog sync failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
