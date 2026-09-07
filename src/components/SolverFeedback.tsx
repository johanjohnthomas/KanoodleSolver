"use client";

import { ArrowCounterClockwiseIcon, RewindIcon, WarningDiamondIcon } from "@phosphor-icons/react";
import { m, useReducedMotion } from "motion/react";

import { InstrumentButton } from "./InstrumentButton";

type SolverFeedbackProps = Readonly<{
  message: string;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
}>;

export function SolverFeedback({ message, canUndo, onUndo, onReset }: SolverFeedbackProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.section
      className="solver-feedback"
      role="alert"
      aria-labelledby="solver-feedback-title"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(6px)" }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: [1, 1.012, 1], filter: "blur(0px)" }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: "blur(4px)" }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <WarningDiamondIcon className="solver-feedback__icon" weight="fill" aria-hidden="true" />
      <div>
        <span className="measurement-label">Arrangement blocked</span>
        <h2 id="solver-feedback-title">No solution from this layout</h2>
        <p>{message}</p>
      </div>
      <div className="solver-feedback__actions">
        <InstrumentButton icon={<RewindIcon />} label="Undo last move" onClick={onUndo} disabled={!canUndo} />
        <InstrumentButton icon={<ArrowCounterClockwiseIcon />} label="Reset challenge" onClick={onReset} />
      </div>
    </m.section>
  );
}
