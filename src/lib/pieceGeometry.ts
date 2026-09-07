import type { Board, BoardLayout, Piece } from "./types";

export type Cell = Readonly<{ x: number; y: number }>;
export type Orientation = Readonly<{ rotation: number; flipped: boolean }>;

export const occupiedCells = (
  shape: readonly (readonly number[])[],
): readonly Cell[] =>
  shape.flatMap((row, y) =>
    row.flatMap((value, x) => (value === 1 ? [{ x, y }] : [])),
  );

const transformedShape = (
  piece: Piece,
  rotation: number,
  flipped: boolean,
): number[][] => {
  const normalizedRotation = ((rotation % 4) + 4) % 4;
  return flipped
    ? piece.flippedRotations[normalizedRotation]
    : piece.rotations[normalizedRotation];
};

export const getPieceShape = (
  piece: Piece,
  rotation = 0,
  flipped = false,
): number[][] => transformedShape(piece, rotation, flipped);

export const cellsForPlacement = (
  piece: Piece,
  x: number,
  y: number,
  rotation: number,
  flipped: boolean,
): readonly Cell[] =>
  occupiedCells(transformedShape(piece, rotation, flipped)).map((cell) => ({
    x: x + cell.x,
    y: y + cell.y,
  }));

export const uniqueOrientations = (piece: Piece): readonly Orientation[] => {
  const seen = new Set<string>();
  const orientations: Orientation[] = [];

  for (const flipped of [false, true]) {
    for (let rotation = 0; rotation < 4; rotation += 1) {
      const key = occupiedCells(transformedShape(piece, rotation, flipped))
        .map(({ x, y }) => `${x}:${y}`)
        .join("|");
      if (!seen.has(key)) {
        seen.add(key);
        orientations.push({ rotation, flipped });
      }
    }
  }
  return orientations;
};

export const cloneBoard = (board: Board): Board => board.map((row) => [...row]);

export function createEmptyBoard(layout: BoardLayout): Board {
  return Array.from({ length: layout.rows }, () =>
    Array.from({ length: layout.cols }, () => null),
  );
}

export function isValidPiecePlacement(
  board: Board,
  layout: BoardLayout,
  piece: Piece,
  x: number,
  y: number,
  rotation = 0,
  flipped = false,
): boolean {
  return cellsForPlacement(piece, x, y, rotation, flipped).every(
    (cell) =>
      cell.y >= 0 &&
      cell.y < layout.rows &&
      cell.x >= 0 &&
      cell.x < layout.cols &&
      layout.shape[cell.y][cell.x] &&
      board[cell.y][cell.x] === null,
  );
}

export function placePieceOnBoard(
  board: Board,
  piece: Piece,
  x: number,
  y: number,
  rotation = 0,
  flipped = false,
): Board {
  const nextBoard = cloneBoard(board);
  for (const cell of cellsForPlacement(piece, x, y, rotation, flipped)) {
    const row = nextBoard[cell.y];
    if (row?.[cell.x] !== undefined) {
      row[cell.x] = piece.name;
    }
  }
  return nextBoard;
}
