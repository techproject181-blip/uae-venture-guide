import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Chips } from "@/components/mentors/chips";
import { StatusBadge } from "@/components/status-badge";
import { EMIRATES, EXPERTISE, labelOf } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * A mentor in the directory, as a card for a CardGrid. The name links to the
 * profile and the link stretches over the whole card. `preview` drops the
 * link, for showing mentors how their own card looks.
 */
export function MentorCard({ mentor, preview = false, as: Heading = "h2" }) {
  const emirates = mentor.emirates.map((e) => labelOf(EMIRATES, e)).join(", ");
  return (
    <article className={cn("panel relative flex h-full flex-col p-5 sm:p-6", !preview && "panel-link group")}>
      <div className="flex-1">
        <div className="flex items-start gap-3.5">
          <Avatar name={mentor.name} className="size-12 text-sm" />
          <div className="min-w-0 flex-1">
            <Heading className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
              {preview ? (
                mentor.name
              ) : (
                <Link
                  href={`/mentors/${mentor.userId}`}
                  className="outline-none group-hover:text-primary after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                >
                  {mentor.name}
                </Link>
              )}
            </Heading>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{mentor.headline || "No headline yet"}</p>
          </div>
        </div>

        {mentor.expertise.length > 0 && (
          <Chips className="mt-4" label="Can help with" items={mentor.expertise.map((area) => labelOf(EXPERTISE, area))} max={3} />
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
        {emirates && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">Emirates: </span>
            <span className="truncate">{emirates}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Briefcase className="size-4 shrink-0" aria-hidden="true" />
          {mentor.yearsExperience} years
        </span>
        {!mentor.acceptingRequests && <StatusBadge status="info" label="Not taking requests" className="ml-auto" />}
      </div>
    </article>
  );
}
