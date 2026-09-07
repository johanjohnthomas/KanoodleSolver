import { describe, expect, it } from "@jest/globals";

import { applyPieceDrop, canDropPiece } from "./gameBoard";
import { BOARD_LAYOUTS, PIECES } from "./pieces";
import { createEmptyBoard, placePieceOnBoard } from "./solver";
import type { PlacedPiece } from "./types";

describe("piece drops", () => {
  it("allows a placed piece to move through its own occupied cells", () => {
    // Given
    const layout = BOARD_LAYOUTS[0];
    const placement: PlacedPiece = {
      piece: PIECES[0],
      x: 0,
      y: 0,
      rotation: 0,
      flipped: false,
    };
    const board = placePieceOnBoard(
      createEmptyBoard(layout),
      placement.piece,
      placement.x,
      placement.y,
      placement.rotation,
      placement.flipped,
    );
    const request = { ...placement, movingName: placement.piece.name };

    // When
    const result = applyPieceDrop(board, layout, [placement], request);

    // Then
    expect(canDropPiece(board, layout, request)).toBe(true);
    expect(result?.placements).toEqual([placement]);
    expect(result?.board).toEqual(board);
  });

  it("rejects a drop that overlaps another piece", () => {
    // Given
    const layout = BOARD_LAYOUTS[0];
    const pieceA = PIECES[0];
    const pieceB = PIECES[1];
    const occupied = placePieceOnBoard(createEmptyBoard(layout), pieceB, 0, 0);

    // Then
    expect(canDropPiece(occupied, layout, {
      piece: pieceA,
      x: 0,
      y: 0,
      rotation: 0,
      flipped: false,
      movingName: null,
    })).toBe(false);
  });
});
