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

export const products: Product[] = [
  {
    id: "ember-mug",
    name: "Temperature Control Smart Mug",
    brand: "Ember-style pick",
    category: "Kitchen",
    status: "featured",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    reason: "A polished daily-use gift for someone who nurses coffee or tea through a busy morning.",
    tags: {
      mom: 0.8, dad: 0.7, girlfriend: 0.7, boyfriend: 0.7, coworker: 0.5,
      family: 0.8, partner: 0.7, "close-friend": 0.7, casual: 0.5, professional: 0.4,
      adult: 0.9, senior: 0.6, flexible: 0.8, soon: 0.6,
      birthday: 0.8, christmas: 0.9, "thank-you": 0.6,
      coffee: 1, tech: 0.7, practical: 0.8, premium: 0.7, "expensive-feel": 0.5
    },
    signals: { clicks: 168, saves: 42, recommendations: 620, freshness: 0.84 }
  },
  {
    id: "weighted-blanket",
    name: "Cotton Weighted Blanket",
    brand: "Calm Home",
    category: "Wellness",
    status: "active",
    image: "https://images.unsplash.com/photo-1616627562048-896782f7a1a2?auto=format&fit=crop&w=900&q=80",
    reason: "A comforting choice when you want the gift to feel thoughtful without being overly personal.",
    tags: {
      mom: 0.9, dad: 0.4, girlfriend: 0.8, boyfriend: 0.5, friend: 0.6,
      family: 0.7, partner: 0.8, "close-friend": 0.7, casual: 0.3,
      adult: 0.8, senior: 0.7, flexible: 0.8,
      birthday: 0.7, christmas: 0.8, anniversary: 0.5,
      wellness: 1, home: 0.8, cozy: 1, practical: 0.6, "too-personal": 0.45
    },
    signals: { clicks: 122, saves: 51, recommendations: 510, freshness: 0.76 }
  },
  {
    id: "pour-over-kit",
    name: "Pour-Over Coffee Starter Kit",
    brand: "Brew Desk",
    category: "Coffee",
    status: "featured",
    image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=900&q=80",
    reason: "Specific enough to feel chosen, but safe for many relationships and budgets.",
    tags: {
      dad: 0.8, mom: 0.7, boyfriend: 0.7, girlfriend: 0.6, coworker: 0.7, friend: 0.8,
      family: 0.8, partner: 0.6, "close-friend": 0.8, casual: 0.7, professional: 0.7,
      adult: 0.9, senior: 0.6, flexible: 0.9, soon: 0.8, "last-minute": 0.6,
      birthday: 0.7, christmas: 0.8, housewarming: 0.8, "thank-you": 0.7,
      coffee: 1, home: 0.5, practical: 0.8
    },
    signals: { clicks: 210, saves: 36, recommendations: 690, freshness: 0.9 }
  },
  {
    id: "digital-frame",
    name: "Wi-Fi Digital Photo Frame",
    brand: "FamilyLoop",
    category: "Tech",
    status: "featured",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    reason: "Great for parents or family members because it turns shared memories into a living gift.",
    tags: {
      mom: 1, dad: 0.9, girlfriend: 0.4, boyfriend: 0.4,
      family: 1, partner: 0.4, "close-friend": 0.4,
      adult: 0.7, senior: 0.9, flexible: 0.8,
      birthday: 0.8, christmas: 0.9, anniversary: 0.6,
      tech: 0.7, home: 0.8, personalized: 0.8, premium: 0.5, "too-personal": 0.4
    },
    signals: { clicks: 188, saves: 65, recommendations: 560, freshness: 0.82 }
  },
  {
    id: "chef-knife",
    name: "Japanese-Style Chef Knife",
    brand: "Mise Craft",
    category: "Cooking",
    status: "active",
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=900&q=80",
    reason: "A strong pick for someone who already enjoys cooking and appreciates durable tools.",
    tags: {
      mom: 0.6, dad: 0.8, boyfriend: 0.7, girlfriend: 0.5, friend: 0.5,
      family: 0.7, partner: 0.6, "close-friend": 0.5, casual: 0.2,
      adult: 0.9, flexible: 0.8,
      birthday: 0.7, christmas: 0.7, housewarming: 0.8,
      cooking: 1, practical: 0.9, premium: 0.6
    },
    signals: { clicks: 86, saves: 24, recommendations: 300, freshness: 0.63 }
  },
  {
    id: "book-light",
    name: "Rechargeable Reading Light",
    brand: "PageGlow",
    category: "Reading",
    status: "active",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    reason: "A low-risk gift that works well for coworkers, readers, and small thank-you moments.",
    tags: {
      mom: 0.7, dad: 0.6, girlfriend: 0.6, boyfriend: 0.5, coworker: 0.8, friend: 0.7, teacher: 0.9, teen: 0.7,
      family: 0.6, partner: 0.4, "close-friend": 0.7, casual: 0.8, professional: 0.9,
      adult: 0.8, senior: 0.8, flexible: 0.9, soon: 0.9, "last-minute": 0.8,
      birthday: 0.6, christmas: 0.7, "thank-you": 0.8,
      reading: 1, practical: 0.8
    },
    signals: { clicks: 74, saves: 18, recommendations: 430, freshness: 0.71 }
  },
  {
    id: "desk-plant-kit",
    name: "Indoor Herb Growing Kit",
    brand: "Green Counter",
    category: "Home",
    status: "featured",
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80",
    reason: "Cheerful, useful, and easy to place in a kitchen, office, or new home.",
    tags: {
      mom: 0.8, dad: 0.6, girlfriend: 0.7, boyfriend: 0.4, coworker: 0.8, friend: 0.7, teacher: 0.7,
      family: 0.7, partner: 0.5, "close-friend": 0.7, casual: 0.8, professional: 0.8,
      adult: 0.8, senior: 0.6, flexible: 0.8, soon: 0.7,
      birthday: 0.7, housewarming: 1, christmas: 0.5, "thank-you": 0.8,
      home: 1, cooking: 0.5, practical: 0.6, fun: 0.5, decor: 0.35
    },
    signals: { clicks: 134, saves: 33, recommendations: 490, freshness: 0.8 }
  },
  {
    id: "travel-tumbler",
    name: "Insulated Travel Tumbler",
    brand: "DayCarry",
    category: "Everyday",
    status: "active",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
    reason: "A dependable everyday upgrade that stays appropriate even when the relationship is professional.",
    tags: {
      mom: 0.7, dad: 0.7, girlfriend: 0.6, boyfriend: 0.6, coworker: 0.9, friend: 0.8, teacher: 0.8, teen: 0.6,
      family: 0.7, partner: 0.5, "close-friend": 0.8, casual: 0.9, professional: 0.9,
      adult: 0.9, senior: 0.6, flexible: 1, soon: 0.9, "last-minute": 0.8,
      birthday: 0.6, christmas: 0.7, "thank-you": 0.8,
      coffee: 0.7, outdoors: 0.5, practical: 1, style: 0.4
    },
    signals: { clicks: 156, saves: 21, recommendations: 710, freshness: 0.78 }
  },
  {
    id: "silk-pillowcase",
    name: "Silk Pillowcase Set",
    brand: "Luma Rest",
    category: "Wellness",
    status: "active",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80",
    reason: "Feels indulgent while staying useful, especially for someone who likes beauty or sleep upgrades.",
    tags: {
      mom: 0.7, girlfriend: 0.9, friend: 0.6,
      family: 0.6, partner: 0.9, "close-friend": 0.7, casual: 0.2,
      adult: 0.9, flexible: 0.8,
      birthday: 0.8, anniversary: 0.7, christmas: 0.7,
      wellness: 0.8, style: 0.8, cozy: 0.7, premium: 0.5, "too-personal": 0.55, "size-risk": 0.2
    },
    signals: { clicks: 97, saves: 39, recommendations: 340, freshness: 0.72 }
  }
];

export const merchantOffers: MerchantOffer[] = [
  { id: "offer-ember-mug-amazon", productId: "ember-mug", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 99, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-ember-mug-amazon-ca", productId: "ember-mug", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 135, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-weighted-blanket-amazon", productId: "weighted-blanket", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 58, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-weighted-blanket-amazon-ca", productId: "weighted-blanket", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 78, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-pour-over-kit-amazon", productId: "pour-over-kit", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 42, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-pour-over-kit-amazon-ca", productId: "pour-over-kit", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 56, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-digital-frame-amazon", productId: "digital-frame", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 79, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-digital-frame-amazon-ca", productId: "digital-frame", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 109, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-chef-knife-amazon", productId: "chef-knife", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 68, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-chef-knife-amazon-ca", productId: "chef-knife", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 89, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-book-light-amazon", productId: "book-light", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 18, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-book-light-amazon-ca", productId: "book-light", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 24, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-desk-plant-kit-amazon", productId: "desk-plant-kit", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 34, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-desk-plant-kit-amazon-ca", productId: "desk-plant-kit", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 45, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-travel-tumbler-amazon", productId: "travel-tumbler", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 28, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-travel-tumbler-amazon-ca", productId: "travel-tumbler", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 38, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-silk-pillowcase-amazon", productId: "silk-pillowcase", merchant: "Amazon", marketplace: "US", externalProductId: "", price: 45, currency: "USD", availability: "in_stock", affiliateUrl: "https://www.amazon.com/?tag=yourtag-20", commissionRate: null, lastSyncedAt: null },
  { id: "offer-silk-pillowcase-amazon-ca", productId: "silk-pillowcase", merchant: "Amazon", marketplace: "CA", externalProductId: "", price: 59, currency: "CAD", availability: "in_stock", affiliateUrl: "https://www.amazon.ca/?tag=yourtagca-20", commissionRate: null, lastSyncedAt: null }
];
