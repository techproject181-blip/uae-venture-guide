import Link from "next/link";
import { MentorCard } from "@/components/mentors/mentor-card";
import { EmptyState, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { toPlain } from "@/lib/api";
import { listMentors } from "@/lib/community";
import { EMIRATES, EXPERTISE, valuesOf } from "@/lib/constants";

export const metadata = { title: "Mentors" };

const selectClass =
  "h-11 w-full cursor-pointer rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function MentorsPage({ searchParams }) {
  const params = await searchParams;
  const expertise = valuesOf(EXPERTISE).includes(params.expertise) ? params.expertise : "";
  const emirate = valuesOf(EMIRATES).includes(params.emirate) ? params.emirate : "";
  const mentors = toPlain(await listMentors({ expertise, emirate }));
  const filtered = Boolean(expertise || emirate);

  return (
    <>
      <PageHeader
        title="Mentors"
        description="Founders and professionals who help new businesses in the UAE. An administrator checks every mentor."
      />

      <form className="mb-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end lg:max-w-3xl">
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="expertise">
            Expertise
          </label>
          <select id="expertise" name="expertise" defaultValue={expertise} className={selectClass}>
            <option value="">Any expertise</option>
            {EXPERTISE.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="emirate">
            Emirate
          </label>
          <select id="emirate" name="emirate" defaultValue={emirate} className={selectClass}>
            <option value="">Any emirate</option>
            {EMIRATES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" variant="outline">
          Filter
        </Button>
      </form>

      {mentors.length === 0 ? (
        <EmptyState
          title={filtered ? "No mentors match" : "No mentors yet"}
          text={filtered ? "Try another area or emirate." : "Mentors appear here once an administrator approves them."}
          action={
            filtered && (
              <Link href="/mentors" className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
                Clear the filters
              </Link>
            )
          }
        />
      ) : (
        <ul className="divide-y border-y">
          {mentors.map((mentor) => (
            <li key={mentor._id}>
              <MentorCard mentor={mentor} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
