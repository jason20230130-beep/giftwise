import type { Marketplace } from "./types";

const supportedMarketplaces: Marketplace[] = ["US", "CA"];

export function isMarketplace(value: unknown): value is Marketplace {
  return supportedMarketplaces.includes(value as Marketplace);
}

export function marketplaceFromRequest(request: Request, fallback: Marketplace = "US"): Marketplace {
  const country = request.headers.get("x-vercel-ip-country")
    || request.headers.get("cf-ipcountry")
    || "";
  return isMarketplace(country.toUpperCase()) ? country.toUpperCase() as Marketplace : fallback;
}
