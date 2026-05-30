"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { avoidances, interests, styles } from "@/lib/data";
import { fallbackCatalog, fetchCatalog } from "@/lib/catalog";
import {
  readClickEvents,
  readClicks,
  readRecommendationEvents,
  recordClick,
  recordRecommendation,
  saveClickEvent,
  saveRecommendationEvent
} from "@/lib/analytics";
import { inferMarketplace, recommend } from "@/lib/recommendations";
import type { Catalog, ClickEvent, FinderInputs, Marketplace, Recommendation, RecommendationEvent } from "@/lib/types";
import { DevMetrics } from "./DevMetrics";
import { ProductCard } from "./ProductCard";

const defaultChecked = {
  interests: ["coffee", "wellness"],
  styles: ["practical"],
  avoidances: ["too-personal"]
};

function checkboxValues(formData: FormData, name: string) {
  return formData.getAll(name).map(String);
}

export function GiftFinder() {
  const [marketplace, setMarketplace] = useState<Marketplace>("US");
  const [results, setResults] = useState<Recommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [clicks, setClicks] = useState<Record<string, number>>({});
  const [catalog, setCatalog] = useState<Catalog>(fallbackCatalog);
  const [recommendationEvents, setRecommendationEvents] = useState<RecommendationEvent[]>([]);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);

  useEffect(() => {
    setMarketplace(inferMarketplace());
    setClicks(readClicks());
    setRecommendationEvents(readRecommendationEvents());
    setClickEvents(readClickEvents());
    void fetchCatalog().then(setCatalog);
  }, []);

  const resultSummary = useMemo(() => {
    if (!hasSearched) return "Curated picks will appear here after you run the finder.";
    return `${results.length} gift picks matched to your recipient, occasion, budget, and style.`;
  }, [hasSearched, results.length]);

  function buildInputs(formData: FormData): FinderInputs {
    return {
      recipient: String(formData.get("recipient") || "mom"),
      relationship: String(formData.get("relationship") || "family"),
      occasion: String(formData.get("occasion") || "birthday"),
      ageRange: String(formData.get("ageRange") || "adult"),
      budget: Number(formData.get("budget") || 50),
      marketplace,
      timing: String(formData.get("timing") || "flexible"),
      interests: checkboxValues(formData, "interests"),
      styles: checkboxValues(formData, "styles"),
      avoidances: checkboxValues(formData, "avoidances")
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const inputs = buildInputs(new FormData(event.currentTarget));
    const items = recommend(inputs, clicks, catalog);
    setResults(items);
    setHasSearched(true);
    const nextEvents = recordRecommendation(inputs, items);
    setRecommendationEvents(nextEvents);
    const latestEvent = nextEvents[nextEvents.length - 1];
    if (latestEvent) {
      void saveRecommendationEvent(latestEvent);
    }
  }

  function handleClickOffer(productId: string, offerId: string) {
    const next = recordClick(productId, offerId, marketplace, catalog);
    setClicks(next.clicks);
    setClickEvents(next.events);
    const latestEvent = next.events[next.events.length - 1];
    if (latestEvent) {
      void saveClickEvent(latestEvent);
    }
  }

  return (
    <>
      <section className="finder-band" id="finder">
        <div className="finder-layout">
          <aside className="finder-copy">
            <p className="eyebrow">Gift decisions made easier</p>
            <h1>Find a gift people actually want.</h1>
            <p className="intro">
              Answer a few details and get shoppable recommendations chosen for the person, moment, and budget.
            </p>
            <div className="trust-row" aria-label="Recommendation strengths">
              <span>Budget matched</span>
              <span>Context aware</span>
              <span>Easy to buy</span>
            </div>
          </aside>

          <section className="finder-panel" aria-labelledby="finder-title">
            <div className="panel-heading">
              <h2 id="finder-title">Gift Finder</h2>
            </div>

            <form className="gift-form" id="giftForm" onSubmit={handleSubmit}>
              <div className="field-grid">
                <label>
                  Recipient
                  <select name="recipient" defaultValue="mom">
                    <option value="mom">Mom</option>
                    <option value="dad">Dad</option>
                    <option value="girlfriend">Girlfriend</option>
                    <option value="boyfriend">Boyfriend</option>
                    <option value="coworker">Coworker</option>
                    <option value="friend">Friend</option>
                    <option value="teacher">Teacher</option>
                    <option value="teen">Teen</option>
                  </select>
                </label>

                <label>
                  Relationship
                  <select name="relationship" defaultValue="family">
                    <option value="family">Family</option>
                    <option value="partner">Partner</option>
                    <option value="close-friend">Close friend</option>
                    <option value="casual">Casual friend</option>
                    <option value="professional">Professional</option>
                  </select>
                </label>

                <label>
                  Occasion
                  <select name="occasion" defaultValue="birthday">
                    <option value="birthday">Birthday</option>
                    <option value="christmas">Christmas</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="thank-you">Thank you</option>
                    <option value="housewarming">Housewarming</option>
                    <option value="graduation">Graduation</option>
                  </select>
                </label>

                <label>
                  Age range
                  <select name="ageRange" defaultValue="adult">
                    <option value="adult">Adult</option>
                    <option value="teen">Teen</option>
                    <option value="senior">Senior</option>
                    <option value="any">Not sure</option>
                  </select>
                </label>

                <label>
                  Budget
                  <select name="budget" defaultValue="50">
                    <option value="25">Under $25</option>
                    <option value="50">Under $50</option>
                    <option value="100">Under $100</option>
                    <option value="200">Under $200</option>
                  </select>
                </label>

                <label>
                  Timing
                  <select name="timing" defaultValue="flexible">
                    <option value="flexible">Flexible</option>
                    <option value="soon">This week</option>
                    <option value="last-minute">Last minute</option>
                  </select>
                </label>
              </div>

              <fieldset>
                <legend>Interests</legend>
                <div className="chip-grid">
                  {interests.map((option) => (
                    <label className="chip" key={option.value}>
                      <input name="interests" type="checkbox" value={option.value} defaultChecked={defaultChecked.interests.includes(option.value)} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Gift style</legend>
                <div className="chip-grid">
                  {styles.map((option) => (
                    <label className="chip" key={option.value}>
                      <input name="styles" type="checkbox" value={option.value} defaultChecked={defaultChecked.styles.includes(option.value)} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Avoid</legend>
                <div className="chip-grid">
                  {avoidances.map((option) => (
                    <label className="chip" key={option.value}>
                      <input name="avoidances" type="checkbox" value={option.value} defaultChecked={defaultChecked.avoidances.includes(option.value)} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button className="primary-button" type="submit">Get Recommendations</button>
            </form>
          </section>
        </div>
      </section>

      {hasSearched && (
        <section className="results-band" id="results" aria-live="polite">
          <div className="section-head">
            <div>
              <p className="eyebrow">Personalized shortlist</p>
              <h2>Your recommendations</h2>
            </div>
            <p id="resultSummary">{resultSummary}</p>
          </div>
          <div className="product-grid" id="recommendations">
            {results.map((item, index) => (
              <ProductCard item={item} index={index} key={item.product.id} onClickOffer={handleClickOffer} />
            ))}
          </div>
        </section>
      )}

      {process.env.NODE_ENV === "development" && (
        <DevMetrics marketplace={marketplace} catalog={catalog} recommendationEvents={recommendationEvents} clickEvents={clickEvents} />
      )}
    </>
  );
}
