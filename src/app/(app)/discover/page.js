import Link from "next/link";
import { InterestForm } from "@/components/funding/interest-form";
import { PitchCard } from "@/components/funding/pitch-card";
import { EmptyState, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { EMIRATES, SECTORS, valuesOf } from "@/lib/constants";
import { listPitchCards } from "@/lib/funding";
import { requireUser } from "@/lib/guards";
import { FundingInterest } from "@/models/FundingInterest";

export const metadata = { title: "Discover" };

const selectClass =
  "h-11 w-full cursor-pointer rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Funders browse shared plans as pitch cards and send interest requests. */
export default async function DiscoverPage({ searchParams }) {
  const user = await requireUser({ roles: ["funder"] });
  const params = await searchParams;
  const sector = valuesOf(SECTORS).includes(params.sector) ? params.sector : "";
  const emirate = valuesOf(EMIRATES).includes(params.emirate) ? params.emirate : "";

  const cards = toPlain(await listPitchCards({ sector, emirate }));
  const sent = await FundingInterest.find({ funderId: user.id, planId: { $in: cards.map((c) => c._id) } }).select("planId status").lean();
  const statusByPlan = new Map(sent.map((interest) => [String(interest.planId), interest.status]));
  const filtered = Boolean(sector || emirate);

  return (
    <>
      <PageHeader title="Discover" description="Plans that founders chose to share. You see a full plan only if its owner accepts your interest." />

      <form className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2 sm:w-64">
          <label className="block text-sm font-medium" htmlFor="sector">
            Sector
          </label>
          <select id="sector" name="sector" defaultValue={sector} className={selectClass}>
            <option value="">Any sector</option>
            {SECTORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:w-64">
          <label className="block text-sm font-medium" htmlFor="emirate">
            Emirate
          </label>
          <select id="emirate" name="emirate" defaultValue={emirate} className={selectClass}>
            <option value="">Any emirate</option>
            {EMIRATES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-5">
          <Button type="submit" variant="outline" size="lg">
            Filter
          </Button>
          {filtered && (
            <Link href="/discover" className="inline-flex min-h-11 items-center font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
              Clear the filters
            </Link>
          )}
        </div>
      </form>

      {cards.length === 0 ? (
        <EmptyState
          title={filtered ? "No plans match" : "No shared plans yet"}
          text={filtered ? "Try another sector or emirate." : "Plans appear here when founders share them."}
        />
      ) : (
        <div className="divide-y border-y">
          {cards.map((card) => {
            const status = statusByPlan.get(card._id);
            return (
              <PitchCard key={card._id} card={card} framed={false}>
                {status ? (
                  <p className="flex flex-wrap items-center gap-3 text-sm">
                    Your interest
                    <StatusBadge status={status} />
                  </p>
                ) : (
                  <InterestForm planId={card._id} />
                )}
              </PitchCard>
            );
          })}
        </div>
      )}
    </>
  );
}
