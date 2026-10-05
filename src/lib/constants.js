// The allowed values for choice fields, with the labels users see.
// Shared by forms, pages, API checks and database models.

export const EMIRATES = [
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "dubai", label: "Dubai" },
  { value: "sharjah", label: "Sharjah" },
  { value: "ajman", label: "Ajman" },
  { value: "umm_al_quwain", label: "Umm Al Quwain" },
  { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
  { value: "fujairah", label: "Fujairah" },
];

export const JURISDICTIONS = [
  { value: "mainland", label: "Mainland" },
  { value: "free_zone", label: "Free zone" },
];

// The intake form also allows "not sure", so the roadmap can recommend one.
export const JURISDICTION_PREFERENCES = [...JURISDICTIONS, { value: "unsure", label: "Not sure yet" }];

export const SECTORS = [
  { value: "technology", label: "Technology and software" },
  { value: "ecommerce", label: "Online shop" },
  { value: "food_beverage", label: "Food and drink" },
  { value: "retail", label: "Retail shop" },
  { value: "consulting", label: "Consulting and services" },
  { value: "education", label: "Education and training" },
  { value: "health_wellness", label: "Health and wellness" },
  { value: "creative_media", label: "Creative and media" },
  { value: "tourism_events", label: "Tourism and events" },
  { value: "logistics", label: "Logistics and transport" },
  { value: "other", label: "Other" },
];

export const BUDGET_CATEGORIES = [
  { value: "licensing", label: "Licensing" },
  { value: "visa", label: "Visas" },
  { value: "office", label: "Office" },
  { value: "equipment", label: "Equipment" },
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "staff", label: "Staff" },
  { value: "legal", label: "Legal" },
  { value: "other", label: "Other" },
];

export const RECURRENCES = [
  { value: "one_time", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export const TASK_STATUSES = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const SOURCE_CATEGORIES = [
  { value: "licensing", label: "Licensing" },
  { value: "visas", label: "Visas" },
  { value: "tax", label: "Tax" },
  { value: "banking", label: "Banking" },
  { value: "free_zones", label: "Free zones" },
  { value: "funding", label: "Funding" },
  { value: "legal", label: "Legal" },
  { value: "general", label: "General" },
];

// What a fee reference is for. The roadmap looks fees up by kind, emirate and jurisdiction.
export const FEE_KINDS = [
  { value: "trade_name", label: "Trade name reservation" },
  { value: "initial_approval", label: "Initial approval" },
  { value: "trade_licence", label: "Trade licence" },
  { value: "office", label: "Office or flexi desk" },
  { value: "establishment_card", label: "Establishment card" },
  { value: "investor_visa", label: "Investor residence visa" },
  { value: "emirates_id", label: "Emirates ID" },
  { value: "medical_test", label: "Visa medical test" },
  { value: "tax_registration", label: "Tax registration" },
  { value: "bank_account", label: "Business bank account" },
  { value: "other", label: "Other" },
];

// Areas a mentor can help with, used for the profile and the directory filter.
export const EXPERTISE = [
  { value: "business_setup", label: "Business setup and licensing" },
  { value: "marketing_sales", label: "Marketing and sales" },
  { value: "finance_funding", label: "Finance and fundraising" },
  { value: "technology_product", label: "Technology and product" },
  { value: "operations", label: "Operations and supply chain" },
  { value: "legal_compliance", label: "Legal and compliance" },
  { value: "hospitality_food", label: "Hospitality and food" },
  { value: "retail_ecommerce", label: "Retail and online selling" },
];

export const FUNDER_TYPES = [
  { value: "angel", label: "Angel investor" },
  { value: "vc", label: "Venture capital" },
  { value: "government", label: "Government programme" },
  { value: "accelerator", label: "Accelerator" },
  { value: "corporate", label: "Corporate" },
  { value: "other", label: "Other" },
];

export const ROLE_LABELS = {
  entrepreneur: "Entrepreneur",
  mentor: "Mentor",
  funder: "Funder",
  admin: "Administrator",
};

/** Just the values of a list, for enums in Zod and Mongoose. */
export const valuesOf = (list) => list.map((item) => item.value);

/** The label for a value, or the value itself when it is not in the list. */
export const labelOf = (list, value) => list.find((item) => item.value === value)?.label ?? value;
