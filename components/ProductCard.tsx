import { money } from "@/lib/recommendations";
import type { Recommendation } from "@/lib/types";

type ProductCardProps = {
  item: Recommendation;
  index: number;
  isWinner?: boolean;
  isLoser?: boolean;
  onChoose?: () => void;
  onClickOffer: (productId: string, offerId: string) => void;
};

export function ProductCard({ item, index, isWinner = false, isLoser = false, onChoose, onClickOffer }: ProductCardProps) {
  const { product, offer, score } = item;
  const tags = Object.entries(product.tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag.replace("-", " "));

  return (
    <article className={`product-card ${isWinner ? "is-winner" : ""} ${isLoser ? "is-loser" : ""}`}>
      <div className="product-image-wrap">
        <span className="product-rank">0{index + 1}</span>
        <img src={product.image} alt={product.name} loading={index > 1 ? "lazy" : "eager"} />
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="score-pill">{Math.round(score * 100)} match</span>
        </div>
        <h3>{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <p className="reason">{item.personalizedReason || product.reason}</p>
        {item.caution && <p className="caution">{item.caution}</p>}
        <div className="product-tags">
          {tags.map((tag) => (
            <span className="tag-pill" key={tag}>{tag}</span>
          ))}
        </div>
        {isLoser ? (
          <p className="duel-loser-note">A valiant contender.</p>
        ) : onChoose && !isWinner ? (
          <button className="choose-button" type="button" onClick={onChoose}>Choose this gift</button>
        ) : (
          <a
            className="buy-button"
            href={offer.affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            onClick={() => onClickOffer(product.id, offer.id)}
          >
            <span>{isWinner ? "Winner - view on" : "View on"} {offer.merchant}</span>
            <strong>{offer.source === "amazon" ? "View details" : money(offer.price, offer.currency)} &rarr;</strong>
          </a>
        )}
      </div>
    </article>
  );
}
