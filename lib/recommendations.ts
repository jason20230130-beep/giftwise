import { fallbackCatalog } from "./catalog";
import type { Catalog, Marketplace, MerchantOffer, Product } from "./types";

function offersByProductId(catalog: Catalog) {
  return catalog.merchantOffers.reduce<Record<string, MerchantOffer[]>>((index, offer) => {
  if (!index[offer.productId]) index[offer.productId] = [];
  index[offer.productId].push(offer);
  return index;
  }, {});
}

export function inferMarketplace(): Marketplace {
  if (typeof navigator === "undefined") return "US";
  const locale = navigator.language || "";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (locale.toLowerCase().endsWith("-ca") || timeZone.includes("Canada") || timeZone === "America/Edmonton") {
    return "CA";
  }
  return "US";
}

export function primaryOffer(product: Product, marketplace: Marketplace = "US", catalog: Catalog = fallbackCatalog): MerchantOffer | null {
  const offers = offersByProductId(catalog)[product.id] || [];
  return offers.find((offer) => offer.marketplace === marketplace && offer.availability === "in_stock")
    || null;
}

export function money(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}
