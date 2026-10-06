import { AuthShowcase } from "@/components/brand/auth-showcase";
import { BackLink } from "@/components/layout";
import { Logo } from "@/components/logo";

/** The sign-in, sign-up and password pages: the emerald showcase on the left (from 1024px), the form on the right. */
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <AuthShowcase />
      <div className="flex flex-col bg-card">
        <header className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
          <Logo className="lg:invisible" />
          <BackLink href="/" className="mb-0">
            Back to home
          </BackLink>
        </header>
        <main id="main" className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
