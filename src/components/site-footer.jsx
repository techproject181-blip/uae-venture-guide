import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";

const LINKS = [
  { href: "/mentors", label: "Mentors" },
  { href: "/posts", label: "Experience posts" },
  { href: "/sources", label: "Official sources" },
];

const ACCOUNT_LINKS = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create an account" },
];

const linkClass = "inline-flex min-h-9 items-center text-sm text-muted-foreground hover:text-foreground";

/**
 * The footer on every page: the logo and main links, then a thin line with the
 * copyright. The account links are for visitors only, so pass signedIn to drop them.
 */
export function SiteFooter({ signedIn = false }) {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="page-width">
        {/* Signed-in users already have these links in the header, so they only see the copyright. */}
        {!signedIn && (
          <div className="flex flex-col items-center gap-4 py-8 md:flex-row md:justify-between">
            <Link href="/" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <LogoMark />
              <Wordmark />
            </Link>
            <nav aria-label="Footer">
              <ul className="flex flex-wrap justify-center gap-x-6">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
        <div
          className={`flex flex-col-reverse items-center gap-2 py-4 md:flex-row ${signedIn ? "md:justify-center" : "border-t md:justify-between"}`}
        >
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} UAE Venture Guide. All rights reserved.</p>
          {!signedIn && (
            <ul className="flex gap-x-6">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
