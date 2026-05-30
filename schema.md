# Giftwise MVP Data Schema

This document defines the first Supabase-ready schema for the Giftwise AI gift finder.

The current static prototype stores products and offers in `data.js`, then stores analytics events in `localStorage`. The tables below map that prototype to a database structure without changing the product logic.

## products

Stores the gift item itself. A product can have multiple purchase offers across marketplaces.

| Column | Type | Required | Current field | Notes |
| --- | --- | --- | --- | --- |
| id | text | yes | `product.id` | Stable slug-style id, such as `pour-over-kit`. |
| name | text | yes | `product.name` | Display name shown on cards. |
| brand | text | no | `product.brand` | Brand or internal display label. |
| category | text | no | `product.category` | Broad gift category. |
| status | text | yes | `product.status` | `draft`, `active`, `featured`, `suppressed`, or `archived`. |
| image_url | text | yes | `product.image` | Product image. Later this may come from Amazon API or another image source. |
| reason | text | yes | `product.reason` | Human-written recommendation reason. |
| tags | jsonb | yes | `product.tags` | Weighted matching tags, where values range from `0` to `1`. |
| signals | jsonb | yes | `product.signals` | Early performance data: clicks, saves, recommendations, freshness. |
| created_at | timestamptz | yes | n/a | Default `now()`. |
| updated_at | timestamptz | yes | n/a | Updated whenever product metadata changes. |

Suggested status values:

```text
draft
active
featured
suppressed
archived
```

## merchant_offers

Stores purchase links and marketplace-specific commerce data. One product can have Amazon US, Amazon Canada, Walmart, Etsy, or other offers.

| Column | Type | Required | Current field | Notes |
| --- | --- | --- | --- | --- |
| id | text | yes | `offer.id` | Stable offer id, such as `offer-pour-over-kit-amazon-ca`. |
| product_id | text | yes | `offer.productId` | References `products.id`. |
| merchant | text | yes | `offer.merchant` | Example: `Amazon`. |
| marketplace | text | yes | `offer.marketplace` | Example: `US`, `CA`. |
| external_product_id | text | no | `offer.externalProductId` | Amazon ASIN or other merchant product id. |
| price | numeric | no | `offer.price` | Use carefully for Amazon. Keep updated if displayed. |
| currency | text | no | `offer.currency` | Example: `USD`, `CAD`. |
| availability | text | yes | `offer.availability` | Example: `in_stock`, `out_of_stock`, `unknown`. |
| affiliate_url | text | yes | `offer.affiliateUrl` | Tracked affiliate link. |
| commission_rate | numeric | no | `offer.commissionRate` | Optional estimate for ranking. |
| last_synced_at | timestamptz | no | `offer.lastSyncedAt` | For future API sync jobs. |
| created_at | timestamptz | yes | n/a | Default `now()`. |
| updated_at | timestamptz | yes | n/a | Updated whenever offer data changes. |

Recommended indexes:

```sql
create index merchant_offers_product_id_idx on merchant_offers(product_id);
create index merchant_offers_marketplace_idx on merchant_offers(marketplace);
create index merchant_offers_availability_idx on merchant_offers(availability);
```

## recommendation_events

Stores each Gift Finder run. This is the main source for later ranking, funnel analysis, and SEO list generation.

| Column | Type | Required | Current field | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | yes | `event.id` | Generated client-side now, server-side later. |
| session_id | text | no | n/a | Anonymous browser/session id. Add before production. |
| created_at | timestamptz | yes | `event.createdAt` | Time the recommendation was generated. |
| marketplace | text | yes | `event.marketplace` | Marketplace inferred from locale/IP, such as `CA`. |
| inputs | jsonb | yes | `event.inputs` | Full user-selected finder inputs. |
| recommended_products | jsonb | yes | `event.recommendedProducts` | Ordered recommendation output with product, offer, score, position. |

Example `inputs` payload:

```json
{
  "recipient": "mom",
  "relationship": "family",
  "occasion": "birthday",
  "ageRange": "adult",
  "budget": 100,
  "marketplace": "CA",
  "timing": "flexible",
  "interests": ["coffee", "wellness"],
  "styles": ["practical"],
  "avoidances": ["too-personal"]
}
```

Example `recommended_products` payload:

```json
[
  {
    "productId": "pour-over-kit",
    "offerId": "offer-pour-over-kit-amazon-ca",
    "merchant": "Amazon",
    "marketplace": "CA",
    "score": 6.214,
    "position": 1
  }
]
```

Recommended indexes:

```sql
create index recommendation_events_created_at_idx on recommendation_events(created_at desc);
create index recommendation_events_marketplace_idx on recommendation_events(marketplace);
```

## click_events

Stores purchase-button clicks. This is the closest data the website owns before Amazon reports orders and commissions.

| Column | Type | Required | Current field | Notes |
| --- | --- | --- | --- | --- |
| id | uuid | yes | `event.id` | Generated for each click. |
| session_id | text | no | n/a | Anonymous browser/session id. Add before production. |
| created_at | timestamptz | yes | `event.createdAt` | Click time. |
| product_id | text | yes | `event.productId` | References `products.id`. |
| offer_id | text | yes | `event.offerId` | References `merchant_offers.id`. |
| merchant | text | no | `event.merchant` | Snapshot for easier analytics. |
| marketplace | text | yes | `event.marketplace` | Snapshot of clicked offer marketplace. |
| placement | text | yes | `event.placement` | Example: `recommendation-card`. |

Recommended indexes:

```sql
create index click_events_created_at_idx on click_events(created_at desc);
create index click_events_product_id_idx on click_events(product_id);
create index click_events_offer_id_idx on click_events(offer_id);
create index click_events_marketplace_idx on click_events(marketplace);
```

## Future Tables

These are not needed for the static MVP, but likely become useful soon.

| Table | Purpose |
| --- | --- |
| sessions | Store anonymous session id, inferred country, first referrer, UTM data. |
| affiliate_networks | Store merchant and affiliate account metadata. |
| product_sync_jobs | Track Amazon API or other merchant API sync status. |
| search_cache | Store API-discovered products before review. |
| user_feedback | Store likes, dislikes, saves, and "show me different gifts" signals. |
| seo_pages | Store generated list pages such as `gifts-for-mom` or `gifts-under-50`. |

## Supabase Readiness Checklist

The project is ready to start Supabase integration when these are true:

- `products` and `merchant_offers` fields are accepted as the source of truth.
- Local analytics event shapes match `recommendation_events` and `click_events`.
- A deployment target is chosen, such as Vercel or Netlify.
- The app has a strategy for anonymous `session_id`.
- Real Amazon Associates tags are available for at least one marketplace.
- Privacy policy and affiliate disclosure are present before collecting production analytics.
