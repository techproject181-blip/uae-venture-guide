import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { buttonVariants } from "@/components/ui/button";

const LINKS = [
  { href: "/mentors", label: "Mentors" },
  { href: "/posts", label: "Experience posts" },
  { href: "/sources", label: "Official sources" },
];

/** Header of the public pages, for visitors who are not signed in. */
export function SiteHeader() {
  return (
    <header className="border-b bg-card lg:sticky lg:top-0 lg:z-40 lg:bg-card/90 lg:backdrop-blur-md">
      <div className="page-width flex items-center gap-4 sm:gap-6">
        <Logo />
        <NavLinks links={LINKS} className="hidden self-stretch lg:flex" />
        <div className="ml-auto flex items-center gap-2 py-2.5">
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants({ variant: "outline", size: "lg", className: "hidden sm:inline-flex" })}>
            Create account
          </Link>
        </div>
      </div>
      <NavLinks links={LINKS} compact className="flex flex-wrap border-t px-2 sm:px-4 lg:hidden" />
    </header>
  );
}
