import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-[1.875rem] leading-[1.15] sm:text-[2.25rem]">Create your account</h1>
      <p className="mt-2 text-muted-foreground">
        All fields are required. Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
          Sign in
        </Link>
      </p>
      <SignUpForm />
    </>
  );
}
