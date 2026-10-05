import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/mentors", label: "Mentors" },
      { href: "/posts", label: "Experience posts" },
      { href: "/sources", label: "Official sources" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-up", label: "Create an account" },
      { href: "/sign-in", label: "Sign in" },
      { href: "/forgot-password", label: "Forgot password" },
    ],
  },
];

/** The footer on every page. It says plainly that this is not a government service. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="page-width grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:py-14">
        <div className="max-w-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <Wordmark />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Step-by-step roadmaps, budgets and help from mentors for people starting a business in the UAE.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="mt-3 space-y-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-9 items-center text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <div className="page-width flex flex-col gap-1 py-5 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>© 2026 UAE Venture Guide. Not a government service.</p>
          <p>Guidance only, not legal or financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
