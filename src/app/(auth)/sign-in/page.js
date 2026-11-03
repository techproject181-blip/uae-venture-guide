import { Suspense } from "react";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { FormAlert } from "@/components/form/form-alert";

export const metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }) {
  return (
    <>
      <h1 className="text-[1.875rem] leading-[1.15] sm:text-[2.25rem]">Sign in</h1>
      <p className="mt-2 text-muted-foreground">
        New here?{" "}
        <Link href="/sign-up" className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
          Create an account
        </Link>
      </p>
      {/* The notice comes from the address, read at request time. It sits outside the form, so the form
          is drawn once and keeps what was typed or filled in by a password manager while the notice loads. */}
      <Suspense fallback={null}>
        <SuspendedNotice searchParams={searchParams} />
      </Suspense>
      <SignInForm />
    </>
  );
}

async function SuspendedNotice({ searchParams }) {
  const { error } = await searchParams;
  if (error !== "suspended") return null;
  return (
    <div className="mt-6">
      <FormAlert>Your account is suspended. Please contact the administrator.</FormAlert>
    </div>
  );
}
