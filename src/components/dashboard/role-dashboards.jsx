import { Compass, HandCoins, Inbox, Landmark, Newspaper, Plus, UserRound, Users } from "lucide-react";
import { AcceptingSwitch } from "@/components/dashboard/accepting-switch";
import { Greeting, NextStep, Row, Shortcuts, TextLink, count, rowLink } from "@/components/dashboard/dashboard-bits";
import { ListPanel, Panel, Split, Stat, StatGrid } from "@/components/layout";
import { EmptyState } from "@/components/page-header";
import { Cost, ProgressBar } from "@/components/plans/plan-bits";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { OffLink } from "@/components/off-link";
import { toPlain } from "@/lib/api";
import { progressPercent } from "@/lib/budget";
import { EMIRATES, SECTORS, labelOf } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { listInterestsForFunder, listInterestsForOwner, listPitchCards } from "@/lib/funding";
import { FunderProfile } from "@/models/FunderProfile";
import { MentorProfile } from "@/models/MentorProfile";
import { MentorRequest } from "@/models/MentorRequest";
import { Plan } from "@/models/Plan";
import { Post } from "@/models/Post";

// The submission build stops at the dashboard (lib/limited-mode.js), so every
// link on it is drawn but switched off. Turn the flag off for real links.
const Link = OffLink;

// One dashboard per role, all on the same skeleton: the greeting with the
// role's main button, four numbers that link to their lists, then the role's
// main list on the left and the next step, shortcuts and notices on the right.
// Each loads only what it shows.

// A link inside a sentence is underlined, so colour is not the only sign of it.
const inlineLink = "font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2";

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
  const steps = plans.flatMap((plan) => plan.tasks ?? []);
  const stepsDone = steps.filter((task) => task.status === "done").length;

  return (
    <>
      <Greeting
        user={user}
        description={
          latest
            ? `Pick up where you left off on ${latest.title}.`
            : "Describe your business idea to get a step-by-step roadmap with official costs."
        }
        actions={
          <Link href="/plans/new" className={buttonVariants({ size: "lg" })}>
            <Plus aria-hidden="true" />
            New plan
          </Link>
        }
      />

      <StatGrid className="mb-6 lg:mb-8">
        <Stat label="Plans" value={plans.length} href="/plans" />
        <Stat label="Steps done" value={`${stepsDone} / ${steps.length}`} href={latest ? `/plans/${latest._id}/tasks` : "/plans"} />
        <Stat label="Guidance requests" value={requests} href="/requests" />
        <Stat label="Funder interest" value={newInterest} href="/requests" />
      </StatGrid>

      <Split
        aside={
          <>
            {nextTask && (
              <NextStep title={nextTask.title} href={`/plans/${latest._id}/tasks`} linkText="See all steps">
                <span>{latest.title}</span>
                <span aria-hidden="true">·</span>
                <Cost min={nextTask.costMinAed} max={nextTask.costMaxAed} basis={nextTask.costBasis} />
              </NextStep>
            )}
            <Shortcuts
              items={[
                { href: "/mentors", label: "Find a mentor", detail: "Ask someone who has done it before", icon: Users },
                { href: "/requests", label: "Requests", detail: "Guidance requests and funder interest", icon: Inbox },
                { href: "/sources", label: "Official sources", detail: "The pages behind the official costs", icon: Landmark },
              ]}
            />
          </>
        }
      >
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
          <ListPanel title="Your plans" actions={plans.length > 5 && <TextLink href="/plans">All plans</TextLink>}>
            {toPlain(plans.slice(0, 5)).map((plan) => (
              <Row key={plan._id} link className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link href={`/plans/${plan._id}`} className={rowLink}>
                      {plan.title}
                    </Link>
                    {plan.status !== "ready" && <StatusBadge status={plan.status} />}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {labelOf(SECTORS, plan.sector)} · {labelOf(EMIRATES, plan.emirate)} · changed {formatDate(plan.updatedAt)}
                  </p>
                </div>
                <div className="sm:w-56 sm:shrink-0">
                  <ProgressBar percent={progressPercent(plan.tasks ?? [])} />
                </div>
              </Row>
            ))}
          </ListPanel>
        )}
      </Split>
    </>
  );
}

export async function MentorDashboard({ user }) {
  await connectDB();
  const [profile, pending, accepted, completed, posts, postCount] = await Promise.all([
    MentorProfile.findOne({ userId: user.id }).select("acceptingRequests").lean(),
    MentorRequest.find({ mentorId: user.id, status: "pending" }).sort({ createdAt: -1 }).populate("entrepreneurId", "name").lean(),
    MentorRequest.countDocuments({ mentorId: user.id, status: "accepted" }),
    MentorRequest.countDocuments({ mentorId: user.id, status: "completed" }),
    Post.find({ authorId: user.id }).sort({ createdAt: -1 }).limit(3).lean(),
    Post.countDocuments({ authorId: user.id }),
  ]);

  return (
    <>
      <Greeting
        user={user}
        description={
          accepted > 0 ? `You are guiding ${count(accepted, "founder")} now.` : "Founders who need your help ask for guidance here."
        }
        actions={
          <Link href="/my-posts/new" className={buttonVariants({ size: "lg" })}>
            <Plus aria-hidden="true" />
            Write a post
          </Link>
        }
      />

      <StatGrid className="mb-6 lg:mb-8">
        <Stat label="Waiting for you" value={pending.length} href="/requests" />
        <Stat label="Guiding now" value={accepted} href="/requests" />
        <Stat label="Completed" value={completed} href="/requests" />
        <Stat label="Posts" value={postCount} href="/my-posts" />
      </StatGrid>

      <Split
        aside={
          <>
            {profile && <AcceptingSwitch initial={profile.acceptingRequests} />}
            {!profile && (
              <NextStep title="Complete your profile" href="/profile" linkText="Edit profile">
                Founders find you in the mentor directory through your profile.
              </NextStep>
            )}
            <Shortcuts
              items={[
                { href: "/requests", label: "Requests", detail: "Answer and talk with founders", icon: Inbox },
                { href: "/my-posts", label: "Your posts", detail: count(postCount, "post"), icon: Newspaper },
                { href: "/profile", label: "Your profile", detail: "What founders see in the directory", icon: UserRound },
              ]}
            />
          </>
        }
      >
        {pending.length === 0 ? (
          <Panel title="Requests waiting for you" actions={<TextLink href="/requests">All requests</TextLink>}>
            <p className="text-muted-foreground">No requests are waiting. New ones are emailed to you.</p>
          </Panel>
        ) : (
          <ListPanel title="Requests waiting for you" actions={<TextLink href="/requests">All requests</TextLink>}>
            {toPlain(pending.slice(0, 5)).map((request) => (
              <Row key={request._id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <p className="font-medium">{request.topic}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    From {request.entrepreneurId?.name ?? "a removed account"} · {formatDate(request.createdAt)}
                  </p>
                </div>
                <StatusBadge status="pending" label="Waiting" />
              </Row>
            ))}
          </ListPanel>
        )}

        {posts.length === 0 ? (
          <Panel title="Your posts">
            <p className="text-muted-foreground">
              No posts yet. Share a lesson from your own journey.{" "}
              <Link href="/my-posts/new" className={inlineLink}>
                Write a post
              </Link>
            </p>
          </Panel>
        ) : (
          <ListPanel
            title="Your posts"
            description={`You have written ${count(postCount, "post")}.`}
            actions={<TextLink href="/my-posts">All posts</TextLink>}
          >
            {toPlain(posts).map((post) => (
              <Row key={post._id} link className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <Link href={`/posts/${post._id}`} className={rowLink}>
                  {post.title}
                </Link>
                <span className="text-sm text-muted-foreground tabular-nums">{formatDate(post.createdAt)}</span>
              </Row>
            ))}
          </ListPanel>
        )}
      </Split>
    </>
  );
}

export async function FunderDashboard({ user }) {
  await connectDB();
  const [profile, cards, interests, sharedCount] = await Promise.all([
    FunderProfile.exists({ userId: user.id }),
    listPitchCards(),
    listInterestsForFunder(user.id),
    // Counted apart, because listPitchCards stops at 60 cards.
    Plan.countDocuments({ shared: true, hiddenByAdmin: { $ne: true }, status: "ready" }),
  ]);
  const accepted = interests.filter((interest) => interest.status === "accepted").length;
  const waiting = interests.filter((interest) => interest.status === "pending").length;

  return (
    <>
      <Greeting
        user={user}
        description={`${count(sharedCount, "shared plan")} to explore.`}
        actions={
          <Link href="/discover" className={buttonVariants({ size: "lg" })}>
            Discover plans
          </Link>
        }
      />

      <StatGrid className="mb-6 lg:mb-8">
        <Stat label="Shared plans" value={sharedCount} href="/discover" />
        <Stat label="Interests sent" value={interests.length} href="/interests" />
        <Stat label="Accepted" value={accepted} href="/interests" />
        <Stat label="Waiting for reply" value={waiting} href="/interests" />
      </StatGrid>

      <Split
        aside={
          <>
            {!profile && (
              <NextStep title="Complete your profile" href="/profile" linkText="Edit profile">
                Owners read it when you send interest in their plan.
              </NextStep>
            )}
            <Shortcuts
              items={[
                { href: "/discover", label: "Discover plans", detail: "Pitch cards of shared plans", icon: Compass },
                { href: "/interests", label: "Your interests", detail: count(interests.length, "interest") + " sent", icon: HandCoins },
                { href: "/profile", label: "Your profile", detail: "What owners read about you", icon: UserRound },
              ]}
            />
          </>
        }
      >
        {interests.length === 0 ? (
          <Panel title="Your interests">
            <p className="text-muted-foreground">
              You have not asked about a plan yet. Tell an owner from their pitch card when a plan interests you.
            </p>
          </Panel>
        ) : (
          <ListPanel title="Your interests" actions={<TextLink href="/interests">All interests</TextLink>}>
            {toPlain(interests.slice(0, 5)).map((interest) => {
              const plan = interest.planId;
              const open = interest.status === "accepted" && plan?.shared && !plan?.hiddenByAdmin;
              return (
                <Row key={interest._id} link={open} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
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
                </Row>
              );
            })}
          </ListPanel>
        )}

        {cards.length > 0 && (
          <ListPanel title="Newest shared plans" actions={<TextLink href="/discover">All shared plans</TextLink>}>
            {toPlain(cards.slice(0, 3)).map((card) => (
              <Row key={card._id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
                <div className="min-w-0">
                  <p className="font-medium">{card.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {labelOf(SECTORS, card.sector)} · {labelOf(EMIRATES, card.emirate)}
                  </p>
                </div>
                <div className="sm:w-56 sm:shrink-0">
                  <ProgressBar percent={card.progress} />
                </div>
              </Row>
            ))}
          </ListPanel>
        )}
      </Split>
    </>
  );
}
