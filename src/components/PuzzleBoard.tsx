"use client";

import { m, useReducedMotion } from "motion/react";

import type { Board, BoardLayout, Piece } from "@/lib/types";

type PuzzleBoardProps = Readonly<{
  board: Board;
  layout: BoardLayout;
  selectedPiece: Piece | null;
  canPlace: (x: number, y: number) => boolean;
  onCellClick: (x: number, y: number) => void;
  disabled: boolean;
}>;

export function PuzzleBoard({
  board,
  layout,
  selectedPiece,
  canPlace,
  onCellClick,
  disabled,
}: PuzzleBoardProps) {
  const reduceMotion = useReducedMotion();
  const labels = new Set<string>();

  return (
    <section className="board-zone" aria-labelledby="board-title">
      <div className="section-heading board-heading">
        <div>
          <h2 id="board-title" tabIndex={-1}>The board</h2>
          <p>{selectedPiece ? `Piece ${selectedPiece.name} is ready to place.` : "Choose a piece or start a challenge."}</p>
        </div>
        <span className="measurement-label">5 × 11 · 55 cells</span>
      </div>
      <div className="board-scroll" tabIndex={0} aria-label="Scrollable puzzle board">
        <div className="board-shell">
          <div className="board-ruler board-ruler--top" aria-hidden="true">
            {Array.from({ length: layout.cols }, (_, index) => <span key={index}>{index + 1}</span>)}
          </div>
          <div className="board-ruler board-ruler--side" aria-hidden="true">
            {Array.from({ length: layout.rows }, (_, index) => <span key={index}>{index + 1}</span>)}
          </div>
          <div
            className="puzzle-board"
            role="grid"
            aria-rowcount={layout.rows}
            aria-colcount={layout.cols}
          >
            {board.flatMap((row, y) =>
              row.map((pieceName, x) => {
                const showLabel = pieceName !== null && !labels.has(pieceName);
                if (showLabel && pieceName !== null) {
                  labels.add(pieceName);
                }
                const validTarget = selectedPiece !== null && pieceName === null && canPlace(x, y);
                return (
                  <m.button
                    type="button"
                    role="gridcell"
                    key={`${x}-${y}`}
                    className="board-cell"
                    data-piece={pieceName ?? undefined}
                    data-valid={validTarget || undefined}
                    disabled={disabled}
                    aria-label={pieceName ? `Row ${y + 1}, column ${x + 1}, piece ${pieceName}. Remove piece.` : `Row ${y + 1}, column ${x + 1}, empty${validTarget ? ", valid placement" : ""}.`}
                    onClick={() => onCellClick(x, y)}
                    initial={false}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: pieceName ? 1 : 0.985 }}
                    transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.8 }}
                  >
                    {showLabel ? <span>{pieceName}</span> : null}
                  </m.button>
                );
              }),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
