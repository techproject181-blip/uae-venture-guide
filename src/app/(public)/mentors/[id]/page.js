import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { BackLink } from "@/components/back-link";
import { Section } from "@/components/document";
import { RequestForm } from "@/components/mentors/request-form";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { getMentor } from "@/lib/community";
import { EMIRATES, EXPERTISE, SECTORS, labelOf } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { Plan } from "@/models/Plan";

export const metadata = { title: "Mentor" };

export default async function MentorPage({ params }) {
  const { id } = await params;
  const mentor = await getMentor(id);
  if (!mentor) notFound();

  const viewer = await getCurrentUser();
  const canAsk = viewer?.role === "entrepreneur" && viewer.status === "active";
  const plans = canAsk ? toPlain(await Plan.find({ ownerId: viewer.id }).select("title").sort({ updatedAt: -1 }).lean()) : [];

  // The profile as a short record, like the details on a licence.
  const details = [
    { label: "Can help with", value: mentor.expertise.map((a) => labelOf(EXPERTISE, a)).join(", ") },
    mentor.industries.length > 0 && { label: "Industries", value: mentor.industries.map((s) => labelOf(SECTORS, s)).join(", ") },
    { label: "Emirates", value: mentor.emirates.map((e) => labelOf(EMIRATES, e)).join(", ") },
    { label: "Experience", value: `${mentor.yearsExperience} years` },
  ].filter(Boolean);

  return (
    <div className="max-w-3xl">
      <BackLink href="/mentors">All mentors</BackLink>

      <div className="flex items-start gap-4 border-b pb-6">
        <Avatar name={mentor.name} className="size-14 text-lg" />
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">{mentor.name}</h1>
          <p className="mt-1 text-muted-foreground">{mentor.headline}</p>
        </div>
      </div>

      <p className="mt-6 max-w-[68ch] leading-relaxed whitespace-pre-line">{mentor.bio}</p>

      <dl className="mt-6 divide-y border-t">
        {details.map(({ label, value }) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
            <dt className="field-label sm:pt-0.5">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {mentor.linkedinUrl && (
        <a
          href={mentor.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2"
        >
          LinkedIn profile
          <ExternalLink className="size-4" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}

      <Section title="Ask for guidance" className="mt-10">
        {!mentor.acceptingRequests ? (
          <p className="text-muted-foreground">{mentor.name} is not taking new requests right now.</p>
        ) : canAsk ? (
          <div className="max-w-xl">
            <RequestForm mentorId={id} mentorName={mentor.name} plans={plans} />
          </div>
        ) : viewer ? (
          <p className="text-muted-foreground">Only entrepreneurs can send guidance requests.</p>
        ) : (
          <>
            <p className="text-muted-foreground">Create a free account to ask {mentor.name} for help with your plan.</p>
            <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "mt-4" })}>
              Create an account
            </Link>
          </>
        )}
      </Section>
    </div>
  );
}
