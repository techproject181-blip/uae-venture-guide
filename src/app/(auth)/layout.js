import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

/** The sign-in, sign-up and password pages: one plain column with the form. */
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b bg-card">
        <div className="page-width flex py-2.5">
          <Logo />
        </div>
      </header>
      <main id="main" className="flex flex-1 justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
