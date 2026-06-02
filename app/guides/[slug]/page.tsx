import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchCatalogForMarketplace } from "@/lib/catalog";
import { giftGuides, guideBySlug, type GiftGuide } from "@/lib/guides";
import { money, primaryOffer } from "@/lib/recommendations";
import type { Catalog, MerchantOffer, Product } from "@/lib/types";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

type GuideProduct = {
  product: Product;
  offer: MerchantOffer;
  score: number;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return giftGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);
  if (!guide) return {};

  return {
    title: `${guide.title} | Giftwise`,
    description: guide.description,
    alternates: {
      canonical: `/guides/${guide.slug}`
    }
  };
}

function searchableText(product: Product) {
  return [
    product.name,
    product.brand,
    product.category,
    product.reason,
    ...Object.keys(product.tags || {})
  ].join(" ").toLowerCase();
}

function termScore(product: Product, guide: GiftGuide) {
  const text = searchableText(product);
  return guide.terms.reduce((score, term) => score + (text.includes(term.toLowerCase()) ? 1 : 0), 0);
}

function pickGuideProducts(guide: GiftGuide, catalog: Catalog): GuideProduct[] {
  const scored = catalog.products
    .map((product) => ({ product, offer: primaryOffer(product, "US", catalog), score: termScore(product, guide) }))
    .filter((item): item is GuideProduct => Boolean(item.offer))
    .filter((item) => !guide.budgetMax || item.offer.price <= guide.budgetMax || item.offer.price === 0)
    .sort((a, b) => (
      b.score - a.score
      || Number(b.product.status === "featured") - Number(a.product.status === "featured")
      || Number(b.offer.source === "amazon") - Number(a.offer.source === "amazon")
      || a.offer.price - b.offer.price
    ));

  const matched = scored.filter((item) => item.score > 0);
  return (matched.length >= 8 ? matched : scored).slice(0, 12);
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);
  if (!guide) notFound();

  const catalog = await fetchCatalogForMarketplace("US");
  const products = pickGuideProducts(guide, catalog);

  return (
    <>
      <SiteHeader />
      <main className="guide-page">
        <section className="guide-hero">
          <p className="eyebrow">{guide.eyebrow}</p>
          <h1>{guide.title}</h1>
          <p>{guide.intro}</p>
          <div className="guide-actions">
            <Link className="primary-button" href="/#finder">Try the AI gift finder</Link>
            <Link className="secondary-button" href="/guides">Browse all guides</Link>
          </div>
        </section>

        <section className="guide-products" aria-label={guide.title}>
          {products.map(({ product, offer, score }, index) => (
            <article className="guide-product-card" key={product.id}>
              <a className="guide-product-image" href={offer.affiliateUrl} target="_blank" rel="nofollow sponsored noopener">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <img src={product.image} alt={product.name} loading={index > 2 ? "lazy" : "eager"} />
              </a>
              <div className="guide-product-body">
                <p className="guide-product-meta">
                  <span>{product.category || "Gift pick"}</span>
                  <span>{score > 0 ? "Matched" : "Flexible pick"}</span>
                </p>
                <h2>{product.name}</h2>
                {product.brand && <p className="product-brand">{product.brand}</p>}
                <p className="reason">{product.reason}</p>
                <a className="buy-button" href={offer.affiliateUrl} target="_blank" rel="nofollow sponsored noopener">
                  <span>View on {offer.merchant}</span>
                  <strong>{offer.source === "amazon" ? "View details" : money(offer.price, offer.currency)} &rarr;</strong>
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="guide-faq" aria-label="Gift guide questions">
          <div>
            <p className="eyebrow">Quick answers</p>
            <h2>How to choose from this list</h2>
          </div>
          <div className="faq-list">
            {guide.faqs.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer">
        <p>Giftwise may earn a commission from qualifying purchases. Prices and availability can change, so use retailer pages for current details.</p>
      </footer>
    </>
  );
}
