export type GiftGuide = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  terms: string[];
  budgetMax?: number;
  faqs: Array<{ question: string; answer: string }>;
};

const sharedFaqs = {
  budget: {
    question: "How much should I spend on a gift?",
    answer: "A thoughtful gift does not need to be expensive. Pick the lowest price point that still feels specific to the person and occasion."
  },
  avoid: {
    question: "What should I avoid buying?",
    answer: "Avoid items that depend heavily on sizing, private taste, allergies, or a hobby skill level you do not know."
  },
  finder: {
    question: "Can AI help narrow this list?",
    answer: "Yes. Use the AI gift finder when you know a few personal clues and want a shorter, more specific shortlist."
  }
};

export const giftGuides: GiftGuide[] = [
  {
    slug: "gifts-for-coffee-lovers-under-50",
    title: "Best Gifts for Coffee Lovers Under $50",
    description: "Shoppable coffee gift ideas under $50, from desk-friendly warmers to brewing accessories.",
    eyebrow: "Coffee gifts",
    intro: "For the person who treats coffee like a small daily ceremony, look for useful upgrades, cozy desk gear, and accessories that make brewing feel a little more intentional.",
    terms: ["coffee", "espresso", "mug", "tea", "warmer", "brew", "kitchen"],
    budgetMax: 50,
    faqs: [
      { question: "What is a safe gift for a coffee lover?", answer: "A mug warmer, quality mug, coffee scale, or brewing accessory is usually safer than choosing beans if you do not know their taste." },
      sharedFaqs.budget,
      sharedFaqs.finder
    ]
  },
  {
    slug: "gifts-for-outdoorsy-teens",
    title: "Best Gifts for Outdoorsy Teens",
    description: "Gift ideas for teens who like camping, hiking, exploring, and being outside.",
    eyebrow: "Outdoor gifts",
    intro: "Outdoor teen gifts should feel adventurous without being unsafe. Prioritize durable, practical items that work for camping, hiking, travel, or backyard exploring.",
    terms: ["outdoor", "camping", "hiking", "waterproof", "travel", "headlamp", "speaker", "teen"],
    budgetMax: 75,
    faqs: [
      { question: "What makes an outdoor gift teen-friendly?", answer: "Choose items that are durable, easy to use, and not hazardous. Avoid knives, blades, and survival gear unless a parent specifically approves." },
      sharedFaqs.avoid,
      sharedFaqs.finder
    ]
  },
  {
    slug: "last-minute-gifts-for-coworkers",
    title: "Best Last-Minute Gifts for Coworkers",
    description: "Easy coworker gift ideas that feel thoughtful without being too personal.",
    eyebrow: "Coworker gifts",
    intro: "Coworker gifts work best when they are useful, low-pressure, and easy to enjoy at a desk, in a kitchen, or during a busy workday.",
    terms: ["desk", "office", "coffee", "mug", "pen", "planner", "coworker", "thank"],
    budgetMax: 40,
    faqs: [
      { question: "What is an appropriate coworker gift?", answer: "A good coworker gift is practical, modestly priced, and not too intimate. Desk items, mugs, snacks, and small organizers are safe places to start." },
      sharedFaqs.budget,
      sharedFaqs.finder
    ]
  },
  {
    slug: "useful-gifts-for-moms-who-cook",
    title: "Useful Gifts for Moms Who Cook",
    description: "Kitchen and cooking gift ideas for moms who enjoy hosting, prepping, and making meals.",
    eyebrow: "Kitchen gifts",
    intro: "For someone who spends real time in the kitchen, useful gifts beat novelty. Look for tools, boards, storage, and small upgrades that make cooking feel smoother.",
    terms: ["kitchen", "cook", "cooking", "chef", "board", "utensil", "baking", "mom"],
    budgetMax: 100,
    faqs: [
      { question: "What is a useful cooking gift?", answer: "Choose something that improves a task they already do, such as prep, serving, storage, baking, or cleanup." },
      sharedFaqs.avoid,
      sharedFaqs.finder
    ]
  },
  {
    slug: "gifts-for-hard-to-shop-for-people",
    title: "Gifts for People Who Are Hard to Shop For",
    description: "Flexible gift ideas for people with specific taste or no obvious wishlist.",
    eyebrow: "Hard to shop for",
    intro: "When someone is hard to shop for, skip overly specific tastes and look for useful, cozy, or quietly delightful items with broad appeal.",
    terms: ["gift", "unique", "useful", "cozy", "home", "desk", "kitchen", "travel"],
    budgetMax: 75,
    faqs: [
      { question: "What do you buy someone who wants nothing?", answer: "Pick a gift that improves a routine they already have, rather than trying to invent a new hobby for them." },
      sharedFaqs.budget,
      sharedFaqs.finder
    ]
  },
  {
    slug: "cozy-gifts-for-homebodies",
    title: "Cozy Gifts for Homebodies",
    description: "Comfortable, home-friendly gifts for people who love staying in.",
    eyebrow: "Cozy gifts",
    intro: "Homebody gifts should make staying in feel warmer, calmer, or more enjoyable. Think comfort, small rituals, and everyday usefulness.",
    terms: ["cozy", "home", "blanket", "mug", "candle", "tea", "pillow", "comfort"],
    budgetMax: 80,
    faqs: [
      { question: "What is a good cozy gift?", answer: "A good cozy gift supports a relaxing routine, such as reading, tea, movie nights, or a calmer bedroom or living room." },
      sharedFaqs.avoid,
      sharedFaqs.finder
    ]
  },
  {
    slug: "best-gifts-under-25",
    title: "Best Gifts Under $25 That Do Not Feel Cheap",
    description: "Budget-friendly gift ideas under $25 that still feel personal and useful.",
    eyebrow: "Under $25",
    intro: "A low budget can still feel thoughtful when the item is specific, useful, or charming enough to avoid looking like a filler gift.",
    terms: ["gift", "mug", "desk", "kitchen", "coffee", "small", "cute", "useful"],
    budgetMax: 25,
    faqs: [
      { question: "Can a gift under $25 feel thoughtful?", answer: "Yes. The trick is to choose something that fits a real habit or interest instead of a generic novelty item." },
      sharedFaqs.avoid,
      sharedFaqs.finder
    ]
  },
  {
    slug: "best-gifts-under-50",
    title: "Best Gifts Under $50 for Any Occasion",
    description: "Versatile gifts under $50 for birthdays, thank you gifts, holidays, and everyday surprises.",
    eyebrow: "Under $50",
    intro: "Under $50 is a strong range for practical gifts, small luxuries, and hobby-adjacent items that feel considered without being too much.",
    terms: ["gift", "coffee", "kitchen", "desk", "home", "travel", "cozy", "outdoor"],
    budgetMax: 50,
    faqs: [
      { question: "Is $50 enough for a good gift?", answer: "Yes. A clear fit matters more than price. Under $50 can cover many useful and personal gifts." },
      sharedFaqs.avoid,
      sharedFaqs.finder
    ]
  },
  {
    slug: "gifts-for-someone-who-wants-nothing",
    title: "Gifts for Someone Who Says They Want Nothing",
    description: "Low-pressure gift ideas for people who say they do not need anything.",
    eyebrow: "No wishlist",
    intro: "For someone who says they want nothing, the best gifts are easy to accept: useful, consumable, cozy, or connected to a routine they already enjoy.",
    terms: ["useful", "cozy", "coffee", "kitchen", "home", "desk", "tea", "practical"],
    budgetMax: 60,
    faqs: [
      { question: "Should I still buy a gift if they said they want nothing?", answer: "If the occasion matters, choose something low-pressure and useful rather than grand or overly personal." },
      sharedFaqs.budget,
      sharedFaqs.finder
    ]
  },
  {
    slug: "panic-gifts",
    title: "Panic Gifts You Can Still Feel Good About",
    description: "Fast, low-risk gifts for when you need a decent idea quickly.",
    eyebrow: "Panic mode",
    intro: "Panic gifts should be easy to buy, broadly useful, and unlikely to miss. Skip sizing, fragile taste, and anything that needs too much explanation.",
    terms: ["gift", "quick", "desk", "coffee", "kitchen", "home", "useful", "last minute"],
    budgetMax: 50,
    faqs: [
      { question: "What makes a good last-minute gift?", answer: "A good last-minute gift is simple, useful, and easy for the recipient to understand immediately." },
      sharedFaqs.avoid,
      sharedFaqs.finder
    ]
  },
  {
    slug: "birthday-gifts-by-personality",
    title: "Birthday Gift Ideas by Personality",
    description: "Birthday gift ideas matched to practical, cozy, curious, and playful personalities.",
    eyebrow: "Birthday gifts",
    intro: "A birthday gift feels better when it reflects how the person spends their time, not just their age or relationship to you.",
    terms: ["birthday", "gift", "unique", "home", "coffee", "kitchen", "travel", "fun"],
    budgetMax: 75,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "thank-you-gifts",
    title: "Thank You Gifts That Feel Personal",
    description: "Thoughtful thank you gifts for hosts, coworkers, teachers, neighbors, and helpful friends.",
    eyebrow: "Thank you gifts",
    intro: "A thank you gift should feel warm but not overwhelming. Choose something that acknowledges the gesture without creating awkward pressure.",
    terms: ["thank", "host", "teacher", "coworker", "mug", "coffee", "home", "desk"],
    budgetMax: 45,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "holiday-gifts-for-acquaintances",
    title: "Holiday Gifts for People You Do Not Know That Well",
    description: "Safe holiday gift ideas for acquaintances, neighbors, hosts, and casual work friends.",
    eyebrow: "Holiday gifts",
    intro: "For acquaintances, the sweet spot is festive, useful, and not too personal. Avoid anything that assumes private taste.",
    terms: ["holiday", "christmas", "gift", "mug", "coffee", "home", "desk", "host"],
    budgetMax: 40,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "small-gifts-stocking-stuffers",
    title: "Best Small Gifts and Stocking Stuffers",
    description: "Small gift ideas that work for stockings, gift bags, office swaps, and add-ons.",
    eyebrow: "Small gifts",
    intro: "Small gifts work best when they are genuinely useful or charming enough to stand alone, not just filler.",
    terms: ["small", "stocking", "mug", "coffee", "desk", "travel", "kitchen", "cute"],
    budgetMax: 30,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "premium-gifts-under-100",
    title: "Premium Gifts Under $100",
    description: "Polished gift ideas under $100 for birthdays, holidays, hosts, and close friends.",
    eyebrow: "Under $100",
    intro: "Under $100 is enough room for a gift that feels substantial while still staying practical and easy to justify.",
    terms: ["premium", "gift", "kitchen", "speaker", "coffee", "home", "travel", "tech"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-tech-curious-people",
    title: "Gifts for Tech-Curious People",
    description: "Tech-adjacent gift ideas that are useful, approachable, and not overly complicated.",
    eyebrow: "Tech gifts",
    intro: "Tech-curious people often appreciate useful devices and clever upgrades, but the best picks should be easy to set up and enjoy.",
    terms: ["tech", "speaker", "charger", "desk", "gadget", "smart", "wireless", "travel"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-book-lovers",
    title: "Best Gifts for Book Lovers",
    description: "Gift ideas for readers that go beyond guessing which book they want next.",
    eyebrow: "Book lover gifts",
    intro: "For readers, avoid guessing their next book unless you know their taste. Reading accessories and cozy rituals are safer.",
    terms: ["book", "reading", "lamp", "cozy", "tea", "mug", "blanket", "home"],
    budgetMax: 60,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-tea-lovers",
    title: "Best Gifts for Tea Lovers",
    description: "Calm, cozy, and useful gifts for people who love tea rituals.",
    eyebrow: "Tea gifts",
    intro: "Tea gifts should support a slower ritual: warm mugs, simple tools, cozy home items, and gentle upgrades.",
    terms: ["tea", "mug", "kettle", "infuser", "cozy", "home", "warmer", "kitchen"],
    budgetMax: 60,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-home-office",
    title: "Best Gifts for a Home Office",
    description: "Desk and home office gifts for people who work, study, or create at home.",
    eyebrow: "Desk gifts",
    intro: "Home office gifts should improve focus, comfort, or desk organization without taking over their workspace.",
    terms: ["desk", "office", "home office", "organizer", "lamp", "coffee", "keyboard", "work"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-hosts",
    title: "Best Host Gifts That Feel Thoughtful",
    description: "Host gift ideas for dinners, holidays, housewarmings, and casual gatherings.",
    eyebrow: "Host gifts",
    intro: "A host gift should be easy to receive and useful later. Serving pieces, kitchen helpers, and cozy home items often work well.",
    terms: ["host", "serving", "kitchen", "home", "board", "wine", "dinner", "party"],
    budgetMax: 75,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "housewarming-gifts",
    title: "Best Housewarming Gifts",
    description: "Practical and cozy housewarming gifts for new apartments, homes, and first places.",
    eyebrow: "Housewarming",
    intro: "Housewarming gifts should help the new place feel more useful, calm, or lived-in without assuming too much about decor taste.",
    terms: ["housewarming", "home", "kitchen", "cozy", "organizer", "board", "candle", "decor"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-new-parents",
    title: "Useful Gifts for New Parents",
    description: "Low-pressure gift ideas for new parents who need comfort, convenience, and small wins.",
    eyebrow: "New parent gifts",
    intro: "New parent gifts should reduce friction or offer comfort. Avoid anything that adds clutter or requires too much effort.",
    terms: ["parent", "baby", "home", "coffee", "organizer", "blanket", "kitchen", "comfort"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-dads-who-have-everything",
    title: "Gifts for Dads Who Have Everything",
    description: "Practical, hobby-friendly gift ideas for dads with no obvious wishlist.",
    eyebrow: "Dad gifts",
    intro: "For dads who have everything, choose useful upgrades connected to routines: coffee, grilling, tools, travel, or relaxing at home.",
    terms: ["dad", "tool", "grill", "coffee", "outdoor", "travel", "kitchen", "home"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-moms-who-have-everything",
    title: "Gifts for Moms Who Have Everything",
    description: "Thoughtful and practical gift ideas for moms with specific taste.",
    eyebrow: "Mom gifts",
    intro: "For moms who have everything, the safest direction is a small upgrade to a ritual she already enjoys.",
    terms: ["mom", "kitchen", "coffee", "tea", "home", "cozy", "beauty", "cook"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-girlfriend",
    title: "Thoughtful Gifts for a Girlfriend",
    description: "Gift ideas for a girlfriend that feel personal without guessing too wildly.",
    eyebrow: "Girlfriend gifts",
    intro: "A good girlfriend gift should feel chosen, not random. Start with her routines, style, comfort, or hobbies.",
    terms: ["girlfriend", "cozy", "beauty", "mug", "home", "jewelry", "coffee", "unique"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-boyfriend",
    title: "Thoughtful Gifts for a Boyfriend",
    description: "Useful and personal gift ideas for a boyfriend across hobbies and routines.",
    eyebrow: "Boyfriend gifts",
    intro: "For a boyfriend, useful hobby-adjacent gifts often work better than novelty. Choose something connected to how he spends time.",
    terms: ["boyfriend", "tech", "coffee", "outdoor", "travel", "desk", "tool", "speaker"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-wife",
    title: "Thoughtful Gifts for a Wife",
    description: "Warm, useful, and personal gift ideas for a wife.",
    eyebrow: "Wife gifts",
    intro: "A gift for your wife should show attention to what makes her daily life easier, calmer, or more enjoyable.",
    terms: ["wife", "cozy", "home", "kitchen", "coffee", "beauty", "tea", "unique"],
    budgetMax: 120,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-husband",
    title: "Thoughtful Gifts for a Husband",
    description: "Useful and personality-aware gift ideas for a husband.",
    eyebrow: "Husband gifts",
    intro: "For a husband, practical gifts can still feel personal when they connect to a hobby, routine, or comfort upgrade.",
    terms: ["husband", "tech", "tool", "coffee", "outdoor", "travel", "speaker", "home"],
    budgetMax: 120,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-grandparents",
    title: "Best Gifts for Grandparents",
    description: "Comforting, useful, and easy-to-enjoy gift ideas for grandparents.",
    eyebrow: "Grandparent gifts",
    intro: "Grandparent gifts should be easy to use and emotionally warm. Practical comfort usually beats complicated novelty.",
    terms: ["grandma", "grandpa", "home", "cozy", "mug", "kitchen", "tea", "comfort"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-neighbors",
    title: "Best Gifts for Neighbors",
    description: "Friendly, low-pressure gift ideas for neighbors and casual community connections.",
    eyebrow: "Neighbor gifts",
    intro: "Neighbor gifts should be warm but not too personal. Small home, kitchen, or thank you gifts are usually the right lane.",
    terms: ["neighbor", "thank", "home", "kitchen", "mug", "coffee", "host", "holiday"],
    budgetMax: 35,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-teachers",
    title: "Best Gifts for Teachers",
    description: "Practical teacher gift ideas that are useful without being too personal.",
    eyebrow: "Teacher gifts",
    intro: "Teacher gifts should be useful, modest, and easy to enjoy. Desk items, coffee, and small practical comforts are safe choices.",
    terms: ["teacher", "desk", "office", "mug", "coffee", "planner", "pen", "thank"],
    budgetMax: 40,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-students",
    title: "Useful Gifts for Students",
    description: "Gift ideas for students who need focus, comfort, and everyday utility.",
    eyebrow: "Student gifts",
    intro: "Student gifts should help with studying, dorm life, commuting, or small routines that make a busy week easier.",
    terms: ["student", "desk", "study", "travel", "coffee", "organizer", "lamp", "tech"],
    budgetMax: 75,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-travelers",
    title: "Best Gifts for Travelers",
    description: "Travel gift ideas for packing, comfort, organization, and being away from home.",
    eyebrow: "Travel gifts",
    intro: "Travel gifts should save space, reduce friction, or make long days away from home more comfortable.",
    terms: ["travel", "portable", "bag", "organizer", "charger", "outdoor", "waterproof", "comfort"],
    budgetMax: 90,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-camping",
    title: "Best Camping Gifts",
    description: "Camping gift ideas for people who like practical outdoor gear and simple comforts.",
    eyebrow: "Camping gifts",
    intro: "Camping gifts work best when they are durable, compact, and useful around a campsite or trail.",
    terms: ["camping", "outdoor", "hiking", "headlamp", "waterproof", "portable", "travel", "light"],
    budgetMax: 90,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-gardeners",
    title: "Best Gifts for Gardeners",
    description: "Gardening gift ideas for people who like plants, tools, patios, and outdoor projects.",
    eyebrow: "Garden gifts",
    intro: "Gardener gifts should be practical but pleasant: tools, storage, comfort, or small upgrades for time outside.",
    terms: ["garden", "gardening", "plant", "outdoor", "tool", "glove", "patio", "yard"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-foodies",
    title: "Best Gifts for Foodies",
    description: "Foodie gift ideas for cooking, serving, tasting, and kitchen rituals.",
    eyebrow: "Foodie gifts",
    intro: "Foodie gifts should support tasting, cooking, hosting, or prep. Avoid gimmicks unless they clearly fit their style.",
    terms: ["foodie", "kitchen", "cook", "serving", "board", "chef", "baking", "coffee"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-bakers",
    title: "Best Gifts for Bakers",
    description: "Baking gift ideas for people who love dough, desserts, and kitchen precision.",
    eyebrow: "Baking gifts",
    intro: "Bakers often appreciate useful tools, storage, and small upgrades that make measuring, mixing, and serving easier.",
    terms: ["baking", "baker", "kitchen", "cake", "bread", "sourdough", "mixer", "cook"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "self-care-gifts",
    title: "Best Self-Care Gifts",
    description: "Self-care gift ideas for rest, comfort, routines, and small daily resets.",
    eyebrow: "Self-care gifts",
    intro: "Self-care gifts should make a real routine easier or calmer, not just sound relaxing in the product title.",
    terms: ["self care", "spa", "cozy", "home", "tea", "beauty", "comfort", "candle"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "white-elephant-gifts",
    title: "Best White Elephant Gifts",
    description: "White elephant gift ideas that are fun but still useful enough to keep.",
    eyebrow: "White elephant",
    intro: "The best white elephant gifts are funny or surprising without becoming instant clutter.",
    terms: ["funny", "white elephant", "mug", "game", "novelty", "office", "party", "gift"],
    budgetMax: 35,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "secret-santa-gifts",
    title: "Best Secret Santa Gifts",
    description: "Secret Santa gifts that are safe, useful, and easy to like.",
    eyebrow: "Secret Santa",
    intro: "Secret Santa gifts need broad appeal. Choose modest, practical items with a little personality.",
    terms: ["secret santa", "office", "coworker", "mug", "coffee", "desk", "holiday", "gift"],
    budgetMax: 35,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-remote-workers",
    title: "Best Gifts for Remote Workers",
    description: "Home desk gift ideas for remote workers who live on calls, coffee, and focus time.",
    eyebrow: "Remote work",
    intro: "Remote worker gifts should improve the desk, comfort, light, sound, or small rituals that shape the workday.",
    terms: ["remote", "desk", "office", "home office", "coffee", "lamp", "organizer", "speaker"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-creatives",
    title: "Best Gifts for Creative People",
    description: "Gift ideas for creative people who like making, sketching, arranging, or experimenting.",
    eyebrow: "Creative gifts",
    intro: "Creative gifts should support making or inspiration without assuming the exact tools they already use.",
    terms: ["creative", "art", "desk", "journal", "pen", "craft", "camera", "design"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-minimalists",
    title: "Best Gifts for Minimalists",
    description: "Gift ideas for minimalists that are useful, compact, and not clutter-heavy.",
    eyebrow: "Minimalist gifts",
    intro: "Minimalist gifts should earn their space. Choose useful, consumable, compact, or high-quality everyday items.",
    terms: ["minimalist", "useful", "home", "travel", "organizer", "kitchen", "desk", "practical"],
    budgetMax: 80,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-men-under-50",
    title: "Best Gifts for Men Under $50",
    description: "Useful gifts for men under $50 across coffee, tech, outdoor, desk, and home routines.",
    eyebrow: "Men under $50",
    intro: "Instead of choosing a generic men's gift, look for a practical item tied to how he spends time.",
    terms: ["men", "dad", "boyfriend", "tech", "coffee", "tool", "outdoor", "desk"],
    budgetMax: 50,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "gifts-for-women-under-50",
    title: "Best Gifts for Women Under $50",
    description: "Thoughtful gifts for women under $50 across cozy, beauty, kitchen, coffee, and home ideas.",
    eyebrow: "Women under $50",
    intro: "A good under-$50 gift for her should feel specific to a routine, interest, or comfort preference.",
    terms: ["women", "mom", "girlfriend", "beauty", "cozy", "coffee", "kitchen", "home"],
    budgetMax: 50,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "christmas-gifts-under-50",
    title: "Best Christmas Gifts Under $50",
    description: "Christmas gift ideas under $50 that are useful, cozy, and easy to buy.",
    eyebrow: "Christmas under $50",
    intro: "Christmas gifts under $50 should feel warm and specific without needing a huge budget.",
    terms: ["christmas", "holiday", "cozy", "coffee", "home", "kitchen", "desk", "gift"],
    budgetMax: 50,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "valentines-gifts",
    title: "Thoughtful Valentine's Day Gifts",
    description: "Valentine's Day gift ideas that are warm, personal, and not overly generic.",
    eyebrow: "Valentine gifts",
    intro: "A Valentine's gift should feel attentive. Choose something connected to comfort, shared routines, or a detail you know about them.",
    terms: ["valentine", "girlfriend", "wife", "cozy", "beauty", "mug", "coffee", "home"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "mothers-day-gifts",
    title: "Best Mother's Day Gifts",
    description: "Mother's Day gift ideas for moms who love cooking, coffee, cozy routines, beauty, and home comforts.",
    eyebrow: "Mother's Day",
    intro: "Mother's Day gifts should feel appreciative and personal. Start with the rituals that make her day feel better.",
    terms: ["mother", "mom", "kitchen", "coffee", "beauty", "cozy", "home", "tea"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "fathers-day-gifts",
    title: "Best Father's Day Gifts",
    description: "Father's Day gift ideas for dads who like practical tools, coffee, tech, grilling, travel, or the outdoors.",
    eyebrow: "Father's Day",
    intro: "Father's Day gifts are strongest when they upgrade something he already enjoys rather than trying to define a new hobby.",
    terms: ["father", "dad", "tool", "grill", "coffee", "outdoor", "tech", "travel"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  },
  {
    slug: "graduation-gifts",
    title: "Best Graduation Gifts",
    description: "Graduation gift ideas for students starting a new school, job, home, or routine.",
    eyebrow: "Graduation gifts",
    intro: "Graduation gifts should help with the next chapter: a new desk, commute, kitchen, dorm, or grown-up routine.",
    terms: ["graduation", "student", "desk", "travel", "kitchen", "coffee", "organizer", "tech"],
    budgetMax: 100,
    faqs: [sharedFaqs.budget, sharedFaqs.avoid, sharedFaqs.finder]
  }
];

export const guideBySlug = new Map(giftGuides.map((guide) => [guide.slug, guide]));
