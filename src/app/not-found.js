import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-card">
        <div className="page-width flex py-2.5">
          <Logo />
        </div>
      </header>
      <main id="main" className="flex flex-1 justify-center px-4 py-14 sm:py-20">
        <div className="w-full max-w-md">
          <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Page not found</h1>
          <p className="mt-2 text-muted-foreground">This page does not exist, or you do not have access to it.</p>
          <Link href="/" className={buttonVariants({ size: "lg", className: "mt-8" })}>
            Back to the home page
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
