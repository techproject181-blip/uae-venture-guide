import Link from "next/link";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
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
      <div className="page-width flex h-16 items-center gap-3 sm:gap-6">
        <Logo />
        <NavLinks links={LINKS} className="hidden self-stretch lg:flex" />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "lg", className: "hidden lg:inline-flex" })}>
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "hidden lg:inline-flex" })}>
            Create account
          </Link>
          <MobileNav links={LINKS}>
            <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "w-full" })}>
              Create account
            </Link>
            <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
              Sign in
            </Link>
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
