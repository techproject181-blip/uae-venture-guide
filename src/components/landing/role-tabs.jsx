"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "founders",
    label: "Founders",
    title: "Start with a plan you can follow",
    points: [
      "A roadmap for your emirate, sector and budget",
      "Tick off steps and documents as you go",
      "Keep your first-year budget up to date",
      "Ask a mentor for guidance and talk it through on the website",
    ],
    cta: "Create a free account",
  },
  {
    id: "mentors",
    label: "Mentors",
    title: "Help new founders where they get stuck",
    points: [
      "A profile in the mentor directory, after approval",
      "Accept the requests you can help with",
      "Chat with the founder on the website and read their plan",
      "Write experience posts with charts and pictures",
    ],
    cta: "Join as a mentor",
  },
  {
    id: "funders",
    label: "Funders",
    title: "Find plans that are ready to talk",
    points: [
      "Browse plans that founders chose to share",
      "Filter by sector and emirate",
      "Send interest; the founder decides",
      "Read the full plan once they accept",
    ],
    cta: "Join as a funder",
  },
];

/** "Who it is for": three tabs, one per kind of user. The pill slides to the chosen tab and the list fades across. */
export function RoleTabs() {
  const [active, setActive] = useState(ROLES[0].id);
  const role = ROLES.find((r) => r.id === active);

  // Arrow keys move between tabs, as tabs should.
  function onKeyDown(event) {
    const index = ROLES.findIndex((r) => r.id === active);
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = ROLES[(index + step + ROLES.length) % ROLES.length];
    setActive(next.id);
    document.getElementById(`role-tab-${next.id}`)?.focus();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div role="tablist" aria-label="Who it is for" onKeyDown={onKeyDown} className="mx-auto flex w-fit gap-1 rounded-full border bg-card p-1 shadow-xs">
        {ROLES.map((r) => (
          <button
            key={r.id}
            id={`role-tab-${r.id}`}
            type="button"
            role="tab"
            aria-selected={r.id === active}
            aria-controls="role-panel"
            tabIndex={r.id === active ? 0 : -1}
            onClick={() => setActive(r.id)}
            className={cn(
              "relative min-h-11 rounded-full px-4 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-7",
              r.id === active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r.id === active && (
              <motion.span layoutId="role-pill" aria-hidden="true" className="absolute inset-0 rounded-full bg-primary shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{r.label}</span>
          </button>
        ))}
      </div>

      <div id="role-panel" role="tabpanel" aria-labelledby={`role-tab-${active}`} className="panel mt-8 p-6 sm:p-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center"
          >
            <div>
              <h3 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{role.title}</h3>
              <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "mt-6" })}>
                {role.cta}
              </Link>
            </div>
            <ul className="space-y-3">
              {role.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
