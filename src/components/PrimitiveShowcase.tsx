"use client";

import { ArrowCounterClockwiseIcon, CheckIcon, LightbulbIcon } from "@phosphor-icons/react";
import { domAnimation, LazyMotion } from "motion/react";
import { useState } from "react";

import { InstrumentButton } from "./InstrumentButton";
import { PieceTray } from "./PieceTray";
import { PuzzleBoard } from "./PuzzleBoard";
import { SolverFeedback } from "./SolverFeedback";
import { SoundToggle } from "./SoundToggle";
import type { DragHandleProps } from "@/hooks/usePieceDrag";
import { BOARD_LAYOUTS, PIECES } from "@/lib/pieces";
import { createEmptyBoard, placePieceOnBoard } from "@/lib/solver";
import type { Piece } from "@/lib/types";

const layout = BOARD_LAYOUTS[0];
const firstPiece = PIECES[0];
const sampleBoard = placePieceOnBoard(createEmptyBoard(layout), firstPiece, 0, 0);
const samplePlacement = { piece: firstPiece, x: 0, y: 0, rotation: 0, flipped: false };
const inertDragProps = (onClick: () => void): DragHandleProps => ({
  onPointerDown: () => undefined,
  onPointerMove: () => undefined,
  onPointerUp: () => undefined,
  onPointerCancel: () => undefined,
  onClick: () => onClick(),
});

export function PrimitiveShowcase() {
  const [selected, setSelected] = useState<Piece | null>(PIECES[1]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <LazyMotion features={domAnimation}>
      <main className="showcase-page">
      <header>
        <h1>Workbench primitives</h1>
        <p>Default, selected, placed, disabled, focus, and board states.</p>
      </header>
      <section aria-labelledby="buttons-title">
        <div className="section-heading">
          <h2 id="buttons-title">Instrument buttons</h2>
          <span className="measurement-label">44px minimum</span>
        </div>
        <div className="primitive-row">
          <InstrumentButton icon={<CheckIcon />} label="Solve board" tone="copper" />
          <InstrumentButton icon={<LightbulbIcon />} label="Hint" />
          <InstrumentButton icon={<ArrowCounterClockwiseIcon />} label="Reset" tone="quiet" />
          <InstrumentButton icon={<CheckIcon />} label="Working…" disabled />
          <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled((current) => !current)} />
        </div>
      </section>
      <SolverFeedback
        message="This arrangement has no complete solution. Undo or reset a piece and try again."
        canUndo
        onUndo={() => undefined}
        onReset={() => undefined}
      />
      <PuzzleBoard
        board={sampleBoard}
        layout={layout}
        selectedPiece={selected}
        canPlace={() => false}
        onCellClick={() => undefined}
        placements={[samplePlacement]}
        preview={null}
        getDragHandleProps={(_, onClick) => inertDragProps(onClick)}
        disabled={false}
      />
      <PieceTray
        pieces={PIECES}
        placed={[samplePlacement]}
        selectedName={selected?.name ?? null}
        onSelect={setSelected}
        getDragHandleProps={(_, onClick) => inertDragProps(onClick)}
      />
      </main>
    </LazyMotion>
  );
}
