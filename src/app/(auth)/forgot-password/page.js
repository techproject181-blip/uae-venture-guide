import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata = { title: "Forgot your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Forgot your password?</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your email and we will send you a link to choose a new one. Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2">
          Sign in
        </Link>
      </p>
      <ForgotPasswordForm />
    </>
  );
}
