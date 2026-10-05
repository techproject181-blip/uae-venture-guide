import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ListPanel, PageHeader, Panel, Split } from "@/components/layout";
import { Chips } from "@/components/mentors/chips";
import { RequestForm } from "@/components/mentors/request-form";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { getMentor } from "@/lib/community";
import { EMIRATES, EXPERTISE, SECTORS, labelOf } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { Plan } from "@/models/Plan";
import { Post } from "@/models/Post";

export const metadata = { title: "Mentor" };

const STEPS = [
  "You send a short request: what you need help with, and one of your plans if you like.",
  "The mentor gets an email and accepts or declines it on their Requests page.",
  "Once accepted, you talk in a conversation saved here on the website. The mentor can read the plan you attached until the request is completed.",
];

export default async function MentorPage({ params }) {
  const { id } = await params;
  const mentor = await getMentor(id);
  if (!mentor) notFound();

  const viewer = await getCurrentUser();
  const canAsk = viewer?.role === "entrepreneur" && viewer.status === "active";
  const [plans, posts] = await Promise.all([
    canAsk ? Plan.find({ ownerId: viewer.id }).select("title").sort({ updatedAt: -1 }).lean() : [],
    Post.find({ authorId: id, status: "published" }).select("title createdAt").sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const firstName = mentor.name.split(" ")[0];

  return (
    <>
      <PageHeader
        back={{ href: "/mentors", label: "All mentors" }}
        title={mentor.name}
        description={mentor.headline}
        actions={
          mentor.linkedinUrl && (
            <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
              LinkedIn profile
              <ExternalLink aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )
        }
      >
        {mentor.acceptingRequests ? (
          <StatusBadge status="active" label="Taking requests" />
        ) : (
          <StatusBadge status="todo" label="Not taking requests" />
        )}
      </PageHeader>

      <Split
        aside={
          <>
            <Panel title="Details">
              <dl className="space-y-4">
                <div>
                  <dt className="field-label">Can help with</dt>
                  <dd className="mt-2">
                    <Chips items={mentor.expertise.map((a) => labelOf(EXPERTISE, a))} />
                  </dd>
                </div>
                {mentor.industries.length > 0 && (
                  <div>
                    <dt className="field-label">Industries</dt>
                    <dd className="mt-2">
                      <Chips items={mentor.industries.map((s) => labelOf(SECTORS, s))} />
                    </dd>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <dt className="field-label">Emirates</dt>
                    <dd className="mt-1 font-medium">{mentor.emirates.map((e) => labelOf(EMIRATES, e)).join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="field-label">Experience</dt>
                    <dd className="mt-1 font-medium tabular-nums">{mentor.yearsExperience} years</dd>
                  </div>
                </div>
              </dl>
            </Panel>

            <Panel title="Ask for guidance">
              {!mentor.acceptingRequests ? (
                <p className="text-muted-foreground">{mentor.name} is not taking new requests right now.</p>
              ) : canAsk ? (
                <RequestForm mentorId={id} mentorName={mentor.name} plans={toPlain(plans)} />
              ) : viewer ? (
                <p className="text-muted-foreground">Only entrepreneurs can send guidance requests.</p>
              ) : (
                <>
                  <p className="text-muted-foreground">Create a free account to ask {mentor.name} for help with your plan.</p>
                  <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "mt-4 w-full" })}>
                    Create an account
                  </Link>
                </>
              )}
            </Panel>
          </>
        }
      >
        <Panel title={`About ${firstName}`}>
          <div className="flex items-start gap-4">
            <Avatar name={mentor.name} className="hidden size-14 text-lg sm:flex" />
            <p className="max-w-[68ch] leading-relaxed whitespace-pre-line">{mentor.bio}</p>
          </div>
        </Panel>

        <Panel title="How guidance works">
          <ol className="space-y-4">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground tabular-nums"
                >
                  {index + 1}
                </span>
                <p className="pt-0.5 text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </Panel>

        {posts.length > 0 && (
          <ListPanel
            title={`Posts by ${firstName}`}
            actions={
              <Link href="/posts" className="text-sm font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
                All posts
              </Link>
            }
          >
            {toPlain(posts).map((post) => (
              <li key={post._id} className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4 hover:bg-slate-50/70 sm:px-6">
                <Link
                  href={`/posts/${post._id}`}
                  className="font-medium outline-none after:absolute after:inset-0 hover:text-primary focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
                >
                  {post.title}
                </Link>
                <span className="text-sm text-muted-foreground tabular-nums">{formatDate(post.createdAt)}</span>
              </li>
            ))}
          </ListPanel>
        )}
      </Split>
    </>
  );
}
