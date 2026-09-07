"use client";

import { m, useReducedMotion } from "motion/react";

import { PieceShape } from "./PieceShape";
import type { DragHandleProps } from "@/hooks/usePieceDrag";
import type { Piece, PlacedPiece } from "@/lib/types";

type PieceTrayProps = Readonly<{
  pieces: readonly Piece[];
  placed: readonly PlacedPiece[];
  selectedName: string | null;
  onSelect: (piece: Piece) => void;
  getDragHandleProps: (piece: Piece, onClick: () => void) => DragHandleProps;
}>;

export function PieceTray({ pieces, placed, selectedName, onSelect, getDragHandleProps }: PieceTrayProps) {
  const reduceMotion = useReducedMotion();
  const placedNames = new Set(placed.map(({ piece }) => piece.name));

  return (
    <section className="specimen-drawer" aria-labelledby="piece-drawer-title">
      <div className="section-heading">
        <div>
          <h2 id="piece-drawer-title">Piece drawer</h2>
          <p>Drag a piece to the board, or choose it for click placement. Use A, D, R, or F while dragging.</p>
        </div>
        <span className="measurement-label">A–L · 12 pieces</span>
      </div>
      <div className="piece-tray">
        {pieces.map((piece) => {
          const isPlaced = placedNames.has(piece.name);
          const isSelected = selectedName === piece.name;
          const dragHandleProps = getDragHandleProps(piece, () => onSelect(piece));
          return (
            <m.button
              type="button"
              key={piece.name}
              className="piece-specimen"
              data-selected={isSelected || undefined}
              data-placed={isPlaced || undefined}
              aria-pressed={isSelected}
              disabled={isPlaced}
              aria-label={`Piece ${piece.name}${isPlaced ? ", already placed" : ""}`}
              {...dragHandleProps}
              data-drag-source="tray"
              whileHover={reduceMotion || isPlaced ? undefined : { y: -2 }}
              whileTap={reduceMotion || isPlaced ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
            >
              <span className="piece-specimen__letter">{piece.name}</span>
              <PieceShape piece={piece} />
              <span className="piece-specimen__state">
                {isPlaced ? "placed" : isSelected ? "selected" : "available"}
              </span>
            </m.button>
          );
        })}
      </div>
    </section>
  );
}
