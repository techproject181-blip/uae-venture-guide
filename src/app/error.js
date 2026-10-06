"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

/** Shown in place of a page when something goes wrong while it loads, such as the database being out of reach. */
export default function ErrorPage({ retry }) {
  return (
    <div className="page-width flex flex-1 flex-col items-center justify-center py-16 text-center sm:py-24">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-700">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-[1.875rem] leading-[1.15] sm:text-[2.25rem]">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">This page could not load. Try again in a moment. If it keeps happening, go back to the home page.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Home page
        </Link>
      </div>
    </div>
  );
}
