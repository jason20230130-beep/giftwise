"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar as CalendarBlank,
  CircleHelp as Question,
  Coffee,
  CookingPot,
  Dna as Fingerprint,
  Gift,
  GraduationCap,
  Headphones,
  Heart,
  House,
  Lock as LockSimple,
  Mountain as Mountains,
  Sparkles as Sparkle,
  Store as Storefront,
  User,
  Users as UsersThree,
  Zap as Lightning,
} from "lucide-react";
import { ElementType, useEffect, useMemo, useState } from "react";
import { DevMetrics } from "./DevMetrics";
import { ProductCard } from "./ProductCard";
import { fallbackCatalog, fetchCatalog } from "../lib/catalog";
import {
  readClickEvents,
  readRecommendationEvents,
  recordClick,
  recordRecommendation,
  saveClickEvent,
  saveRecommendationEvent,
} from "../lib/analytics";
import { inferMarketplace } from "../lib/recommendations";
import type { Catalog, ClickEvent, FinderInputs, GiftMode, Marketplace, Recommendation, RecommendationEvent } from "../lib/types";

type AnswerKey = "recipient" | "personality" | "interest" | "occasion";
type Answers = NonNullable<FinderInputs["answers"]>;

type Choice = {
  value: string;
  label: string;
  icon: ElementType;
};

type Step = {
  key: AnswerKey;
  shortLabel: string;
  question: string;
  helper: string;
  choices: Choice[];
};

const recipients: Choice[] = [
  { value: "mom", label: "Mom", icon: Heart },
  { value: "dad", label: "Dad", icon: User },
  { value: "partner", label: "Partner", icon: Sparkle },
  { value: "friend", label: "Friend", icon: UsersThree },
  { value: "coworker", label: "Coworker", icon: Briefcase },
  { value: "teen", label: "Teen", icon: Headphones },
];

const personalities: Choice[] = [
  { value: "cozy-homebody", label: "Cozy homebody", icon: House },
  { value: "coffee-person", label: "Coffee person", icon: Coffee },
  { value: "always-outdoors", label: "Always outdoors", icon: Mountains },
  { value: "tech-curious", label: "Tech curious", icon: Headphones },
  { value: "the-host", label: "The host", icon: CookingPot },
  { value: "hard-to-shop-for", label: "Hard to shop for", icon: Question },
];

const interests: Choice[] = [
  { value: "cooking", label: "Cooking", icon: CookingPot },
  { value: "wellness", label: "Wellness", icon: Heart },
  { value: "reading", label: "Reading", icon: BookOpen },
  { value: "style", label: "Style", icon: Sparkle },
  { value: "home", label: "Home", icon: House },
  { value: "surprise-me", label: "Surprise me", icon: Gift },
];

const occasions: Choice[] = [
  { value: "birthday", label: "Birthday", icon: Gift },
  { value: "thank-you", label: "Thank you", icon: Heart },
  { value: "housewarming", label: "Housewarming", icon: House },
  { value: "graduation", label: "Graduation", icon: GraduationCap },
  { value: "holiday", label: "Holiday", icon: Sparkle },
  { value: "just-because", label: "Just because", icon: CalendarBlank },
];

const dnaSteps: Step[] = [
  {
    key: "recipient",
    shortLabel: "Person",
    question: "Who is this for?",
    helper: "Start with the relationship that fits best.",
    choices: recipients,
  },
  {
    key: "personality",
    shortLabel: "Personality",
    question: "What are they like?",
    helper: "Pick the one that feels most like them.",
    choices: personalities,
  },
  {
    key: "interest",
    shortLabel: "Interests",
    question: "What lights them up?",
    helper: "One good clue is enough for the AI to start.",
    choices: interests,
  },
  {
    key: "occasion",
    shortLabel: "Moment",
    question: "What is the occasion?",
    helper: "The moment changes what makes a gift feel right.",
    choices: occasions,
  },
];

const budgets = [25, 50, 100, 200];

function getProfileScores(answers: Answers) {
  let practical = 30;
  let curious = 24;
  let particular = 22;
  const values = Object.values(answers);

  if (values.some((value) => ["dad", "coworker", "cooking", "home", "the-host"].includes(String(value)))) practical += 34;
  if (values.some((value) => ["teen", "friend", "tech-curious", "reading", "surprise-me"].includes(String(value)))) curious += 38;
  if (values.some((value) => ["partner", "mom", "style", "hard-to-shop-for"].includes(String(value)))) particular += 40;
  if (answers.personality === "always-outdoors") {
    practical += 18;
    curious += 12;
  }

  return {
    practical: Math.min(practical, 92),
    curious: Math.min(curious, 92),
    particular: Math.min(particular, 92),
  };
}

export function GiftFinder() {
  const [mode, setMode] = useState<Exclude<GiftMode, "duel">>("dna");
  const [stepIndex, setStepIndex] = useState(0);
  const [brief, setBrief] = useState("");
  const [answers, setAnswers] = useState<Answers>({ budget: 50 });
  const [marketplace, setMarketplace] = useState<Marketplace>("US");
  const [results, setResults] = useState<Recommendation[]>([]);
  const [profileSummary, setProfileSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState<Catalog>(fallbackCatalog);
  const [recommendationEvents, setRecommendationEvents] = useState<RecommendationEvent[]>([]);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);

  const currentStep = dnaSteps[stepIndex];
  const profileScores = useMemo(() => getProfileScores(answers), [answers]);

  useEffect(() => {
    setMarketplace(inferMarketplace());
    setRecommendationEvents(readRecommendationEvents());
    setClickEvents(readClickEvents());
    void fetchCatalog().then(setCatalog);
  }, []);

  function changeMode(nextMode: Exclude<GiftMode, "duel">) {
    setMode(nextMode);
    setResults([]);
    setProfileSummary("");
    setError("");
  }

  function choose(key: AnswerKey, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function chooseBudget(value: number) {
    setAnswers((current) => ({ ...current, budget: value }));
  }

  async function runFinder(excludedProductIds: string[] = []) {
    setLoading(true);
    setError("");

    try {
      const inputs: FinderInputs = { brief, mode, marketplace, answers, excludedProductIds };
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "The gift finder could not complete that request.");

      setMarketplace(data.marketplace);
      setResults(data.recommendations);
      setProfileSummary(data.profileSummary || "");
      const nextEvents = recordRecommendation({ ...inputs, marketplace: data.marketplace }, data.recommendations);
      setRecommendationEvents(nextEvents);
      const latestEvent = nextEvents[nextEvents.length - 1];
      if (latestEvent) void saveRecommendationEvent(latestEvent);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The gift finder could not complete that request.");
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    if (!answers[currentStep.key]) return;
    if (stepIndex < dnaSteps.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }
    void runFinder();
  }

  function handleProductClick(productId: string, offerId: string) {
    const next = recordClick(productId, offerId, marketplace, catalog);
    setClickEvents(next.events);
    const latestEvent = next.events[next.events.length - 1];
    if (latestEvent) void saveClickEvent(latestEvent);
  }

  const canSubmitPanic = Boolean(answers.recipient && answers.occasion && answers.budget);

  return (
    <>
      <section className="finder-hero">
        <p className="eyebrow">AI-curated gifts, matched to their world</p>
        <h1>Let&apos;s find a gift<br />they&apos;ll actually remember.</h1>
        <p>Answer a few quick questions and get thoughtful, shoppable picks chosen just for them.</p>
      </section>

      <section className="finder-shell" id="finder" aria-label="Gift finder">
        <div className="mode-switch" aria-label="Gift finding mode">
          <button className={mode === "dna" ? "active" : ""} onClick={() => changeMode("dna")} type="button">
            <Fingerprint size={18} /> Gift DNA
          </button>
          <button className={mode === "badly" ? "active" : ""} onClick={() => changeMode("badly")} type="button">
            <Sparkle size={18} /> Describe them badly
          </button>
          <button className={mode === "panic" ? "active" : ""} onClick={() => changeMode("panic")} type="button">
            <Lightning size={18} /> Panic mode
          </button>
        </div>

        <div className="finder-workspace">
          <div className="question-pane">
            {mode === "dna" && (
              <>
                <div className="step-rail" aria-label="Progress">
                  {dnaSteps.map((step, index) => (
                    <button
                      className={index === stepIndex ? "active" : index < stepIndex ? "done" : ""}
                      key={step.key}
                      onClick={() => setStepIndex(index)}
                      type="button"
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {step.shortLabel}
                    </button>
                  ))}
                </div>

                <div className="question-heading">
                  <span>{String(stepIndex + 1).padStart(2, "0")} / {String(dnaSteps.length).padStart(2, "0")}</span>
                  <h2>{currentStep.question}</h2>
                  <p>{currentStep.helper}</p>
                </div>

                <div className="option-grid">
                  {currentStep.choices.map(({ value, label, icon: Icon }) => (
                    <button
                      className={`option-tile ${answers[currentStep.key] === value ? "active" : ""}`}
                      key={value}
                      onClick={() => choose(currentStep.key, value)}
                      type="button"
                    >
                      <Icon size={34} strokeWidth={1.35} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {stepIndex === 0 && (
                  <label className="brief-field">
                    <span>One extra clue <em>optional</em></span>
                    <input
                      onChange={(event) => setBrief(event.target.value)}
                      placeholder="She has started making sourdough and loves tiny rituals."
                      value={brief}
                    />
                  </label>
                )}

                {stepIndex === dnaSteps.length - 1 && (
                  <BudgetPicker value={answers.budget || 50} onChange={chooseBudget} />
                )}

                <div className="question-actions">
                  <button
                    aria-label="Previous question"
                    className="icon-button"
                    disabled={stepIndex === 0}
                    onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                    type="button"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    className="primary-button"
                    disabled={!answers[currentStep.key] || loading}
                    onClick={handleContinue}
                    type="button"
                  >
                    {loading ? "Finding gifts..." : stepIndex === dnaSteps.length - 1 ? "Find their gifts" : "Continue"}
                    {!loading && <ArrowRight size={19} />}
                  </button>
                </div>
              </>
            )}

            {mode === "badly" && (
              <div className="single-mode">
                <div className="question-heading">
                  <span>THE UNOFFICIAL BIOGRAPHY</span>
                  <h2>Describe them badly.</h2>
                  <p>Be specific, strange, affectionate, or all three. The AI will translate.</p>
                </div>
                <textarea
                  onChange={(event) => setBrief(event.target.value)}
                  placeholder="Owns six tote bags, distrusts overhead lighting, and gets emotionally attached to mugs."
                  rows={6}
                  value={brief}
                />
                <BudgetPicker value={answers.budget || 50} onChange={chooseBudget} />
                <button className="primary-button" disabled={!brief.trim() || loading} onClick={() => void runFinder()} type="button">
                  {loading ? "Decoding..." : "Decode their gifts"} {!loading && <Sparkle size={18} />}
                </button>
              </div>
            )}

            {mode === "panic" && (
              <div className="single-mode panic-mode">
                <div className="question-heading">
                  <span>NEED A WIN, QUICKLY</span>
                  <h2>Panic mode.</h2>
                  <p>Three fast clues. Broad appeal, easy buying, zero spiraling.</p>
                </div>
                <CompactChoices label="Who?" choices={recipients} selected={answers.recipient} onChange={(value) => choose("recipient", value)} />
                <CompactChoices label="Why?" choices={occasions} selected={answers.occasion} onChange={(value) => choose("occasion", value)} />
                <BudgetPicker value={answers.budget || 50} onChange={chooseBudget} />
                <button className="primary-button" disabled={!canSubmitPanic || loading} onClick={() => void runFinder()} type="button">
                  {loading ? "Finding gifts..." : "Save the day"} {!loading && <Lightning size={18} />}
                </button>
              </div>
            )}
          </div>

          <aside className="dna-pane">
            <Fingerprint size={34} strokeWidth={1.35} />
            <h2>Their Gift DNA</h2>
            <div className="short-rule" />
            <DnaTrait icon={Briefcase} label="Practical" score={profileScores.practical} />
            <DnaTrait icon={Sparkle} label="Curious" score={profileScores.curious} />
            <DnaTrait icon={Question} label="A little particular" score={profileScores.particular} />
            <div className="privacy-note">
              <LockSimple size={17} />
              <p>Your answers stay private.<br />We only use them to find great gifts.</p>
            </div>
          </aside>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}

      {results.length > 0 && (
        <section className="results-section" aria-live="polite">
          <div className="results-heading">
            <div>
              <p className="eyebrow">{marketplace} marketplace matched</p>
              <h2>{profileSummary || "A few gifts worth giving."}</h2>
            </div>
            <button className="secondary-button" onClick={() => void runFinder(results.map((item) => item.product.id))} type="button">
              <Sparkle size={17} /> Reroll gifts
            </button>
          </div>
          <div className="product-grid">
            {results.map((recommendation, index) => (
              <ProductCard
                key={recommendation.product.id}
                index={index}
                item={recommendation}
                onClickOffer={handleProductClick}
              />
            ))}
          </div>
        </section>
      )}

      <section className="trust-strip" id="how-it-works">
        <div><Storefront size={19} /> Region matched</div>
        <div><Gift size={19} /> Shoppable picks</div>
        <div><Sparkle size={19} /> AI-curated</div>
      </section>

      {process.env.NODE_ENV === "development" && (
        <DevMetrics catalog={catalog} clickEvents={clickEvents} marketplace={marketplace} recommendationEvents={recommendationEvents} />
      )}
    </>
  );
}

function BudgetPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="budget-picker">
      <span>Budget</span>
      <div>
        {budgets.map((budget) => (
          <button className={value === budget ? "active" : ""} key={budget} onClick={() => onChange(budget)} type="button">
            ${budget}
          </button>
        ))}
      </div>
    </div>
  );
}

function CompactChoices({
  label,
  choices,
  selected,
  onChange,
}: {
  label: string;
  choices: Choice[];
  selected?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="compact-choices">
      <strong>{label}</strong>
      <div>
        {choices.map(({ label: choiceLabel, value }) => (
          <button className={value === selected ? "active" : ""} key={value} onClick={() => onChange(value)} type="button">
            {choiceLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function DnaTrait({ icon: Icon, label, score }: { icon: ElementType; label: string; score: number }) {
  return (
    <div className="dna-trait">
      <Icon size={25} strokeWidth={1.35} />
      <div>
        <strong>{label}</strong>
        <div className="dna-ruler" aria-label={`${label}: ${score}%`}>
          {[0, 1, 2, 3, 4, 5].map((tick) => <span key={tick} />)}
          <i style={{ left: `${score}%` }} />
        </div>
        <small>{score > 56 ? "Strong signal" : "Decoding..."}</small>
      </div>
    </div>
  );
}
