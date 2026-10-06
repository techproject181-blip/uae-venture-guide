"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Compass, HandCoins, Rocket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "founders",
    label: "Founders",
    icon: Rocket,
    blurb: "Plan and start your business",
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
    icon: Compass,
    blurb: "Guide new founders",
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
    icon: HandCoins,
    blurb: "Find plans to back",
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

/**
 * "Who it is for", as one panel: the heading and a list of the three roles on
 * the left, and what the chosen role gets on the right. The pale highlight
 * slides to the chosen role and the right side fades across.
 */
export function RoleTabs({ titleId }) {
  const [active, setActive] = useState(ROLES[0].id);
  const role = ROLES.find((r) => r.id === active);

  // Arrow keys move between tabs, as tabs should.
  function onKeyDown(event) {
    const index = ROLES.findIndex((r) => r.id === active);
    const step = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = ROLES[(index + step + ROLES.length) % ROLES.length];
    setActive(next.id);
    document.getElementById(`role-tab-${next.id}`)?.focus();
  }

  return (
    <div className="reveal panel grid overflow-hidden lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="border-b bg-ink-50/70 p-6 sm:p-8 lg:border-r lg:border-b-0 lg:p-10">
        <h2 id={titleId} className="font-display text-[1.75rem] leading-tight font-bold tracking-[-0.03em] sm:text-[2.25rem]">
          Made for founders, mentors and funders
        </h2>
        <p className="mt-3 text-muted-foreground">Mentors and funders are approved by an administrator first.</p>

        <div
          role="tablist"
          aria-label="Who it is for"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="mt-6 grid gap-2 sm:grid-cols-3 lg:mt-8 lg:grid-cols-1"
        >
          {ROLES.map((r) => {
            const Icon = r.icon;
            const selected = r.id === active;
            return (
              <button
                key={r.id}
                id={`role-tab-${r.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="role-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(r.id)}
                className="relative flex items-center gap-3 rounded-xl p-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {selected && (
                  <motion.span
                    layoutId="role-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl border bg-card shadow-panel"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                    selected ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="relative min-w-0">
                  <span className={cn("block font-semibold", !selected && "text-muted-foreground")}>{r.label}</span>
                  <span className="block text-sm text-muted-foreground">{r.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="role-panel" role="tabpanel" aria-labelledby={`role-tab-${active}`} className="flex p-6 sm:p-8 lg:items-center lg:p-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <h3 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{role.title}</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {role.points.map((point) => (
                <li key={point} className="flex gap-3 rounded-xl border p-4">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "mt-6" })}>
              {role.cta}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
