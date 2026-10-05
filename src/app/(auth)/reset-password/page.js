import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }) {
  const { token = "" } = await searchParams;

  return (
    <>
      <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Choose a new password</h1>
      <p className="mt-2 text-muted-foreground">
        After this, sign in with your new password.{" "}
        <Link href="/forgot-password" className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
          Need a new link?
        </Link>
      </p>
      <ResetPasswordForm token={token} />
    </>
  );
}
