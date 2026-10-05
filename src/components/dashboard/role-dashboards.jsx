import Link from "next/link";
import { Plus } from "lucide-react";
import { Greeting, NextStep, TextLink, count } from "@/components/dashboard/dashboard-bits";
import { Section } from "@/components/document";
import { EmptyState } from "@/components/page-header";
import { Cost, ProgressBar } from "@/components/plans/plan-bits";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { progressPercent } from "@/lib/budget";
import { EMIRATES, SECTORS, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { listInterestsForFunder, listInterestsForOwner, listPitchCards } from "@/lib/funding";
import { FeeReference } from "@/models/FeeReference";
import { FunderProfile } from "@/models/FunderProfile";
import { MentorProfile } from "@/models/MentorProfile";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { Post } from "@/models/Post";
import { Source } from "@/models/Source";
import { User } from "@/models/User";

// One dashboard per role. Each loads only what it shows: a greeting, at most
// one "next step" band, and plain ruled lists. No tiles, no cards.

// A link inside a sentence is underlined, so colour is not the only sign of it.
const inlineLink = "font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";
// The title link of a list row. Its ::after covers the row (the <li> is `relative`), so the whole row is a large target.
const rowLink =
  "rounded-xs font-medium text-foreground decoration-primary underline-offset-4 outline-none after:absolute after:inset-0 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

export async function EntrepreneurDashboard({ user }) {
  await connectDB();
  const [plans, requests, interests] = await Promise.all([
    Plan.find({ ownerId: user.id }).sort({ updatedAt: -1 }).select("title emirate sector status tasks phases updatedAt").lean(),
    MentorRequest.countDocuments({ entrepreneurId: user.id, status: { $in: ["pending", "accepted"] } }),
    listInterestsForOwner(user.id),
  ]);
  const latest = toPlain(plans[0] ?? null);
  // The first unfinished step of the most recent plan, in roadmap order.
  const nextTask = latest?.phases
    .flatMap((phase) => latest.tasks.filter((task) => task.phaseId === phase._id))
    .find((task) => task.status !== "done");
  const newInterest = interests.filter((interest) => interest.status === "pending").length;

  // One short line under the greeting: what is waiting on the requests page.
  const summary = (requests > 0 || newInterest > 0) && (
    <>
      <Link href="/requests" className={inlineLink}>
        {count(requests, "open guidance request")}
      </Link>
      {" · "}
      <Link href="/requests" className={inlineLink}>
        {count(newInterest, "new funder interest", "new funder interests", "new funder interest")}
      </Link>
    </>
  );

  return (
    <>
      <Greeting user={user} description={summary || undefined} />

      {nextTask && (
        <NextStep title={`Next step: ${nextTask.title}`} href={`/plans/${latest._id}/tasks`} linkText="See all steps">
          <span>{latest.title}</span>
          <span aria-hidden="true">·</span>
          <Cost min={nextTask.costMinAed} max={nextTask.costMaxAed} basis={nextTask.costBasis} />
        </NextStep>
      )}

      {plans.length === 0 ? (
        <EmptyState
          title="Start your first plan"
          text="Describe your business idea and get a step-by-step roadmap with official costs."
          action={
            <Link href="/plans/new" className={buttonVariants({ size: "lg" })}>
              <Plus aria-hidden="true" />
              New plan
            </Link>
          }
        />
      ) : (
        <Section title="Your plans" actions={plans.length > 5 && <TextLink href="/plans">All plans</TextLink>}>
          <ul className="divide-y border-y">
            {toPlain(plans.slice(0, 5)).map((plan) => (
              <li key={plan._id} className="relative flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link href={`/plans/${plan._id}`} className={rowLink}>
                      {plan.title}
                    </Link>
                    {plan.status !== "ready" && <StatusBadge status={plan.status} />}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {labelOf(SECTORS, plan.sector)} · {labelOf(EMIRATES, plan.emirate)}
                  </p>
                </div>
                <div className="sm:w-56 sm:shrink-0">
                  <ProgressBar percent={progressPercent(plan.tasks ?? [])} />
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

export async function MentorDashboard({ user }) {
  await connectDB();
  const [profile, pending, accepted, posts, postCount] = await Promise.all([
    MentorProfile.exists({ userId: user.id }),
    MentorRequest.find({ mentorId: user.id, status: "pending" }).sort({ createdAt: -1 }).populate("entrepreneurId", "name").lean(),
    MentorRequest.countDocuments({ mentorId: user.id, status: "accepted" }),
    Post.find({ authorId: user.id }).sort({ createdAt: -1 }).limit(3).lean(),
    Post.countDocuments({ authorId: user.id }),
  ]);

  return (
    <>
      <Greeting user={user} />

      {!profile && (
        <NextStep title="Complete your profile" href="/profile" linkText="Edit profile">
          Founders find you in the mentor directory through your profile.
        </NextStep>
      )}

      <Section
        title="Requests waiting for you"
        description={accepted > 0 ? `You are guiding ${count(accepted, "founder")} now.` : undefined}
        actions={<TextLink href="/requests">All requests</TextLink>}
        >
        {pending.length === 0 ? (
          <p className="text-muted-foreground">No requests are waiting. New ones are emailed to you.</p>
        ) : (
          <ul className="divide-y border-y">
            {toPlain(pending.slice(0, 5)).map((request) => (
              <li key={request._id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{request.topic}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    From {request.entrepreneurId?.name ?? "a removed account"} · {formatDate(request.createdAt)}
                  </p>
                </div>
                <StatusBadge status="pending" label="Waiting" />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Your posts"
        description={postCount > 0 ? `You have written ${count(postCount, "post")}.` : undefined}
        actions={postCount > 0 && <TextLink href="/my-posts">All posts</TextLink>}
        // The request list above closes with its own rule, so this section needs space, not a second rule.
        className="mt-12"
      >
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts yet. Share a lesson from your own journey.{" "}
            <Link href="/my-posts/new" className={inlineLink}>
              Write a post
            </Link>
          </p>
        ) : (
          <ul className="divide-y border-y">
            {toPlain(posts).map((post) => (
              <li key={post._id} className="relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                <Link href={`/posts/${post._id}`} className={rowLink}>
                  {post.title}
                </Link>
                <span className="text-sm text-muted-foreground tabular-nums">{formatDate(post.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

export async function FunderDashboard({ user }) {
  await connectDB();
  const [profile, cards, interests] = await Promise.all([
    FunderProfile.exists({ userId: user.id }),
    listPitchCards(),
    listInterestsForFunder(user.id),
  ]);

  return (
    <>
      <Greeting
        user={user}
        description={`${count(cards.length, "shared plan")} to explore.`}
        actions={
          <Link href="/discover" className={buttonVariants({ size: "lg" })}>
            Discover plans
          </Link>
        }
      />

      {!profile && (
        <NextStep title="Complete your profile" href="/profile" linkText="Edit profile">
          Owners read it when you send interest in their plan.
        </NextStep>
      )}

      <Section
        title="Your interests"
        actions={interests.length > 0 && <TextLink href="/interests">All interests</TextLink>}
        >
        {interests.length === 0 ? (
          <p className="text-muted-foreground">You have not asked about a plan yet. Tell an owner from their pitch card when a plan interests you.</p>
        ) : (
          <ul className="divide-y border-y">
            {toPlain(interests.slice(0, 5)).map((interest) => {
              const plan = interest.planId;
              const open = interest.status === "accepted" && plan?.shared && !plan?.hiddenByAdmin;
              return (
                <li key={interest._id} className="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-4">
                  <div className="min-w-0">
                    {open ? (
                      <Link href={`/plans/${plan._id}`} className={rowLink}>
                        {plan.title}
                      </Link>
                    ) : (
                      <p className="font-medium">{plan?.title ?? "A deleted plan"}</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">Sent {formatDate(interest.createdAt)}</p>
                  </div>
                  <StatusBadge status={interest.status} />
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}

export async function AdminDashboard({ user }) {
  await connectDB();
  const [pending, users, plans, sources, demoSources, fees, posts] = await Promise.all([
    User.countDocuments({ status: "pending" }),
    User.countDocuments(),
    Plan.countDocuments(),
    Source.countDocuments({ active: true }),
    Source.countDocuments({ demo: true }),
    FeeReference.countDocuments({ active: true }),
    Post.countDocuments({ status: "published" }),
  ]);

  const pages = [
    { href: "/admin/users?status=all", label: "Users", detail: count(users, "account") },
    { href: "/admin/sources", label: "Sources", detail: `${count(sources, "official source")} shown · ${count(fees, "fee reference")} in use` },
    { href: "/admin/content", label: "Content", detail: `${count(posts, "published post")} · ${count(plans, "plan")}` },
    { href: "/admin/usage", label: "AI usage", detail: "Roadmaps and chat messages per day" },
  ];

  return (
    <>
      <Greeting user={user} />

      {pending > 0 ? (
        <NextStep
          title={`${count(pending, "account")} waiting for approval`}
          href="/admin/users?status=pending"
          linkText="Review accounts"
        />
      ) : (
        <p className="mb-8 text-muted-foreground">No accounts are waiting for approval.</p>
      )}

      {demoSources > 0 && (
        <p className="mb-10 rounded-lg border bg-card px-4 py-3 text-sm">
          <strong className="font-medium">{demoSources === 1 ? "1 source is" : `${demoSources} sources are`} demo data.</strong> Check each
          one against the official page, then untick “demo” before real users rely on it.{" "}
          <Link href="/admin/sources" className={inlineLink}>
            Review sources
          </Link>
        </p>
      )}

      <Section title="Admin pages" >
        <ul className="divide-y border-y">
          {pages.map(({ href, label, detail }) => (
            <li key={href} className="relative flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <Link href={href} className={rowLink}>
                {label}
              </Link>
              <span className="text-sm text-muted-foreground tabular-nums">{detail}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
