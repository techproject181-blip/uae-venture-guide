import { Bricolage_Grotesque, Geist } from "next/font/google";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/motion-provider";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

// Geist for all text: clear at small sizes, with even figures for money.
// Bricolage Grotesque for the logo and big headings: friendly, with character.
// next/font serves both from this app, with no layout shift.
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", weight: ["600", "700", "800"] });

export const metadata = {
  title: { default: "UAE Venture Guide", template: "%s | UAE Venture Guide" },
  description:
    "Plan your UAE startup step by step: licence, visas, bank and tax, with costs from official fees, a budget, and help from mentors and funders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NavigationProgress />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:border focus:border-primary focus:bg-card focus:shadow-lg focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        <MotionProvider>{children}</MotionProvider>
        <Toaster position="top-center" closeButton toastOptions={{ classNames: { toast: "rounded-xl! border-border! shadow-float!" } }} />
      </body>
    </html>
  );
}
