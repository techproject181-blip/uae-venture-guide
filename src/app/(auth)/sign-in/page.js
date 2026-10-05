import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }) {
  const { error } = await searchParams;
  const notice = error === "suspended" ? "Your account is suspended. Please contact the administrator." : null;

  return (
    <>
      <h1 className="text-[1.875rem] leading-[1.15] sm:text-[2.25rem]">Sign in</h1>
      <p className="mt-2 text-muted-foreground">
        New here?{" "}
        <Link href="/sign-up" className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
          Create an account
        </Link>
      </p>
      <SignInForm notice={notice} />
    </>
  );
}
