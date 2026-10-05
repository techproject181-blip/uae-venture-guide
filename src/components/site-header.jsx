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
    <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur-lg backdrop-saturate-150">
      <div className="page-width flex h-16 items-center gap-6">
        <Logo />
        <NavLinks links={LINKS} className="hidden self-stretch lg:flex" />
        <div className="ml-auto flex items-center gap-2">
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "hidden sm:inline-flex" })}>
            Create account
          </Link>
        </div>
      </div>
      <div className="border-t lg:hidden">
        <NavLinks links={LINKS} compact className="page-width flex" />
      </div>
    </header>
  );
}
