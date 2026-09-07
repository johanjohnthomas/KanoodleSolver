import { isValidPiecePlacement, placePieceOnBoard } from "./pieceGeometry";
import type { Board, BoardLayout, Piece, PlacedPiece } from "./types";

export type PieceDropRequest = Readonly<{
  piece: Piece;
  x: number;
  y: number;
  rotation: number;
  flipped: boolean;
  movingName: string | null;
}>;

export type PieceDropResult = Readonly<{
  board: Board;
  placements: readonly PlacedPiece[];
}>;

export const removeNamedPiece = (board: Board, name: string): Board =>
  board.map((row) => row.map((cell) => (cell === name ? null : cell)));

const boardForDrop = (board: Board, movingName: string | null): Board =>
  movingName === null ? board : removeNamedPiece(board, movingName);

export const canDropPiece = (
  board: Board,
  layout: BoardLayout,
  request: PieceDropRequest,
): boolean => isValidPiecePlacement(
  boardForDrop(board, request.movingName),
  layout,
  request.piece,
  request.x,
  request.y,
  request.rotation,
  request.flipped,
);

export const applyPieceDrop = (
  board: Board,
  layout: BoardLayout,
  placements: readonly PlacedPiece[],
  request: PieceDropRequest,
): PieceDropResult | null => {
  const availableBoard = boardForDrop(board, request.movingName);
  if (!canDropPiece(board, layout, request)) {
    return null;
  }

  const placement: PlacedPiece = {
    piece: request.piece,
    x: request.x,
    y: request.y,
    rotation: request.rotation,
    flipped: request.flipped,
  };
  return {
    board: placePieceOnBoard(
      availableBoard,
      request.piece,
      request.x,
      request.y,
      request.rotation,
      request.flipped,
    ),
    placements: [
      ...placements.filter(({ piece }) => piece.name !== request.movingName),
      placement,
    ],
  };
};
