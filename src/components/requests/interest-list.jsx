import Link from "next/link";
import { Fields } from "@/components/document";
import { InterestActions } from "@/components/requests/interest-actions";
import { StatusBadge } from "@/components/status-badge";
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
        return (
          <li key={interest._id} className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h3 className="text-[1.0625rem] font-semibold">{funder?.name ?? "A removed account"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Interested in{" "}
                  <Link href={`/plans/${interest.planId?._id}`} className={`font-medium ${link}`}>
                    {interest.planId?.title}
                  </Link>{" "}
                  · {formatDate(interest.createdAt)}
                </p>
              </div>
              <StatusBadge status={interest.status} />
            </div>

            {profile && (
              <Fields
                className="mt-5"
                items={[
                  { label: "Organisation", value: profile.organization },
                  { label: "Type of funder", value: labelOf(FUNDER_TYPES, profile.funderType) },
                  { label: "Invests", value: formatAedRange(profile.ticketMinAed, profile.ticketMaxAed) },
                  profile.sectors.length > 0 && { label: "Sectors", value: profile.sectors.map((s) => labelOf(SECTORS, s)).join(", ") },
                ]}
              />
            )}

            <p className="mt-5 max-w-prose whitespace-pre-line">{interest.message}</p>

            {interest.status === "accepted" && funder && (
              <Fields
                className="mt-5"
                items={[
                  {
                    label: "Email",
                    value: (
                      <a href={`mailto:${funder.email}`} className={`wrap-anywhere ${link}`}>
                        {funder.email}
                      </a>
                    ),
                  },
                ]}
              />
            )}

            {interest.status === "pending" && (
              <div className="mt-6">
                <InterestActions interestId={interest._id} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
