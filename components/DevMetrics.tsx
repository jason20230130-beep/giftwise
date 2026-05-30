import { topEventProduct } from "@/lib/analytics";
import type { ClickEvent, Marketplace, RecommendationEvent } from "@/lib/types";

type DevMetricsProps = {
  marketplace: Marketplace;
  recommendationEvents: RecommendationEvent[];
  clickEvents: ClickEvent[];
};

export function DevMetrics({ marketplace, recommendationEvents, clickEvents }: DevMetricsProps) {
  return (
    <section className="metrics-band" id="metrics">
      <details>
        <summary>Dev metrics</summary>
        <div className="metrics-grid" id="metricsGrid">
          <div className="metric-card"><span>Marketplace</span><strong>{marketplace}</strong></div>
          <div className="metric-card"><span>Recommendation events</span><strong>{recommendationEvents.length}</strong></div>
          <div className="metric-card"><span>Amazon click events</span><strong>{clickEvents.length}</strong></div>
          <div className="metric-card"><span>Top recommended</span><strong>{topEventProduct(recommendationEvents, "recommendations")}</strong></div>
          <div className="metric-card"><span>Top clicked</span><strong>{topEventProduct(clickEvents, "clicks")}</strong></div>
        </div>
      </details>
    </section>
  );
}
