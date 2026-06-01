import type { MerchantOffer, Option, Product } from "./types";

export const interests: Option[] = [
  { value: "coffee", label: "Coffee" },
  { value: "cooking", label: "Cooking" },
  { value: "wellness", label: "Wellness" },
  { value: "tech", label: "Tech" },
  { value: "reading", label: "Reading" },
  { value: "home", label: "Home" },
  { value: "outdoors", label: "Outdoors" },
  { value: "style", label: "Style" }
];

export const styles: Option[] = [
  { value: "practical", label: "Practical" },
  { value: "personalized", label: "Personalized" },
  { value: "premium", label: "Premium" },
  { value: "cozy", label: "Cozy" },
  { value: "fun", label: "Fun" }
];

export const avoidances: Option[] = [
  { value: "too-personal", label: "Too personal" },
  { value: "size-risk", label: "Sizing risk" },
  { value: "fragile", label: "Fragile" },
  { value: "decor", label: "Decor" },
  { value: "expensive-feel", label: "Too expensive" }
];

export const products: Product[] = [];

export const merchantOffers: MerchantOffer[] = [];
