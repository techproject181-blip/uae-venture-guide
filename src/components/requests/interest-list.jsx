import Link from "next/link";
import { InterestActions } from "@/components/requests/interest-actions";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { FUNDER_TYPES, SECTORS, labelOf } from "@/lib/constants";
import { formatAedRange, formatDate } from "@/lib/format";

const link = "text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";

/** Funding interest in the owner's plans, with the funder's profile and accept/decline buttons. Rows for a flush panel. */
export function InterestList({ interests }) {
  return (
    <ul className="divide-y">
      {interests.map((interest) => {
        const funder = interest.funderId;
        const profile = interest.funderProfile;
        // The funder's facts read as one quiet line, so the row stays scannable.
        const facts = [
          profile?.organization,
          profile && labelOf(FUNDER_TYPES, profile.funderType),
          profile && formatAedRange(profile.ticketMinAed, profile.ticketMaxAed),
          profile?.sectors.length > 0 && profile.sectors.map((s) => labelOf(SECTORS, s)).join(", "),
        ].filter(Boolean);

        return (
          <li key={interest._id} className="px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <h3 className="text-base font-semibold">{funder?.name ?? "A removed account"}</h3>
                  <StatusBadge status={interest.status} />
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Interested in{" "}
                  {interest.planId ? (
                    <Link href={`/plans/${interest.planId._id}`} className={`font-medium ${link}`}>
                      {interest.planId.title}
                    </Link>
                  ) : (
                    "a deleted plan"
                  )}{" "}
                  · {formatDate(interest.createdAt)}
                </p>

                {facts.length > 0 && <p className="mt-1 text-sm text-muted-foreground">{facts.join(" · ")}</p>}

                <p className="mt-2 max-w-prose text-sm whitespace-pre-line text-foreground/80">{interest.message}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                {interest.status === "accepted" && funder && (
                  <Link href={`/interests/${interest._id}`} className={buttonVariants({ variant: "outline" })}>
                    Message {funder.name.split(" ")[0]}
                  </Link>
                )}
                {interest.status === "pending" && <InterestActions interestId={interest._id} />}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
