"use client";

import {
  ArrowCounterClockwiseIcon,
  BroomIcon,
  CheckIcon,
  LightbulbIcon,
  PuzzlePieceIcon,
  RewindIcon,
} from "@phosphor-icons/react";

import { InstrumentButton } from "./InstrumentButton";

type SolverActionsProps = Readonly<{
  busy: boolean;
  canUndo: boolean;
  solved: boolean;
  onNewChallenge: (pieceCount: number) => void;
  onHint: () => void;
  onSolve: () => void;
  onReset: () => void;
  onClear: () => void;
  onUndo: () => void;
}>;

export function SolverActions({
  busy,
  canUndo,
  solved,
  onNewChallenge,
  onHint,
  onSolve,
  onReset,
  onClear,
  onUndo,
}: SolverActionsProps) {
  return (
    <section className="action-console" aria-labelledby="actions-title">
      <div className="action-console__challenge">
        <div>
          <h2 id="actions-title">Start a challenge</h2>
          <p>Every setup comes from a complete solution.</p>
        </div>
        <div className="challenge-options" aria-label="Challenge difficulty">
          <InstrumentButton icon={<PuzzlePieceIcon />} label="Easy · 4 pieces" tone="quiet" onClick={() => onNewChallenge(4)} disabled={busy} />
          <InstrumentButton icon={<PuzzlePieceIcon />} label="Medium · 3" tone="quiet" onClick={() => onNewChallenge(3)} disabled={busy} />
          <InstrumentButton icon={<PuzzlePieceIcon />} label="Hard · 2" tone="quiet" onClick={() => onNewChallenge(2)} disabled={busy} />
        </div>
      </div>
      <div className="action-console__tools">
        <InstrumentButton icon={<RewindIcon />} label="Undo" onClick={onUndo} disabled={busy || !canUndo} />
        <InstrumentButton icon={<LightbulbIcon />} label={busy ? "Working…" : "Hint"} onClick={onHint} disabled={busy} />
        <InstrumentButton
          icon={solved ? <PuzzlePieceIcon /> : <CheckIcon />}
          label={busy ? "Solving…" : solved ? "New puzzle" : "Solve board"}
          tone="copper"
          onClick={solved ? () => onNewChallenge(4) : onSolve}
          disabled={busy}
        />
        <InstrumentButton icon={<ArrowCounterClockwiseIcon />} label="Reset" onClick={onReset} disabled={busy} />
        <InstrumentButton icon={<BroomIcon />} label="Clear" onClick={onClear} disabled={busy} />
      </div>
    </section>
  );
}
