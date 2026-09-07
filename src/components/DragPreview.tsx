"use client";

import { m, useReducedMotion } from "motion/react";

import { PieceShape } from "./PieceShape";
import type { PieceDragSession } from "@/hooks/usePieceDrag";

type DragPreviewProps = Readonly<{
  session: PieceDragSession;
  valid: boolean;
}>;

export function DragPreview({ session, valid }: DragPreviewProps) {
  const reduceMotion = useReducedMotion();
  const { payload, pointer } = session;

  return (
    <>
      <m.div
        className="drag-preview"
        data-drop-state={session.target === null ? "neutral" : valid ? "valid" : "invalid"}
        data-piece={payload.piece.name}
        style={{ left: pointer.x, top: pointer.y }}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.86, filter: "blur(4px)" }}
        animate={{ opacity: 0.94, scale: 1.08, filter: "blur(0px)" }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(3px)" }}
        transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.72 }}
        aria-hidden="true"
      >
        <PieceShape
          piece={payload.piece}
          rotation={payload.rotation}
          flipped={payload.flipped}
          size="large"
        />
      </m.div>
      <m.aside
        className="drag-instructions"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        aria-live="polite"
      >
        <span>Piece {payload.piece.name} · {payload.rotation * 90}°{payload.flipped ? " · flipped" : ""}</span>
        <span><kbd>A</kbd> left <kbd>D</kbd>/<kbd>R</kbd> right <kbd>F</kbd> flip</span>
      </m.aside>
    </>
  );
}
