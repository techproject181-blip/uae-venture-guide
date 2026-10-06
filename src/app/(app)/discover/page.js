import Link from "next/link";
import { InterestForm } from "@/components/funding/interest-form";
import { PitchCard } from "@/components/funding/pitch-card";
import { CardGrid } from "@/components/layout";
import { EmptyState, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { EMIRATES, SECTORS, valuesOf } from "@/lib/constants";
import { listPitchCards } from "@/lib/funding";
import { requireUser } from "@/lib/guards";
import { FunderProfile } from "@/models/FunderProfile";
import { FundingInterest } from "@/models/FundingInterest";

export const metadata = { title: "Discover" };

const selectClass =
  "h-11 w-full cursor-pointer rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const linkClass = "font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";

/** Funders browse shared plans as pitch cards and send interest requests. */
export default async function DiscoverPage({ searchParams }) {
  const user = await requireUser({ roles: ["funder"] });
  const params = await searchParams;
  const sector = valuesOf(SECTORS).includes(params.sector) ? params.sector : "";
  const emirate = valuesOf(EMIRATES).includes(params.emirate) ? params.emirate : "";

  const cards = toPlain(await listPitchCards({ sector, emirate }));
  const [sent, hasProfile] = await Promise.all([
    FundingInterest.find({ funderId: user.id, planId: { $in: cards.map((c) => c._id) } })
      .select("planId status")
      .lean(),
    FunderProfile.exists({ userId: user.id }),
  ]);
  const interestByPlan = new Map(sent.map((interest) => [String(interest.planId), interest]));
  const filtered = Boolean(sector || emirate);

  return (
    <>
      <PageHeader
        title="Discover"
        description="Plans that founders chose to share. You see a full plan only if its owner accepts your interest."
      />

      <form className="panel mb-6 grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem] md:items-end">
        <div className="space-y-2">
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
        <div className="space-y-2">
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
        <Button type="submit" variant="outline" size="lg">
          Apply filters
        </Button>
      </form>

      {/* Owners decide on interest from the funder's profile, so one is needed first. */}
      {!hasProfile && (
        <p role="status" className="panel mb-6 p-4 text-sm sm:p-5">
          You need a funder profile before you can send interest.{" "}
          <Link href="/profile" className={linkClass}>
            Set up your profile
          </Link>
        </p>
      )}

      {cards.length === 0 ? (
        <EmptyState
          title={filtered ? "No plans match" : "No shared plans yet"}
          text={filtered ? "Try another sector or emirate." : "Plans appear here when founders share them."}
          action={
            filtered && (
              <Link href="/discover" className={linkClass}>
                Clear the filters
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <p role="status">
              {cards.length} {cards.length === 1 ? "plan" : "plans"}
            </p>
            {filtered && (
              <Link href="/discover" className={linkClass}>
                Clear the filters
              </Link>
            )}
          </div>
          <CardGrid cols={2} className="grid-cols-1 [&>li>article]:h-full">
            {cards.map((card) => {
              const interest = interestByPlan.get(String(card._id));
              const status = interest?.status;
              return (
                <li key={card._id}>
                  <PitchCard card={card}>
                    {status ? (
                      <div className="space-y-3">
                        <p className="flex flex-wrap items-center gap-3 text-sm">
                          Your interest
                          <StatusBadge status={status} />
                        </p>
                        {status === "accepted" && (
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                            <Link href={`/plans/${card._id}`} className={linkClass}>
                              Read the full plan
                            </Link>
                            <Link href={`/interests/${interest._id}`} className={linkClass}>
                              Message the owner
                            </Link>
                          </div>
                        )}
                        {status === "declined" && (
                          <p className="text-sm text-muted-foreground">The owner declined. You cannot send interest in this plan again.</p>
                        )}
                      </div>
                    ) : (
                      <InterestForm planId={card._id} />
                    )}
                  </PitchCard>
                </li>
              );
            })}
          </CardGrid>
        </>
      )}
    </>
  );
}
