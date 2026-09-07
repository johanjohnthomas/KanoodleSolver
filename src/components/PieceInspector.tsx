"use client";

import { ArrowsClockwiseIcon, FlipHorizontalIcon, SelectionIcon } from "@phosphor-icons/react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";

import { InstrumentButton } from "./InstrumentButton";
import { PieceShape } from "./PieceShape";
import type { Piece } from "@/lib/types";

type PieceInspectorProps = Readonly<{
  piece: Piece | null;
  rotation: number;
  flipped: boolean;
  onRotate: (change: number) => void;
  onFlip: () => void;
}>;

export function PieceInspector({
  piece,
  rotation,
  flipped,
  onRotate,
  onFlip,
}: PieceInspectorProps) {
  const reduceMotion = useReducedMotion();

  return (
    <aside className="piece-inspector" aria-labelledby="inspector-title">
      <div className="inspector-title-row">
        <SelectionIcon aria-hidden="true" />
        <h2 id="inspector-title">Selected piece</h2>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={piece?.name ?? "empty"}
          className="inspector-content"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {piece ? (
            <>
              <div className="inspector-piece" data-piece={piece.name}>
                <span className="inspector-piece__letter">{piece.name}</span>
                <PieceShape piece={piece} rotation={rotation} flipped={flipped} size="large" />
              </div>
              <p>
                {rotation * 90}° {flipped ? "· flipped" : "· face up"}
              </p>
            </>
          ) : (
            <p className="inspector-empty">Choose an available piece from the drawer.</p>
          )}
        </m.div>
      </AnimatePresence>
      <div className="inspector-actions">
        <InstrumentButton
          icon={<ArrowsClockwiseIcon mirrored />}
          label="Rotate left"
          onClick={() => onRotate(-1)}
          disabled={piece === null}
        />
        <InstrumentButton
          icon={<ArrowsClockwiseIcon />}
          label="Rotate right"
          onClick={() => onRotate(1)}
          disabled={piece === null}
        />
        <InstrumentButton
          icon={<FlipHorizontalIcon />}
          label="Flip"
          onClick={onFlip}
          aria-pressed={flipped}
          disabled={piece === null}
        />
      </div>
    </aside>
  );
}
