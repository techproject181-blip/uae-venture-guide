// Fills a database with a small set of starting data: a few accounts for each
// role, official sources and fee references, mentor and funder profiles, two
// plans made by the planner, two experience posts, two guidance requests (one
// with a saved founder–mentor conversation) and funder interest.
// It also removes anything the browser tests left behind (@e2e.test accounts)
// and old demo accounts that are no longer in the list below.
// Safe to run again: accounts, sources and fees are updated in place, and the
// demo accounts' plans, posts and requests are recreated.
// Usage: npm run seed
//
// The sources are real official websites, but the summaries and every fee
// amount are demo values marked "demo". An administrator must check each one
// against the official page before real users rely on it.
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db.js";
import { generateRoadmap } from "../src/lib/roadmap/generate.js";
import { ChatMessage } from "../src/models/ChatMessage.js";
import { FeeReference } from "../src/models/FeeReference.js";
import { FunderProfile } from "../src/models/FunderProfile.js";
import { FundingInterest } from "../src/models/FundingInterest.js";
import { InterestMessage } from "../src/models/InterestMessage.js";
import { MentorProfile } from "../src/models/MentorProfile.js";
import { MentorRequest } from "../src/models/MentorRequest.js";
import { Plan } from "../src/models/Plan.js";
import { Post } from "../src/models/Post.js";
import { RequestMessage } from "../src/models/RequestMessage.js";
import { Source } from "../src/models/Source.js";
import { User } from "../src/models/User.js";

const DEMO_PASSWORD = "Demo2026pass";

// Every account has the published password above, and one is an
// administrator. Seed only the project's own database, never a live site
// with real users.
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const USERS = [
  { name: "Sara Al Mansoori", email: "admin@demo.test", role: "admin", status: "active" },
  { name: "Aisha Khan", email: "aisha@demo.test", role: "entrepreneur", status: "active" },
  { name: "Yousef Al Hammadi", email: "yousef@demo.test", role: "entrepreneur", status: "active" },
  { name: "Omar Saeed", email: "omar@demo.test", role: "mentor", status: "active" },
  { name: "Fatima Al Nuaimi", email: "fatima@demo.test", role: "mentor", status: "active" },
  { name: "Daniel Okafor", email: "daniel@demo.test", role: "mentor", status: "active" },
  { name: "Rahul Mehta", email: "rahul@demo.test", role: "mentor", status: "pending" },
  { name: "Layla Haddad", email: "layla@demo.test", role: "funder", status: "active" },
  { name: "Khalid Rahman", email: "khalid@demo.test", role: "funder", status: "pending" },
];

// key: a short name used below to attach fee references.
const SOURCES = [
  {
    key: "uae",
    title: "Start a business in the UAE",
    publisher: "UAE Government portal (u.ae)",
    url: "https://u.ae/en/information-and-services/business",
    emirate: null,
    categories: ["licensing", "general"],
    summary:
      "The steps to set up a company in the UAE, the difference between mainland and free zones, and links to each emirate's licensing authority.",
  },
  {
    key: "fta",
    title: "Corporate tax and VAT registration",
    publisher: "Federal Tax Authority",
    url: "https://tax.gov.ae",
    emirate: null,
    categories: ["tax"],
    summary: "Who must register for corporate tax and VAT, the deadlines, and how to register online through EmaraTax.",
  },
  {
    key: "icp",
    title: "Residence visas and Emirates ID",
    publisher: "Federal Authority for Identity, Citizenship, Customs and Port Security",
    url: "https://icp.gov.ae",
    emirate: null,
    categories: ["visas"],
    summary: "Applying for the establishment card, residence visas and the Emirates ID card.",
  },
  {
    key: "mohre",
    title: "Work permits and labour rules",
    publisher: "Ministry of Human Resources and Emiratisation",
    url: "https://www.mohre.gov.ae",
    emirate: null,
    categories: ["visas", "legal"],
    summary: "Work permits and labour rules for companies registered on the mainland.",
  },
  {
    key: "cbuae",
    title: "Banking in the UAE",
    publisher: "Central Bank of the UAE",
    url: "https://www.centralbank.ae",
    emirate: null,
    categories: ["banking"],
    summary: "Banking rules in the UAE and the licensed banks where a company can open an account.",
  },
  {
    key: "det",
    title: "Business licences in Dubai",
    publisher: "Dubai Department of Economy and Tourism",
    url: "https://www.dubaidet.gov.ae",
    emirate: "dubai",
    categories: ["licensing"],
    summary: "Trade name reservation, initial approval and trade licences for Dubai mainland companies.",
  },
  {
    key: "added",
    title: "Business licences in Abu Dhabi",
    publisher: "Abu Dhabi Department of Economic Development",
    url: "https://www.added.gov.ae",
    emirate: "abu_dhabi",
    categories: ["licensing"],
    summary: "Economic licences for Abu Dhabi mainland companies, including low-cost licences for small businesses.",
  },
  {
    key: "sedd",
    title: "Business licences in Sharjah",
    publisher: "Sharjah Economic Development Department",
    url: "https://www.sedd.ae",
    emirate: "sharjah",
    categories: ["licensing"],
    summary: "Trade, professional and industrial licences for Sharjah mainland companies.",
  },
  {
    key: "dmcc",
    title: "DMCC free zone company setup",
    publisher: "Dubai Multi Commodities Centre",
    url: "https://www.dmcc.ae",
    emirate: "dubai",
    categories: ["free_zones", "licensing"],
    summary: "Company setup packages, licence types and flexi desks in the DMCC free zone.",
  },
  {
    key: "shams",
    title: "Shams free zone company setup",
    publisher: "Sharjah Media City (Shams)",
    url: "https://www.shams.ae",
    emirate: "sharjah",
    categories: ["free_zones", "licensing"],
    summary: "Licence packages for media, creative and service businesses in the Shams free zone.",
  },
  {
    key: "rakez",
    title: "RAKEZ company setup",
    publisher: "Ras Al Khaimah Economic Zone",
    url: "https://rakez.com",
    emirate: "ras_al_khaimah",
    categories: ["free_zones", "licensing"],
    summary: "Free zone licences and startup packages in Ras Al Khaimah.",
  },
  {
    key: "khalifa",
    title: "Support for Emirati entrepreneurs",
    publisher: "Khalifa Fund for Enterprise Development",
    url: "https://www.khalifafund.ae",
    emirate: "abu_dhabi",
    categories: ["funding"],
    summary: "Funding programmes, training and advice for UAE national entrepreneurs.",
  },
  {
    key: "dubaisme",
    title: "Dubai SME support programmes",
    publisher: "Dubai SME",
    url: "https://sme.ae",
    emirate: "dubai",
    categories: ["funding"],
    summary: "Support, training and incentives for small and medium businesses in Dubai.",
  },
];

// source: the key of the source above. All amounts are demo values.
const FEES = [
  {
    source: "det",
    kind: "trade_name",
    item: "Trade name reservation",
    emirate: "dubai",
    jurisdiction: "mainland",
    min: 620,
    max: 620,
    recurrence: "one_time",
  },
  {
    source: "det",
    kind: "initial_approval",
    item: "Initial approval",
    emirate: "dubai",
    jurisdiction: "mainland",
    min: 120,
    max: 120,
    recurrence: "one_time",
  },
  {
    source: "det",
    kind: "trade_licence",
    item: "Trade licence, commercial or professional",
    emirate: "dubai",
    jurisdiction: "mainland",
    min: 12000,
    max: 18000,
    recurrence: "yearly",
  },
  {
    source: "added",
    kind: "trade_name",
    item: "Trade name reservation",
    emirate: "abu_dhabi",
    jurisdiction: "mainland",
    min: 200,
    max: 200,
    recurrence: "one_time",
  },
  {
    source: "added",
    kind: "trade_licence",
    item: "Economic licence for a small business",
    emirate: "abu_dhabi",
    jurisdiction: "mainland",
    min: 1000,
    max: 10000,
    recurrence: "yearly",
  },
  {
    source: "sedd",
    kind: "trade_name",
    item: "Trade name reservation",
    emirate: "sharjah",
    jurisdiction: "mainland",
    min: 200,
    max: 300,
    recurrence: "one_time",
  },
  {
    source: "sedd",
    kind: "trade_licence",
    item: "Trade or professional licence",
    emirate: "sharjah",
    jurisdiction: "mainland",
    min: 5000,
    max: 15000,
    recurrence: "yearly",
  },
  {
    source: "dmcc",
    kind: "trade_licence",
    item: "Licence with flexi desk package",
    emirate: "dubai",
    jurisdiction: "free_zone",
    min: 30000,
    max: 50000,
    recurrence: "yearly",
  },
  {
    source: "shams",
    kind: "trade_licence",
    item: "Media or service licence package",
    emirate: "sharjah",
    jurisdiction: "free_zone",
    min: 5750,
    max: 15000,
    recurrence: "yearly",
  },
  {
    source: "rakez",
    kind: "trade_licence",
    item: "Startup licence package",
    emirate: "ras_al_khaimah",
    jurisdiction: "free_zone",
    min: 6000,
    max: 15000,
    recurrence: "yearly",
  },
  {
    source: "icp",
    kind: "establishment_card",
    item: "Establishment card",
    emirate: null,
    jurisdiction: "any",
    min: 1000,
    max: 2000,
    recurrence: "one_time",
  },
  {
    source: "icp",
    kind: "investor_visa",
    item: "Investor residence visa, two years",
    emirate: null,
    jurisdiction: "any",
    min: 3500,
    max: 6000,
    recurrence: "one_time",
  },
  {
    source: "icp",
    kind: "emirates_id",
    item: "Emirates ID, two years",
    emirate: null,
    jurisdiction: "any",
    min: 370,
    max: 370,
    recurrence: "one_time",
  },
  {
    source: "icp",
    kind: "medical_test",
    item: "Visa medical fitness test",
    emirate: null,
    jurisdiction: "any",
    min: 260,
    max: 700,
    recurrence: "one_time",
  },
  {
    source: "fta",
    kind: "tax_registration",
    item: "Corporate tax registration",
    emirate: null,
    jurisdiction: "any",
    min: 0,
    max: 0,
    recurrence: "one_time",
  },
];

await connectDB();
// Build every index first (unique emails, text search, one waiting request per pair, and so on).
await Promise.all(
  [
    User,
    Source,
    FeeReference,
    MentorProfile,
    FunderProfile,
    Plan,
    Post,
    MentorRequest,
    RequestMessage,
    FundingInterest,
    InterestMessage,
    ChatMessage,
  ].map((model) => model.init()),
);
const now = new Date();

/** Deletes these accounts and everything they made or were part of. */
async function removeAccounts(userIds) {
  if (userIds.length === 0) return;
  const planIds = await Plan.find({ ownerId: { $in: userIds } }).distinct("_id");
  const requestIds = await MentorRequest.find({ $or: [{ entrepreneurId: { $in: userIds } }, { mentorId: { $in: userIds } }] }).distinct(
    "_id",
  );
  await Promise.all([
    RequestMessage.deleteMany({ requestId: { $in: requestIds } }),
    MentorRequest.deleteMany({ _id: { $in: requestIds } }),
    ChatMessage.deleteMany({ planId: { $in: planIds } }),
    InterestMessage.deleteMany({ authorId: { $in: userIds } }),
    FundingInterest.deleteMany({ $or: [{ planId: { $in: planIds } }, { funderId: { $in: userIds } }] }),
    Plan.deleteMany({ _id: { $in: planIds } }),
    Post.deleteMany({ authorId: { $in: userIds } }),
    MentorProfile.deleteMany({ userId: { $in: userIds } }),
    FunderProfile.deleteMany({ userId: { $in: userIds } }),
    User.deleteMany({ _id: { $in: userIds } }),
  ]);
}

// Browser test accounts, and demo accounts dropped from the list above.
const keep = USERS.map((user) => user.email);
const leftovers = await User.find({ $or: [{ email: /@e2e\.test$/ }, { email: { $regex: /@demo\.test$/, $nin: keep } }] }).distinct("_id");
await removeAccounts(leftovers);

const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
for (const user of USERS) {
  await User.updateOne({ email: user.email }, { $set: { ...user, passwordHash } }, { upsert: true });
}

const sourceIds = {};
for (const { key, ...source } of SOURCES) {
  const saved = await Source.findOneAndUpdate(
    { url: source.url },
    { $set: { ...source, verifiedAt: now, active: true, demo: true } },
    { upsert: true, returnDocument: "after" },
  );
  sourceIds[key] = saved._id;
}

for (const fee of FEES) {
  const sourceId = sourceIds[fee.source];
  await FeeReference.updateOne(
    { sourceId, kind: fee.kind, item: fee.item },
    {
      $set: {
        sourceId,
        kind: fee.kind,
        item: fee.item,
        emirate: fee.emirate,
        jurisdiction: fee.jurisdiction,
        amountMinAed: fee.min,
        amountMaxAed: fee.max,
        recurrence: fee.recurrence,
        notes: "Demo amount for testing. Check the official page before relying on it.",
        verifiedAt: now,
        active: true,
        demo: true,
      },
    },
    { upsert: true },
  );
}

// ---------------------------------------------------------------- community

const ids = Object.fromEntries((await User.find({ email: /@demo\.test$/ }).lean()).map((u) => [u.email.split("@")[0], u._id]));

const MENTORS = {
  omar: {
    headline: "Founder of two cafés in Dubai",
    bio: "I opened two specialty cafés in Dubai and have helped friends set up food businesses in Dubai and Sharjah. Happy to talk about locations, fit-out and food safety.",
    expertise: ["hospitality_food", "business_setup"],
    industries: ["food_beverage", "retail"],
    emirates: ["dubai", "sharjah"],
    yearsExperience: 9,
  },
  fatima: {
    headline: "Marketing lead for UAE startups",
    bio: "Ten years of marketing for retail and online brands across the UAE. I help founders find their first customers without spending too much.",
    expertise: ["marketing_sales", "retail_ecommerce"],
    industries: ["ecommerce", "retail", "creative_media"],
    emirates: ["abu_dhabi", "dubai"],
    yearsExperience: 10,
  },
  daniel: {
    headline: "Software engineer and product advisor",
    bio: "I build software products and help student founders turn app ideas into a first version that users can try.",
    expertise: ["technology_product", "finance_funding"],
    industries: ["technology", "education"],
    emirates: ["dubai", "sharjah", "ajman"],
    yearsExperience: 7,
  },
  rahul: {
    headline: "Logistics manager",
    bio: "Twelve years running warehouses and deliveries in the UAE. I can help with supply chains, vehicles and delivery partners.",
    expertise: ["operations"],
    industries: ["logistics"],
    emirates: ["dubai", "ras_al_khaimah"],
    yearsExperience: 12,
  },
};
for (const [name, profile] of Object.entries(MENTORS)) {
  await MentorProfile.updateOne(
    { userId: ids[name] },
    { $set: { ...profile, userId: ids[name], acceptingRequests: true } },
    { upsert: true },
  );
}

const FUNDERS = {
  layla: {
    organization: "Gulf Student Ventures",
    funderType: "angel",
    ticketMinAed: 25000,
    ticketMaxAed: 150000,
    sectors: ["food_beverage", "education", "technology"],
    bio: "I back student founders with small first cheques and stay close as a mentor.",
  },
  khalid: {
    organization: "Khalid Rahman",
    funderType: "angel",
    ticketMinAed: 10000,
    ticketMaxAed: 50000,
    sectors: ["tourism_events", "creative_media"],
    bio: "Former tour operator investing in small tourism and events businesses.",
  },
};
for (const [name, profile] of Object.entries(FUNDERS)) {
  await FunderProfile.updateOne({ userId: ids[name] }, { $set: { ...profile, userId: ids[name] } }, { upsert: true });
}

// Start from a clean slate for the demo accounts' own content.
const demoPlans = await Plan.find({ ownerId: { $in: [ids.aisha, ids.yousef] } }).distinct("_id");
const demoRequests = await MentorRequest.find({ entrepreneurId: { $in: [ids.aisha, ids.yousef] } }).distinct("_id");
await Promise.all([
  RequestMessage.deleteMany({ requestId: { $in: demoRequests } }),
  Plan.deleteMany({ _id: { $in: demoPlans } }),
  ChatMessage.deleteMany({ planId: { $in: demoPlans } }),
  FundingInterest.deleteMany({ planId: { $in: demoPlans } }),
  InterestMessage.deleteMany({ authorId: { $in: [ids.aisha, ids.yousef, ids.layla, ids.khalid] } }),
  MentorRequest.deleteMany({ entrepreneurId: { $in: [ids.aisha, ids.yousef] } }),
  Post.deleteMany({ authorId: { $in: Object.keys(MENTORS).map((name) => ids[name]) } }),
]);

const PLANS = [
  {
    owner: "aisha",
    done: 4,
    paid: { "Trade name reservation": 250, "Initial approval": 300, "Office or shop rent": 30000 },
    pitch: "A karak tea café beside the university, open late for students to study. Low fit-out cost and steady daily customers.",
    intake: {
      title: "Karak café near campus",
      idea: "A small café beside the university serving karak tea, sandwiches and a quiet space to study in the evenings.",
      emirate: "sharjah",
      sector: "food_beverage",
      jurisdictionPref: "unsure",
      budgetAed: 120000,
      targetCustomers: "University students and office workers nearby",
      teamSize: 3,
    },
  },
  {
    owner: "yousef",
    done: 6,
    pitch:
      "Small-group desert and mountain tours from Ras Al Khaimah, booked online, for residents and visitors who want something quieter than the big tour buses.",
    intake: {
      title: "Mountain and desert tours",
      idea: "Small-group desert and mountain tours in Ras Al Khaimah, booked online, with local guides and photography stops.",
      emirate: "ras_al_khaimah",
      sector: "tourism_events",
      jurisdictionPref: "free_zone",
      budgetAed: 90000,
      targetCustomers: "UAE residents and tourists looking for small-group trips",
      teamSize: 2,
    },
  },
];
const plans = [];
// paid: what the founder already paid for some costs, so the "estimated and actual" chart has data.
for (const { owner, done, paid = {}, pitch, intake } of PLANS) {
  const roadmap = await generateRoadmap(intake);
  roadmap.tasks.forEach((task, i) => {
    if (i < done) Object.assign(task, { status: "done", completedAt: now });
  });
  for (const item of roadmap.budgetItems) {
    if (paid[item.label] !== undefined) item.actualAed = paid[item.label];
  }
  plans.push(
    await Plan.create({ ...intake, ...roadmap, ownerId: ids[owner], status: "ready", shared: Boolean(pitch), pitchSummary: pitch }),
  );
}

const POSTS = [
  {
    author: "omar",
    title: "What I learned opening my first café in Dubai",
    body: "## Start small\n\nMy first café had **eight seats**. Rent was the biggest cost, so I signed a short lease first and only moved to a bigger place after a year.\n\n## Before you sign\n\n- Read the food safety rules before you fit out the kitchen\n- Ask the landlord about the Ejari registration\n- Keep three months of costs in reserve\n\nMost of my mistakes cost money because I rushed. Take two extra weeks to check everything.",
    chart: {
      type: "bar",
      title: "My first-year costs (AED thousands)",
      labels: ["Rent", "Fit-out", "Licence", "Staff"],
      values: [60, 45, 15, 90],
    },
  },
  {
    author: "fatima",
    title: "Finding your first 100 customers on a small budget",
    body: "You do not need a big marketing budget to start. These worked for the founders I advise:\n\n1. Instagram posts that show the product being made\n2. A launch offer for friends and their friends\n3. Partnering with a café or gym that serves the same customers\n\nTrack which one brings customers, and spend more only on that one.",
    chart: {
      type: "pie",
      title: "Where my clients' first customers came from",
      labels: ["Instagram", "Friends", "Partners", "Walk-ins"],
      values: [45, 25, 20, 10],
    },
  },
  {
    author: "daniel",
    title: "Build the smallest app your users will try",
    body: "Most student app ideas I see try to do **ten things** at once. Pick the one task your users repeat every week and build only that.\n\n## A first version in six weeks\n\n- Week 1: talk to ten people who would use it\n- Weeks 2 to 5: build the one task, nothing else\n- Week 6: give it to those ten people and watch them use it\n\nA free zone licence can wait until someone is ready to pay.",
  },
];
for (const { author, ...post } of POSTS) {
  await Post.create({ ...post, authorId: ids[author], status: "published" });
}

const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000);
const [cafeRequest] = await MentorRequest.create([
  {
    entrepreneurId: ids.aisha,
    mentorId: ids.omar,
    planId: plans[0]._id,
    topic: "Choosing a location near campus",
    message: "I want to open a karak café near the university. Is mainland the right choice, and how big should the first place be?",
    status: "accepted",
    respondedAt: hoursAgo(50),
    createdAt: hoursAgo(72),
  },
  {
    entrepreneurId: ids.yousef,
    mentorId: ids.fatima,
    topic: "Marketing my tours online",
    message: "How should I market small-group tours online when I have almost no budget for ads?",
    status: "pending",
  },
]);
// The conversation Aisha and Omar had in the app after he accepted. His first
// message is the reply he wrote when accepting.
const CAFE_CHAT = [
  {
    author: "omar",
    hours: 50,
    body: "Happy to help. Mainland makes sense for a walk-in café, because your customers will come in from the street. Let us look at your budget together.",
  },
  {
    author: "aisha",
    hours: 46,
    body: "Thank you! I found two shops: one with 8 seats right by the main gate, and one with 20 seats a five-minute walk away. The bigger one is about AED 20,000 more a year.",
  },
  {
    author: "omar",
    hours: 30,
    body: "Take the small one by the gate. Students choose the closest place between classes, and you keep the AED 20,000 as reserve. Ask the landlord if the kitchen already passed a municipality inspection; it can save you weeks on the food safety approval.",
  },
  {
    author: "aisha",
    hours: 26,
    body: "That makes sense. I will ask about the inspection on Sunday and update the rent in my budget. Could you look at the fit-out costs after that?",
  },
];
await RequestMessage.insertMany(
  CAFE_CHAT.map(({ author, hours, body }) => ({
    requestId: cafeRequest._id,
    authorId: ids[author],
    body,
    createdAt: hoursAgo(hours),
    updatedAt: hoursAgo(hours),
  })),
);

const [cafeInterest] = await FundingInterest.create([
  {
    planId: plans[0]._id,
    funderId: ids.layla,
    message: "I back student food businesses and would like to learn more about your café.",
    status: "accepted",
    respondedAt: now,
  },
  {
    planId: plans[1]._id,
    funderId: ids.khalid,
    message: "I ran tours for ten years and like your idea. Can we talk about your first season?",
    status: "pending",
  },
]);

// The conversation Layla and Aisha had after Aisha accepted her interest.
const FUNDER_CHAT = [
  { author: "layla", hours: 20, body: "Thank you for sharing the plan. What would the first AED 60,000 go towards?" },
  {
    author: "aisha",
    hours: 18,
    body: "Mostly the fit-out and the first year's rent. The budget tab shows each item, and I keep the actual costs up to date.",
  },
  { author: "layla", hours: 6, body: "That is clear. Could we meet near campus next week to talk about a first cheque?" },
];
await InterestMessage.insertMany(
  FUNDER_CHAT.map(({ author, hours, body }) => ({
    interestId: cafeInterest._id,
    authorId: ids[author],
    body,
    createdAt: hoursAgo(hours),
    updatedAt: hoursAgo(hours),
  })),
);

await mongoose.disconnect();
console.log(
  `Demo data ready: ${USERS.length} accounts (password ${DEMO_PASSWORD}), ${SOURCES.length} sources, ${FEES.length} fee references, ` +
    `${PLANS.length} plans, ${POSTS.length} posts, 2 guidance requests (${CAFE_CHAT.length} chat messages) and 2 funder interests (${FUNDER_CHAT.length} chat messages).`,
);
