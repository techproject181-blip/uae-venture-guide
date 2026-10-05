import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

// Roboto for all text: the UAE Government Design System's text face, plain and
// easy to read. next/font serves it from this app, with no layout shift.
const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: { default: "UAE Venture Guide", template: "%s | UAE Venture Guide" },
  description:
    "Plan your UAE startup step by step: licence, visas, bank and tax, with costs from official fees, a budget, and help from mentors and funders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NavigationProgress />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:border focus:border-primary focus:bg-card focus:shadow-lg focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        {children}
        <Toaster position="top-center" closeButton toastOptions={{ classNames: { toast: "rounded-xl! border-border! shadow-[0_8px_24px_rgb(15_23_42/0.12)]!" } }} />
      </body>
    </html>
  );
}
