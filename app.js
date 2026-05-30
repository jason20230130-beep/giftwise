const {
  interests,
  styles,
  avoidances,
  products,
  merchantOffers
} = window.GiftwiseData;

const offersByProductId = merchantOffers.reduce((index, offer) => {
  if (!index[offer.productId]) index[offer.productId] = [];
  index[offer.productId].push(offer);
  return index;
}, {});

const state = {
  clicks: JSON.parse(localStorage.getItem("giftwise_clicks") || "{}"),
  recommendationEvents: JSON.parse(localStorage.getItem("giftwise_recommendation_events") || "[]"),
  clickEvents: JSON.parse(localStorage.getItem("giftwise_click_events") || "[]"),
  marketplace: inferMarketplace()
};

const $ = (selector) => document.querySelector(selector);

function primaryOffer(product, marketplace = "US") {
  const offers = offersByProductId[product.id] || [];
  return offers.find((offer) => offer.marketplace === marketplace && offer.availability === "in_stock")
    || offers.find((offer) => offer.availability === "in_stock")
    || null;
}

function inferMarketplace() {
  const locale = navigator.language || "";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (locale.toLowerCase().endsWith("-ca") || timeZone.includes("Canada") || timeZone === "America/Edmonton") {
    return "CA";
  }
  return "US";
}

function renderChips(containerId, options, name, defaults = []) {
  const container = document.getElementById(containerId);
  container.innerHTML = options.map((option) => `
    <label class="chip">
      <input type="checkbox" name="${name}" value="${option.value}" ${defaults.includes(option.value) ? "checked" : ""}>
      <span>${option.label}</span>
    </label>
  `).join("");
}

function selectedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function getInputs() {
  return {
    recipient: $("#recipient").value,
    relationship: $("#relationship").value,
    occasion: $("#occasion").value,
    ageRange: $("#ageRange").value,
    budget: Number($("#budget").value),
    marketplace: state.marketplace,
    timing: $("#timing").value,
    interests: selectedValues("interests"),
    styles: selectedValues("styles"),
    avoidances: selectedValues("avoidances")
  };
}

function scoreProduct(product, inputs) {
  const offer = primaryOffer(product, inputs.marketplace);
  if (!["active", "featured"].includes(product.status)) return -Infinity;
  if (!offer || !offer.affiliateUrl) return -Infinity;
  if (offer.price > inputs.budget * 1.2) return -Infinity;

  const tagScore = [
    product.tags[inputs.recipient] || 0,
    product.tags[inputs.relationship] || 0,
    product.tags[inputs.occasion] || 0,
    inputs.ageRange === "any" ? 0.4 : product.tags[inputs.ageRange] || 0,
    product.tags[inputs.timing] || 0,
    ...inputs.interests.map((tag) => product.tags[tag] || 0),
    ...inputs.styles.map((tag) => product.tags[tag] || 0)
  ].reduce((sum, value) => sum + value, 0);

  const riskPenalty = inputs.avoidances
    .map((tag) => product.tags[tag] || 0)
    .reduce((sum, value) => sum + value, 0) * 1.25;
  const budgetFit = Math.max(0, 1 - Math.abs(offer.price - inputs.budget * 0.72) / inputs.budget);
  const qualityBoost = product.status === "featured" ? 0.45 : 0.15;
  const behaviorBoost = trendScore(product) * 0.65;
  const commerceBoost = offer.price >= 35 ? 0.18 : 0.08;
  const timingBoost = inputs.timing === "last-minute" && offer.price <= 50 ? 0.25 : 0;

  return tagScore + budgetFit + qualityBoost + behaviorBoost + commerceBoost + timingBoost - riskPenalty;
}

function trendScore(product) {
  const localClicks = state.clicks[product.id] || 0;
  const clickRate = product.signals.clicks / Math.max(product.signals.recommendations, 1);
  return clickRate * 2 + product.signals.saves / 120 + product.signals.freshness + localClicks * 0.08;
}

function recommend(inputs) {
  return products
    .map((product) => ({ product, offer: primaryOffer(product, inputs.marketplace), score: scoreProduct(product, inputs) }))
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function money(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function productCard(item, index) {
  const { product, offer, score } = item;
  const tags = Object.entries(product.tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => `<span class="tag-pill">${tag.replace("-", " ")}</span>`)
    .join("");

  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="${index > 1 ? "lazy" : "eager"}">
      <div class="product-body">
        <div class="product-meta">
          <span class="price">${money(offer.price, offer.currency)}</span>
          <span class="score-pill">${Math.round(score * 10)} match</span>
        </div>
        <h3>${product.name}</h3>
        <p class="reason">${product.reason}</p>
        <div class="product-tags">${tags}</div>
        <a class="buy-button" href="${offer.affiliateUrl}" target="_blank" rel="nofollow sponsored noopener" data-product-id="${product.id}" data-offer-id="${offer.id}">Check Price on ${offer.merchant}</a>
      </div>
    </article>
  `;
}

function renderRecommendations(items) {
  $("#results").classList.remove("is-hidden");
  $("#recommendations").innerHTML = items.map(productCard).join("");
  $("#resultSummary").textContent = `${items.length} gift picks matched to your recipient, occasion, budget, and style.`;
}

function persistEvents() {
  state.recommendationEvents = state.recommendationEvents.slice(-100);
  state.clickEvents = state.clickEvents.slice(-250);
  localStorage.setItem("giftwise_recommendation_events", JSON.stringify(state.recommendationEvents));
  localStorage.setItem("giftwise_click_events", JSON.stringify(state.clickEvents));
}

function recordRecommendation(inputs, items) {
  state.recommendationEvents.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    inputs,
    marketplace: inputs.marketplace,
    recommendedProducts: items.map(({ product, offer, score }, index) => ({
      productId: product.id,
      offerId: offer.id,
      merchant: offer.merchant,
      marketplace: offer.marketplace,
      score: Number(score.toFixed(3)),
      position: index + 1
    }))
  });
  persistEvents();
  renderMetrics();
}

function recordClick(productId, offerId) {
  const offer = merchantOffers.find((item) => item.id === offerId) || null;
  state.clickEvents.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    productId,
    offerId,
    merchant: offer ? offer.merchant : null,
    marketplace: offer ? offer.marketplace : state.marketplace,
    placement: "recommendation-card"
  });
  persistEvents();
  renderMetrics();
}

function trendingProducts(filter, marketplace = "US") {
  return products
    .filter((product) => primaryOffer(product, marketplace) && filter(product, primaryOffer(product, marketplace)))
    .map((product) => ({ product, score: trendScore(product) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function renderTrendLists() {
  if (!$("#trendLists")) return;
  const marketplace = state.marketplace;
  const lists = [
    {
      title: "Most clicked under $50",
      meta: "Click intent + saves",
      products: trendingProducts((product, offer) => offer.price <= 50, marketplace)
    },
    {
      title: "Popular for parents",
      meta: "Mom and dad match scores",
      products: trendingProducts((product) => (product.tags.mom || 0) + (product.tags.dad || 0) > 1.3, marketplace)
    },
    {
      title: "Safe coworker gifts",
      meta: "Professional fit + low risk",
      products: trendingProducts((product) => (product.tags.coworker || 0) > 0.65, marketplace)
    }
  ];

  $("#trendLists").innerHTML = lists.map((list) => `
    <article class="trend-card">
      <h3>${list.title}</h3>
      <div class="trend-meta">${list.meta}</div>
      <ol>
        ${list.products.map(({ product }) => `<li>${product.name}</li>`).join("")}
      </ol>
    </article>
  `).join("");
}

function topEventProduct(events, mode) {
  const counts = events.reduce((index, event) => {
    const productIds = mode === "recommendations"
      ? event.recommendedProducts.map((item) => item.productId)
      : [event.productId];
    productIds.forEach((id) => {
      index[id] = (index[id] || 0) + 1;
    });
    return index;
  }, {});
  const [productId, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
  const product = products.find((item) => item.id === productId);
  return product ? `${product.name} (${count})` : "None yet";
}

function renderMetrics() {
  if (!$("#metricsGrid")) return;
  $("#metricsGrid").innerHTML = `
    <div class="metric-card"><span>Marketplace</span><strong>${state.marketplace}</strong></div>
    <div class="metric-card"><span>Recommendation events</span><strong>${state.recommendationEvents.length}</strong></div>
    <div class="metric-card"><span>Amazon click events</span><strong>${state.clickEvents.length}</strong></div>
    <div class="metric-card"><span>Top recommended</span><strong>${topEventProduct(state.recommendationEvents, "recommendations")}</strong></div>
    <div class="metric-card"><span>Top clicked</span><strong>${topEventProduct(state.clickEvents, "clicks")}</strong></div>
  `;
}

function trackClick(event) {
  const link = event.target.closest("[data-product-id]");
  if (!link) return;
  const id = link.dataset.productId;
  state.clicks[id] = (state.clicks[id] || 0) + 1;
  localStorage.setItem("giftwise_clicks", JSON.stringify(state.clicks));
  recordClick(id, link.dataset.offerId);
  renderTrendLists();
}

function init() {
  renderChips("interestOptions", interests, "interests", ["coffee", "wellness"]);
  renderChips("styleOptions", styles, "styles", ["practical"]);
  renderChips("avoidOptions", avoidances, "avoidances", ["too-personal"]);

  $("#giftForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const inputs = getInputs();
    const items = recommend(inputs);
    renderRecommendations(items);
    recordRecommendation(inputs, items);
  });

  renderMetrics();
  document.addEventListener("click", trackClick);
}

init();
