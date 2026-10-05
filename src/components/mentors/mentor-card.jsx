import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EMIRATES, EXPERTISE, labelOf } from "@/lib/constants";

/**
 * A mentor in the directory, as one ruled row. The name links to the profile;
 * the link stretches over the whole row, so the row can be clicked anywhere.
 * List these in a `divide-y` list.
 */
export function MentorCard({ mentor }) {
  return (
    <article className="group relative flex gap-4 py-5">
      <Avatar name={mentor.name} className="size-11 text-sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-lg leading-snug">
            <Link
              href={`/mentors/${mentor.userId}`}
              className="outline-none group-hover:underline group-hover:underline-offset-4 after:absolute after:inset-0 after:rounded-md focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {mentor.name}
            </Link>
          </h2>
          {!mentor.acceptingRequests && <StatusBadge status="todo" label="Not taking requests" />}
        </div>
        <p className="text-muted-foreground">{mentor.headline}</p>
        <dl className="mt-3 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_auto] sm:gap-x-8">
          <div className="col-span-2 sm:col-span-1">
            <dt className="field-label">Can help with</dt>
            <dd className="mt-0.5">{mentor.expertise.map((area) => labelOf(EXPERTISE, area)).join(", ")}</dd>
          </div>
          <div>
            <dt className="field-label">Emirates</dt>
            <dd className="mt-0.5">{mentor.emirates.map((e) => labelOf(EMIRATES, e)).join(", ")}</dd>
          </div>
          <div>
            <dt className="field-label">Experience</dt>
            <dd className="mt-0.5 tabular-nums">{mentor.yearsExperience} years</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
