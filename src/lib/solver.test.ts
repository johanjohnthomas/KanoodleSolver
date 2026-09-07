import { describe, expect, it } from "@jest/globals";

import { BOARD_LAYOUTS, PIECES } from "./pieces";
import { createEmptyBoard, KanoodleSolver, placePieceOnBoard } from "./solver";

describe("KanoodleSolver", () => {
  it("covers the standard board when starting empty", () => {
    // Given
    const layout = BOARD_LAYOUTS[0];
    const solver = new KanoodleSolver(createEmptyBoard(layout), layout);

    // When
    const solution = solver.solve();

    // Then
    expect(solution).toHaveLength(PIECES.length);
    expect(solver.getSolution().flat().every((cell) => cell !== null)).toBe(true);
  });

  it("keeps repeated empty-board searches within an interactive budget", () => {
    // Given
    const layout = BOARD_LAYOUTS[0];
    const startedAt = performance.now();

    // When
    for (let run = 0; run < 5; run += 1) {
      expect(new KanoodleSolver(createEmptyBoard(layout), layout).solve()).not.toBeNull();
    }

    // Then
    expect(performance.now() - startedAt).toBeLessThan(1_000);
  });

  it("preserves a seeded piece when completing the board", () => {
    // Given
    const layout = BOARD_LAYOUTS[0];
    const seededBoard = placePieceOnBoard(
      createEmptyBoard(layout),
      PIECES[0],
      0,
      0,
      0,
      false,
    );
    const solver = new KanoodleSolver(seededBoard, layout);

    // When
    const solution = solver.solve();

    // Then
    expect(solution?.some(({ piece }) => piece.name === PIECES[0].name)).toBe(true);
    expect(solver.getSolution()[0][0]).toBe(PIECES[0].name);
  });

  it("returns a hint that belongs to a complete solution", () => {
    // Given
    const layout = BOARD_LAYOUTS[0];
    const emptyBoard = createEmptyBoard(layout);
    const solver = new KanoodleSolver(emptyBoard, layout);

    // When
    const hint = solver.getHint();

    // Then
    expect(hint).not.toBeNull();
    if (hint === null) {
      return;
    }
    const hintedBoard = placePieceOnBoard(
      emptyBoard,
      hint.piece,
      hint.x,
      hint.y,
      hint.rotation,
      hint.flipped,
    );
    expect(new KanoodleSolver(hintedBoard, layout).solve()).not.toBeNull();
  });

  it("rejects a layout whose area cannot match the pieces", () => {
    // Given
    const layout = BOARD_LAYOUTS[1];
    const solver = new KanoodleSolver(createEmptyBoard(layout), layout);

    // When
    const solution = solver.solve();

    // Then
    expect(solution).toBeNull();
  });
});
