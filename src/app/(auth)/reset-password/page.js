import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata = { title: "Choose a new password" };

export default function ResetPasswordPage({ searchParams }) {
  return (
    <>
      <h1 className="text-[1.875rem] leading-[1.15] sm:text-[2.25rem]">Choose a new password</h1>
      <p className="mt-2 text-muted-foreground">
        After this, sign in with your new password.{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2"
        >
          Need a new link?
        </Link>
      </p>
      {/* The token is in the address, read at request time; the same form shows until then. */}
      <Suspense fallback={<ResetPasswordForm token="" />}>
        <FormWithToken searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function FormWithToken({ searchParams }) {
  const { token = "" } = await searchParams;
  return <ResetPasswordForm token={token} />;
}
