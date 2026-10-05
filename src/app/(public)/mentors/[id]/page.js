import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { BackLink, ListPanel, Panel, Split } from '@/components/layout'
import { Chips } from '@/components/mentors/chips'
import { RequestForm } from '@/components/mentors/request-form'
import { StatusBadge } from '@/components/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { toPlain } from '@/lib/api'
import { getMentor } from '@/lib/community'
import { EMIRATES, EXPERTISE, SECTORS, labelOf } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { getCurrentUser } from '@/lib/session'
import { Plan } from '@/models/Plan'
import { Post } from '@/models/Post'

export const metadata = { title: 'Mentor' }

const STEPS = [
  'You send a short request: what you need help with, and one of your plans if you like.',
  'The mentor gets an email and accepts or declines it.',
  'Once accepted, you talk in a conversation saved here on the website. The mentor can read the plan you attached until the request is completed.',
]

export default async function MentorPage({ params }) {
  const { id } = await params
  const mentor = await getMentor(id)
  if (!mentor) notFound()

  const viewer = await getCurrentUser()
  const canAsk = viewer?.role === 'entrepreneur' && viewer.status === 'active'
  const [plans, posts] = await Promise.all([
    canAsk ? Plan.find({ ownerId: viewer.id }).select('title').sort({ updatedAt: -1 }).lean() : [],
    Post.find({ authorId: id, status: 'published' }).select('title createdAt').sort({ createdAt: -1 }).limit(5).lean(),
  ])

  const firstName = mentor.name.split(' ')[0]

  const facts = [
    { label: 'Can help with', value: <Chips items={mentor.expertise.map((a) => labelOf(EXPERTISE, a))} /> },
    mentor.industries.length > 0 && { label: 'Industries', value: <Chips items={mentor.industries.map((s) => labelOf(SECTORS, s))} /> },
    { label: 'Emirates', value: <span className="font-medium">{mentor.emirates.map((e) => labelOf(EMIRATES, e)).join(', ')}</span> },
    { label: 'Experience', value: <span className="font-medium tabular-nums">{mentor.yearsExperience} years</span> },
  ].filter(Boolean)

  return (
    <>
      <BackLink href="/mentors">All mentors</BackLink>

      {/* Profile: who they are, and the facts at a glance. */}
      <section aria-labelledby="mentor-name" className="panel mb-6 overflow-hidden lg:mb-8">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6 lg:p-8">
          <Avatar name={mentor.name} className="size-16 shrink-0 text-xl sm:size-20 sm:text-2xl" />
          <div className="min-w-0 flex-1">
            <h1 id="mentor-name" className="font-display text-[1.875rem] leading-[1.15] font-bold tracking-[-0.03em] sm:text-[2.25rem]">
              {mentor.name}
            </h1>
            {mentor.headline && <p className="mt-1.5 text-muted-foreground">{mentor.headline}</p>}
            <div className="mt-3">
              {mentor.acceptingRequests ? (
                <StatusBadge status="active" label="Taking requests" />
              ) : (
                <StatusBadge status="todo" label="Not taking requests" />
              )}
            </div>
          </div>
          {mentor.linkedinUrl && (
            <a
              href={mentor.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'self-start sm:self-center' })}
            >
              LinkedIn profile
              <ExternalLink aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
        <dl className="grid gap-x-6 gap-y-5 border-t bg-ink-50/70 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4 lg:px-8">
          {facts.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="field-label">{label}</dt>
              <dd className="mt-2">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Split
        aside={
          <Panel
            title="Ask for guidance"
            description={mentor.acceptingRequests && canAsk ? `${mentor.name} gets an email with your request.` : undefined}
            footer={
              <ol className="w-full space-y-3 text-sm">
                {STEPS.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground tabular-nums"
                    >
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-muted-foreground">{step}</p>
                  </li>
                ))}
              </ol>
            }
          >
            {!mentor.acceptingRequests ? (
              <p className="text-muted-foreground">{mentor.name} is not taking new requests right now.</p>
            ) : canAsk ? (
              <RequestForm mentorId={id} mentorName={mentor.name} plans={toPlain(plans)} />
            ) : viewer ? (
              <p className="text-muted-foreground">Only entrepreneurs can send guidance requests.</p>
            ) : (
              <>
                <p className="text-muted-foreground">Create a free account to ask {firstName} for help with your plan.</p>
                <Link href="/sign-up" className={buttonVariants({ size: 'lg', className: 'mt-4 w-full' })}>
                  Create an account
                </Link>
              </>
            )}
          </Panel>
        }
      >
        <Panel title={`About ${firstName}`}>
          <p className="max-w-[68ch] leading-relaxed whitespace-pre-line">{mentor.bio}</p>
        </Panel>

        {posts.length > 0 && (
          <ListPanel
            title={`Posts by ${firstName}`}
            actions={
              <Link
                href="/posts"
                className="text-sm font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2"
              >
                All posts
              </Link>
            }
          >
            {toPlain(posts).map((post) => (
              <li
                key={post._id}
                className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4 hover:bg-ink-50/70 sm:px-6"
              >
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
  )
}
