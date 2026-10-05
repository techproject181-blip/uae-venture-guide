"use client";

import { MotionConfig } from "motion/react";

/** Motion follows the computer's "reduce motion" setting everywhere in the app. */
export function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
