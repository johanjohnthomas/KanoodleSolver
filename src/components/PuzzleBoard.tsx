"use client";

import { m, useReducedMotion } from "motion/react";

import type { DragHandleProps } from "@/hooks/usePieceDrag";
import type { Cell } from "@/lib/pieceGeometry";
import type { Board, BoardLayout, Piece, PlacedPiece } from "@/lib/types";

export type BoardDropPreview = Readonly<{
  cells: readonly Cell[];
  valid: boolean;
  movingName: string | null;
}>;

type PuzzleBoardProps = Readonly<{
  board: Board;
  layout: BoardLayout;
  selectedPiece: Piece | null;
  canPlace: (x: number, y: number) => boolean;
  onCellClick: (x: number, y: number) => void;
  placements: readonly PlacedPiece[];
  preview: BoardDropPreview | null;
  getDragHandleProps: (placement: PlacedPiece, onClick: () => void) => DragHandleProps;
  disabled: boolean;
}>;

export function PuzzleBoard({
  board,
  layout,
  selectedPiece,
  canPlace,
  onCellClick,
  placements,
  preview,
  getDragHandleProps,
  disabled,
}: PuzzleBoardProps) {
  const reduceMotion = useReducedMotion();
  const labels = new Set<string>();
  const previewCells = new Set(preview?.cells.map(({ x, y }) => `${x}:${y}`) ?? []);

  return (
    <section className="board-zone" aria-labelledby="board-title">
      <div className="section-heading board-heading">
        <div>
          <h2 id="board-title" tabIndex={-1}>The board</h2>
          <p>{selectedPiece ? `Piece ${selectedPiece.name} is ready. Drag it here or choose a cell.` : "Choose a piece or start a challenge."}</p>
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
                const placement = pieceName === null
                  ? undefined
                  : placements.find(({ piece }) => piece.name === pieceName);
                const dragHandleProps = placement === undefined
                  ? { onClick: () => onCellClick(x, y) }
                  : getDragHandleProps(placement, () => onCellClick(x, y));
                return (
                  <m.button
                    type="button"
                    role="gridcell"
                    key={`${x}-${y}`}
                    className="board-cell"
                    {...dragHandleProps}
                    data-board-x={x}
                    data-board-y={y}
                    data-piece={pieceName ?? undefined}
                    data-valid={validTarget || undefined}
                    data-preview={previewCells.has(`${x}:${y}`) ? (preview?.valid ? "valid" : "invalid") : undefined}
                    data-lifted={preview?.movingName !== null && preview?.movingName === pieceName ? true : undefined}
                    disabled={disabled}
                    aria-label={pieceName ? `Row ${y + 1}, column ${x + 1}, piece ${pieceName}. Remove piece.` : `Row ${y + 1}, column ${x + 1}, empty${validTarget ? ", valid placement" : ""}.`}
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
