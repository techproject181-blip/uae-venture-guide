import { Fields } from "@/components/document";
import { Panel } from "@/components/layout";
import { MentorCard } from "@/components/mentors/mentor-card";
import { FUNDER_TYPES, SECTORS, labelOf } from "@/lib/constants";
import { formatAedRange } from "@/lib/format";

const WHO_SEES = {
  mentor: [
    "The administrator reads it before approving your account.",
    "Once you are approved, anyone can find you in the mentor directory, signed in or not.",
    "Entrepreneurs read it before they ask you for guidance.",
  ],
  funder: [
    "The administrator reads it before approving your account.",
    "When you tell an owner a plan interests you, they see your name, organisation, type of funder, investment range and sectors.",
    "Your email address is shared with an owner only after they accept your interest.",
  ],
};

/** The aside of the profile page: who sees the profile, and how it looks to them as last saved. */
export function ProfileAside({ role, name, profile }) {
  const isMentor = role === "mentor";
  return (
    <>
      <Panel title="Who sees this">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {WHO_SEES[role].map((line) => (
            <li key={line} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {line}
            </li>
          ))}
        </ul>
      </Panel>

      <section aria-labelledby="profile-preview" className="space-y-3">
        <div>
          <h2 id="profile-preview" className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em]">
            Preview
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isMentor ? "Your card in the mentor directory" : "What a plan owner sees about you"}, as last saved.
          </p>
        </div>
        {!profile ? (
          <p className="rounded-xl border border-dashed border-ink-300 bg-card/70 px-5 py-8 text-center text-sm text-muted-foreground">
            Save your profile to see the preview.
          </p>
        ) : isMentor ? (
          <MentorCard mentor={{ ...profile, name }} preview as="h3" />
        ) : (
          <div className="panel p-5 sm:p-6">
            <h3 className="font-semibold">{name}</h3>
            <Fields
              className="mt-4"
              items={[
                { label: "Organisation", value: profile.organization },
                { label: "Type of funder", value: labelOf(FUNDER_TYPES, profile.funderType) },
                { label: "Invests", value: formatAedRange(profile.ticketMinAed, profile.ticketMaxAed) },
                profile.sectors?.length > 0 && { label: "Sectors", value: profile.sectors.map((s) => labelOf(SECTORS, s)).join(", ") },
              ]}
            />
          </div>
        )}
      </section>
    </>
  );
}
