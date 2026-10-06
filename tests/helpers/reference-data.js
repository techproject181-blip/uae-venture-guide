import { FeeReference } from "@/models/FeeReference";
import { Source } from "@/models/Source";

const verifiedAt = new Date("2026-09-01");

/**
 * A few official sources and fee references, enough to check which ones the
 * planner and the chat assistant pick. Returns them by short name.
 */
export async function addReferenceData() {
  const [det, added, dmcc, icp, inactive] = await Source.create([
    {
      title: "Business licences in Dubai",
      publisher: "Dubai Department of Economy and Tourism",
      url: "https://www.dubaidet.gov.ae",
      emirate: "dubai",
      categories: ["licensing"],
      summary: "Trade name reservation, initial approval and trade licences for Dubai mainland companies.",
      verifiedAt,
    },
    {
      title: "Business licences in Abu Dhabi",
      publisher: "Abu Dhabi Department of Economic Development",
      url: "https://www.added.gov.ae",
      emirate: "abu_dhabi",
      categories: ["licensing"],
      summary: "Trade licences and fees for Abu Dhabi mainland companies.",
      verifiedAt,
    },
    {
      title: "DMCC free zone company setup",
      publisher: "Dubai Multi Commodities Centre",
      url: "https://www.dmcc.ae",
      emirate: "dubai",
      categories: ["free_zones", "licensing"],
      summary: "Company setup packages and licence fees in the DMCC free zone.",
      verifiedAt,
    },
    {
      title: "Residence visas and Emirates ID",
      publisher: "Federal Authority for Identity, Citizenship, Customs and Port Security",
      url: "https://icp.gov.ae",
      emirate: null,
      categories: ["visas"],
      summary: "Applying for the establishment card, residence visas and the Emirates ID card.",
      verifiedAt,
    },
    {
      title: "Old Dubai licence fee list",
      publisher: "Dubai Department of Economy and Tourism",
      url: "https://www.dubaidet.gov.ae/old",
      emirate: "dubai",
      categories: ["licensing"],
      summary: "An outdated list of trade licence fees and costs.",
      verifiedAt,
      active: false,
    },
  ]);

  const fee = (source, kind, emirate, jurisdiction, amount, extra = {}) => ({
    sourceId: source._id,
    kind,
    item: kind,
    emirate,
    jurisdiction,
    amountMinAed: amount,
    amountMaxAed: amount,
    recurrence: "one_time",
    verifiedAt,
    ...extra,
  });
  const [dubaiTradeName, abuDhabiTradeName, dubaiLicence, dmccLicence, emiratesId, inactiveApproval] = await FeeReference.create([
    fee(det, "trade_name", "dubai", "mainland", 620),
    fee(added, "trade_name", "abu_dhabi", "mainland", 300),
    fee(det, "trade_licence", "dubai", "mainland", 15000, { recurrence: "yearly" }),
    fee(dmcc, "trade_licence", "dubai", "free_zone", 20000, { recurrence: "yearly" }),
    fee(icp, "emirates_id", null, "any", 370),
    fee(det, "initial_approval", "dubai", "mainland", 999, { active: false }),
  ]);

  return {
    sources: { det, added, dmcc, icp, inactive },
    fees: { dubaiTradeName, abuDhabiTradeName, dubaiLicence, dmccLicence, emiratesId, inactiveApproval },
  };
}

/** Intake answers for a plan; pass fields to change. */
export function intake(fields = {}) {
  return {
    title: "Karak café",
    idea: "A small café serving karak tea and sandwiches to students in the evenings.",
    emirate: "dubai",
    sector: "food_beverage",
    jurisdictionPref: "unsure",
    budgetAed: 150000,
    targetCustomers: "University students",
    teamSize: 1,
    ...fields,
  };
}
