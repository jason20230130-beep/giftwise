const fs = require("node:fs");
const path = require("node:path");

global.window = {};
require("../data.js");

const { products, merchantOffers } = global.window.GiftwiseData;

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

const productRows = products.map((product) => `(
  ${sqlString(product.id)},
  ${sqlString(product.name)},
  ${sqlString(product.brand)},
  ${sqlString(product.category)},
  ${sqlString(product.status)},
  ${sqlString(product.image)},
  ${sqlString(product.reason)},
  ${sqlJson(product.tags)},
  ${sqlJson(product.signals)}
)`);

const offerRows = merchantOffers.map((offer) => `(
  ${sqlString(offer.id)},
  ${sqlString(offer.productId)},
  ${sqlString(offer.merchant)},
  ${sqlString(offer.marketplace)},
  ${sqlString(offer.externalProductId)},
  ${offer.price ?? "null"},
  ${sqlString(offer.currency)},
  ${sqlString(offer.availability)},
  ${sqlString(offer.affiliateUrl)},
  ${offer.commissionRate ?? "null"},
  ${offer.lastSyncedAt ? sqlString(offer.lastSyncedAt) : "null"}
)`);

const sql = `insert into public.products (
  id,
  name,
  brand,
  category,
  status,
  image_url,
  reason,
  tags,
  signals
) values
${productRows.join(",\n")}
on conflict (id) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  status = excluded.status,
  image_url = excluded.image_url,
  reason = excluded.reason,
  tags = excluded.tags,
  signals = excluded.signals,
  updated_at = now();

insert into public.merchant_offers (
  id,
  product_id,
  merchant,
  marketplace,
  external_product_id,
  price,
  currency,
  availability,
  affiliate_url,
  commission_rate,
  last_synced_at
) values
${offerRows.join(",\n")}
on conflict (id) do update set
  product_id = excluded.product_id,
  merchant = excluded.merchant,
  marketplace = excluded.marketplace,
  external_product_id = excluded.external_product_id,
  price = excluded.price,
  currency = excluded.currency,
  availability = excluded.availability,
  affiliate_url = excluded.affiliate_url,
  commission_rate = excluded.commission_rate,
  last_synced_at = excluded.last_synced_at,
  updated_at = now();
`;

const outputPath = path.join(__dirname, "../supabase/seed_catalog.sql");
fs.writeFileSync(outputPath, sql);
console.log(`Wrote ${outputPath}`);
