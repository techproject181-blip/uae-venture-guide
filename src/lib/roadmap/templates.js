// The building blocks the sample planner puts together into a startup roadmap.
// Amounts in `estimate` are rough ranges in dirhams, used only when no fee
// reference exists; the roadmap marks them "Estimate".

export const PHASES = [
  { key: "prepare", title: "Prepare", description: "Decide what the business does and where it is registered." },
  { key: "licence", title: "Licence and premises", description: "Get your trade licence and a place of business." },
  { key: "visas", title: "Visas and identity", description: "Get your residence visa and Emirates ID as the business owner." },
  { key: "finance", title: "Bank and tax", description: "Open a business bank account and register for tax." },
  { key: "launch", title: "Launch", description: "Get ready to serve your first customers." },
];

// only: "mainland" or "free_zone" limits a step to one jurisdiction.
// fee: the kind of fee reference to look up. authority: a key for authorityName().
// sourceCategory: what kind of official source to link when there is no fee.
export const STEPS = [
  {
    phase: "prepare",
    title: "Choose your business activity",
    description: "Pick the licence activity that matches what you sell. It decides the licence type and any extra approvals.",
    authority: "licensing",
    estimate: [0, 0],
    days: 2,
    sourceCategory: "licensing",
  },
  {
    phase: "prepare",
    only: "mainland",
    title: "Reserve your trade name",
    description: "Check that the name is free and reserve it with the licensing authority.",
    authority: "licensing",
    fee: "trade_name",
    estimate: [200, 1000],
    days: 1,
    budget: { category: "licensing", label: "Trade name reservation" },
  },
  {
    phase: "prepare",
    only: "mainland",
    title: "Get initial approval",
    description: "Apply for initial approval, which confirms there is no objection to you starting this business.",
    authority: "licensing",
    fee: "initial_approval",
    estimate: [100, 500],
    days: 3,
    budget: { category: "licensing", label: "Initial approval" },
  },
  {
    phase: "prepare",
    only: "free_zone",
    title: "Choose a free zone and a setup package",
    description: "Compare free zones that allow your activity. Most packages include the licence, a flexi desk and a visa allowance.",
    authority: "free_zone",
    estimate: [0, 0],
    days: 5,
    sourceCategory: "free_zones",
  },
  {
    phase: "licence",
    only: "mainland",
    title: "Rent a business location and register the lease",
    description: "A mainland licence needs a physical address. Register the tenancy contract with the emirate (Ejari in Dubai).",
    authority: "municipality",
    estimate: [15000, 40000],
    recurrence: "yearly",
    days: 10,
    budget: { category: "office", label: "Office or shop rent" },
  },
  {
    phase: "licence",
    title: "Pay for and collect your trade licence",
    description: "Submit the application with your documents and pay the licence fee. The licence is renewed every year.",
    authority: "licensing",
    fee: "trade_licence",
    estimate: { mainland: [10000, 20000], free_zone: [12000, 25000] },
    recurrence: "yearly",
    days: 7,
    budget: { category: "licensing", label: "Trade licence" },
  },
  {
    phase: "visas",
    title: "Get the establishment card",
    description: "The establishment card registers your company with immigration so it can sponsor visas.",
    authority: "immigration",
    fee: "establishment_card",
    estimate: [1000, 2000],
    days: 3,
    budget: { category: "visa", label: "Establishment card" },
  },
  {
    phase: "visas",
    title: "Apply for your investor residence visa",
    description: "As the owner, you can apply for a residence visa sponsored by your company.",
    authority: "immigration",
    fee: "investor_visa",
    estimate: [3500, 6000],
    days: 10,
    budget: { category: "visa", label: "Investor residence visa" },
  },
  {
    phase: "visas",
    title: "Pass the visa medical test",
    description: "A short medical fitness test is needed before the visa is issued.",
    authority: "health",
    fee: "medical_test",
    estimate: [300, 700],
    days: 2,
    budget: { category: "visa", label: "Visa medical test" },
  },
  {
    phase: "visas",
    title: "Get your Emirates ID",
    description: "Give your fingerprints and collect the Emirates ID card linked to your visa.",
    authority: "immigration",
    fee: "emirates_id",
    estimate: [300, 400],
    days: 7,
    budget: { category: "visa", label: "Emirates ID" },
  },
  {
    phase: "finance",
    title: "Open a business bank account",
    description: "Banks ask for your licence, company documents and a short business profile. Many require a minimum balance.",
    authority: "bank",
    estimate: [0, 3000],
    days: 14,
    sourceCategory: "banking",
    budget: { category: "other", label: "Bank account fees" },
  },
  {
    phase: "finance",
    title: "Register for corporate tax",
    description: "Every company must register with the Federal Tax Authority, even when no tax is due yet.",
    authority: "tax",
    fee: "tax_registration",
    estimate: [0, 0],
    days: 2,
    sourceCategory: "tax",
  },
  {
    phase: "finance",
    title: "Check whether you must register for VAT",
    description: "VAT registration is required once taxable sales pass AED 375,000 a year, and allowed from AED 187,500.",
    authority: "tax",
    estimate: [0, 0],
    days: 1,
    sourceCategory: "tax",
  },
  {
    phase: "launch",
    title: "Plan your launch marketing",
    description: "Decide how your first customers will find you: social media, a simple website or partnerships.",
    authority: "",
    estimate: [2000, 10000],
    days: 7,
    budget: { category: "marketing", label: "Launch marketing" },
  },
];

// One extra launch step for each sector.
export const SECTOR_STEPS = {
  technology: { title: "Build and test your first product version", description: "Release a small first version to a few users and collect feedback before spending more.", estimate: [5000, 30000], days: 30, budget: { category: "technology", label: "First product version" } },
  ecommerce: { title: "Set up your online shop and payments", description: "Choose a shop platform and a UAE payment provider, and plan your deliveries.", estimate: [2000, 8000], days: 14, budget: { category: "technology", label: "Online shop setup" } },
  food_beverage: { title: "Get food safety approval for your premises", description: "Food businesses need approval from the municipality's food safety department before opening.", authority: "municipality", estimate: [2000, 8000], days: 21, budget: { category: "legal", label: "Food safety approval" } },
  retail: { title: "Fit out your shop and order stock", description: "Plan the shop layout, signs and your first stock order.", estimate: [10000, 50000], days: 30, budget: { category: "equipment", label: "Shop fit-out and stock" } },
  consulting: { title: "Prepare your service packages and contracts", description: "Write clear service packages and a standard client contract.", estimate: [1000, 5000], days: 7, budget: { category: "legal", label: "Client contract template" } },
  education: { title: "Check whether your courses need education approval", description: "Some training activities need approval from the emirate's education authority.", authority: "education", estimate: [1000, 10000], days: 21, budget: { category: "legal", label: "Education approval" } },
  health_wellness: { title: "Get the health authority licence for your services", description: "Health and wellness services may need a facility or practitioner licence.", authority: "health", estimate: [3000, 15000], days: 30, budget: { category: "legal", label: "Health authority licence" } },
  creative_media: { title: "Check whether your work needs a media licence", description: "Publishing and some media activities need approval from the UAE Media Council.", authority: "media", estimate: [0, 5000], days: 14, budget: { category: "legal", label: "Media licence" } },
  tourism_events: { title: "Get the tourism or events permit you need", description: "Tour and event businesses often need a permit from the emirate's tourism department.", authority: "tourism", estimate: [1000, 10000], days: 21, budget: { category: "legal", label: "Tourism or events permit" } },
  logistics: { title: "Arrange vehicles, insurance and transport permits", description: "Plan your vehicles or delivery partners, insurance and any transport permits.", estimate: [5000, 40000], days: 21, budget: { category: "equipment", label: "Vehicles and insurance" } },
  other: { title: "Check whether your activity needs extra approvals", description: "Some activities need approval from another government body before the licence is issued.", estimate: [0, 5000], days: 14, budget: { category: "legal", label: "Extra approvals" } },
};

export const DOCUMENTS = [
  { name: "Passport copy", description: "A clear colour copy, valid for at least six more months.", required: true },
  { name: "Passport-size photo", description: "A recent photo with a white background.", required: true },
  { name: "Current visa or entry stamp", description: "Your UAE residence visa, or the entry stamp if you are visiting.", required: true },
  { name: "Emirates ID copy", description: "If you already live in the UAE.", required: false },
  { name: "No-objection letter from your employer", description: "If you work in the UAE and another company sponsors your visa.", required: false },
  { only: "mainland", name: "Registered tenancy contract", description: "The registered lease for your business location (Ejari in Dubai).", required: true },
  { only: "free_zone", name: "Free zone application form", description: "The free zone's own application form, filled in and signed.", required: true },
  { name: "Short business plan", description: "One or two pages on what you sell, to whom, and your first-year numbers. Banks and some free zones ask for it.", required: false },
];

// Sector-specific risks; other sectors get the general ones only.
export const SECTOR_RISKS = {
  food_beverage: { title: "Failing a food safety inspection", description: "An inspection can delay opening if the kitchen or storage does not meet the rules.", likelihood: "medium", impact: "high", mitigation: "Read the food safety rules before fitting out, and book a pre-opening inspection." },
  health_wellness: { title: "Missing a health authority approval", description: "Offering a service that needs a health licence without one can close the business.", likelihood: "medium", impact: "high", mitigation: "Confirm with the health authority which licences your services need before you start." },
  technology: { title: "The product takes longer to build than planned", description: "Software often takes longer and costs more than the first estimate.", likelihood: "high", impact: "medium", mitigation: "Launch a small first version, and add features only after users ask for them." },
  ecommerce: { title: "Delivery and returns cost more than expected", description: "Delivery fees and returns can eat most of the margin on small orders.", likelihood: "medium", impact: "medium", mitigation: "Compare delivery partners, and set a minimum order value or a delivery fee." },
  retail: { title: "Stock does not sell as fast as planned", description: "Unsold stock ties up cash that the business needs for rent and salaries.", likelihood: "medium", impact: "high", mitigation: "Start with a small order, and reorder only the items that sell." },
};

// The mainland licensing authority of each emirate.
export const LICENSING_AUTHORITIES = {
  abu_dhabi: "Abu Dhabi Department of Economic Development",
  dubai: "Dubai Department of Economy and Tourism",
  sharjah: "Sharjah Economic Development Department",
  ajman: "Ajman Department of Economic Development",
  umm_al_quwain: "Umm Al Quwain Department of Economic Development",
  ras_al_khaimah: "Ras Al Khaimah Department of Economic Development",
  fujairah: "Fujairah Department of Industry and Economy",
};
