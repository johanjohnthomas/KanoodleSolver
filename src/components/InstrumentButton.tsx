"use client";

import { m, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type InstrumentButtonProps = Readonly<
  HTMLMotionProps<"button"> & {
    icon: ReactNode;
    label: string;
    tone?: "dark" | "copper" | "quiet";
  }
>;

export function InstrumentButton({
  icon,
  label,
  tone = "dark",
  className = "",
  ...props
}: InstrumentButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.button
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.6 }}
      className={`instrument-button instrument-button--${tone} ${className}`}
      {...props}
    >
      <span className="instrument-button__icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </m.button>
  );
}
