"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { fallbackCatalog, fetchCatalog } from "@/lib/catalog";
import {
  readClickEvents,
  readClicks,
  readRecommendationEvents,
  recordClick,
  recordDuelChoice,
  recordRecommendation,
  saveClickEvent,
  saveDuelChoiceEvent,
  saveRecommendationEvent
} from "@/lib/analytics";
import { inferMarketplace } from "@/lib/recommendations";
import type { Catalog, ClickEvent, DuelChoiceEvent, FinderInputs, GiftMode, Marketplace, Recommendation, RecommendationEvent } from "@/lib/types";
import { DevMetrics } from "./DevMetrics";
import { ProductCard } from "./ProductCard";

const modes: Array<{ id: GiftMode; label: string; kicker: string; placeholder: string; button: string }> = [
  {
    id: "thoughtful",
    label: "Thoughtful Pick",
    kicker: "A considered shortlist",
    placeholder: "A birthday gift for my dad who is hard to shop for...",
    button: "Find thoughtful gifts"
  },
  {
    id: "wildcard",
    label: "Wildcard",
    kicker: "A little less predictable",
    placeholder: "Surprise my coffee-obsessed coworker without being boring...",
    button: "Surprise me"
  },
  {
    id: "duel",
    label: "Gift Duel",
    kicker: "Two gifts enter. One gift leaves.",
    placeholder: "Help me choose a housewarming gift for my stylish friend...",
    button: "Start a duel"
  }
];

export function GiftFinder() {
  const [brief, setBrief] = useState("");
  const [mode, setMode] = useState<GiftMode>("thoughtful");
  const [marketplace, setMarketplace] = useState<Marketplace>("US");
  const [results, setResults] = useState<Recommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clicks, setClicks] = useState<Record<string, number>>({});
  const [catalog, setCatalog] = useState<Catalog>(fallbackCatalog);
  const [recommendationEvents, setRecommendationEvents] = useState<RecommendationEvent[]>([]);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);
  const [latestRecommendationEventId, setLatestRecommendationEventId] = useState<string | null>(null);
  const [duelWinnerId, setDuelWinnerId] = useState<string | null>(null);

  useEffect(() => {
    setMarketplace(inferMarketplace());
    setClicks(readClicks());
    setRecommendationEvents(readRecommendationEvents());
    setClickEvents(readClickEvents());
    void fetchCatalog().then(setCatalog);
  }, []);

  const activeMode = modes.find((item) => item.id === mode)!;
  const resultSummary = useMemo(() => {
    if (mode === "duel") return "Pick the gift you would actually give. There is no wrong answer, but there is a winner.";
    if (mode === "wildcard") return `${results.length} less-obvious ideas selected from gifts available in your region.`;
    return `${results.length} gifts selected for the person and moment you described.`;
  }, [mode, results.length]);

  async function runFinder(excludedProductIds: string[] = []) {
    setError("");
    setIsLoading(true);
    setDuelWinnerId(null);
    const inputs: FinderInputs = { brief, mode, marketplace, excludedProductIds };
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "AI recommendation failed.");
      const items = payload.recommendations as Recommendation[];
      const resolvedMarketplace = (payload.marketplace as Marketplace | undefined) || marketplace;
      setMarketplace(resolvedMarketplace);
      setResults(items);
      setHasSearched(true);
      const nextEvents = recordRecommendation({ ...inputs, marketplace: resolvedMarketplace }, items);
      setRecommendationEvents(nextEvents);
      const latestEvent = nextEvents[nextEvents.length - 1];
      setLatestRecommendationEventId(latestEvent?.id || null);
      if (latestEvent) void saveRecommendationEvent(latestEvent);
    } catch (caught) {
      setResults([]);
      setHasSearched(false);
      setError(caught instanceof Error ? caught.message : "AI recommendation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runFinder();
  }

  function handleReroll() {
    void runFinder(results.map((item) => item.product.id));
  }

  function handleClickOffer(productId: string, offerId: string) {
    const next = recordClick(productId, offerId, marketplace, catalog);
    setClicks(next.clicks);
    setClickEvents(next.events);
    const latestEvent = next.events[next.events.length - 1];
    if (latestEvent) void saveClickEvent(latestEvent);
  }

  function handleChooseDuel(winnerProductId: string) {
    const loser = results.find((item) => item.product.id !== winnerProductId);
    if (!loser || duelWinnerId) return;
    setDuelWinnerId(winnerProductId);
    const event: DuelChoiceEvent = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      recommendationEventId: latestRecommendationEventId,
      marketplace,
      brief,
      winnerProductId,
      loserProductId: loser.product.id
    };
    recordDuelChoice(event);
    void saveDuelChoiceEvent(event);
  }

  return (
    <>
      <section className="finder-band" id="finder">
        <div className="search-shell">
          <p className="eyebrow">AI gift finder</p>
          <h1>Find a gift with a little <em>instinct.</em></h1>
          <p className="intro">Describe the person, the occasion, or the problem. Giftwise will take it from there.</p>

          <div className="mode-switcher" aria-label="Gift finder mode">
            {modes.map((item) => (
              <button
                className={`mode-button ${mode === item.id ? "is-active" : ""}`}
                key={item.id}
                type="button"
                onClick={() => {
                  setMode(item.id);
                  setHasSearched(false);
                  setResults([]);
                  setDuelWinnerId(null);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="giftBrief">Describe the gift you need</label>
            <textarea
              id="giftBrief"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder={activeMode.placeholder}
              maxLength={500}
              rows={2}
            />
            <button className="primary-button" type="submit" disabled={isLoading}>
              {isLoading ? "Thinking..." : activeMode.button}
            </button>
          </form>
          <p className="search-note">{activeMode.kicker}. Region matched automatically.</p>
          {error && <p className="form-error">{error}</p>}
        </div>
      </section>

      {hasSearched && (
        <section className={`results-band results-${mode}`} id="results" aria-live="polite">
          <div className="section-head">
            <div>
              <p className="step-label">{mode === "duel" ? "Choose your champion" : mode === "wildcard" ? "A few wild cards" : "Your shortlist"}</p>
              <h2>{mode === "duel" ? "Which one wins?" : mode === "wildcard" ? "Unexpected, but not unhinged." : "Worth considering."}</h2>
            </div>
            <p>{resultSummary}</p>
          </div>

          {mode === "duel" ? (
            <div className="duel-stage">
              {results.map((item, index) => (
                <div className="duel-entry" key={item.product.id}>
                  {index === 1 && <span className="duel-vs">VS</span>}
                  <ProductCard
                    item={item}
                    index={index}
                    isWinner={duelWinnerId === item.product.id}
                    isLoser={Boolean(duelWinnerId && duelWinnerId !== item.product.id)}
                    onChoose={() => handleChooseDuel(item.product.id)}
                    onClickOffer={handleClickOffer}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid" id="recommendations">
              {results.map((item, index) => (
                <ProductCard item={item} index={index} key={item.product.id} onClickOffer={handleClickOffer} />
              ))}
            </div>
          )}

          {(mode === "wildcard" || mode === "duel") && (
            <div className="reroll-row">
              <button className="secondary-button" type="button" onClick={handleReroll} disabled={isLoading}>
                {mode === "duel" ? "Start another duel" : "Surprise me again"}
              </button>
            </div>
          )}
        </section>
      )}

      {process.env.NODE_ENV === "development" && (
        <DevMetrics marketplace={marketplace} catalog={catalog} recommendationEvents={recommendationEvents} clickEvents={clickEvents} />
      )}
    </>
  );
}
