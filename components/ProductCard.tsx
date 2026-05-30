import { money } from "@/lib/recommendations";
import type { Recommendation } from "@/lib/types";

type ProductCardProps = {
  item: Recommendation;
  index: number;
  onClickOffer: (productId: string, offerId: string) => void;
};

export function ProductCard({ item, index, onClickOffer }: ProductCardProps) {
  const { product, offer, score } = item;
  const tags = Object.entries(product.tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag.replace("-", " "));

  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} loading={index > 1 ? "lazy" : "eager"} />
      <div className="product-body">
        <div className="product-meta">
          <span className="price">{money(offer.price, offer.currency)}</span>
          <span className="score-pill">{Math.round(score * 10)} match</span>
        </div>
        <h3>{product.name}</h3>
        <p className="reason">{product.reason}</p>
        <div className="product-tags">
          {tags.map((tag) => (
            <span className="tag-pill" key={tag}>{tag}</span>
          ))}
        </div>
        <a
          className="buy-button"
          href={offer.affiliateUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          onClick={() => onClickOffer(product.id, offer.id)}
        >
          Check Price on {offer.merchant}
        </a>
      </div>
    </article>
  );
}
