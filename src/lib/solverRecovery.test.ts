import { describe, expect, it } from "@jest/globals";

import {
  cellsForPlacement,
  createEmptyBoard,
  placePieceOnBoard,
} from "./pieceGeometry";
import { BOARD_LAYOUTS, PIECES } from "./pieces";
import { KanoodleSolver } from "./solver";
import { findClosestRecovery } from "./solverRecovery";
import type { BoardLayout, PlacedPiece } from "./types";

const standardLayout = (): BoardLayout => BOARD_LAYOUTS[0];

const placed = (
  name: string,
  placement: Readonly<Pick<PlacedPiece, "x" | "y" | "rotation" | "flipped">>,
): PlacedPiece => {
  const piece = PIECES.find((candidate) => candidate.name === name);
  if (piece === undefined) {
    throw new Error(`Unknown test piece: ${name}`);
  }
  return { piece, ...placement };
};

const boardFrom = (placements: readonly PlacedPiece[], layout: BoardLayout) =>
  placements.reduce(
    (board, placement) => placePieceOnBoard(
      board,
      placement.piece,
      placement.x,
      placement.y,
      placement.rotation,
      placement.flipped,
    ),
    createEmptyBoard(layout),
  );

describe("findClosestRecovery", () => {
  it("removes one dead-end piece and returns a complete solution", async () => {
    // Given
    const layout = standardLayout();
    const placements = [placed("A", { x: 9, y: 0, rotation: 0, flipped: false })];

    // When
    const recovery = await findClosestRecovery(placements, layout);

    // Then
    expect(recovery?.removeNames).toEqual(["A"]);
    expect(recovery?.solution).toHaveLength(PIECES.length);
    expect(
      recovery?.solution.flatMap((placement) =>
        cellsForPlacement(
          placement.piece,
          placement.x,
          placement.y,
          placement.rotation,
          placement.flipped,
        ),
      ),
    ).toHaveLength(55);
    expect(new Set(
      recovery?.solution.flatMap((placement) =>
        cellsForPlacement(
          placement.piece,
          placement.x,
          placement.y,
          placement.rotation,
          placement.flipped,
        ).map(({ x, y }) => `${x}:${y}`),
      ),
    ).size).toBe(55);
  });

  it("removes two pieces when every single removal remains unsolvable", async () => {
    // Given
    const layout = standardLayout();
    const retained = placed("D", { x: 0, y: 2, rotation: 2, flipped: false });
    const placements = [
      retained,
      placed("A", { x: 9, y: 0, rotation: 0, flipped: false }),
      placed("B", { x: 0, y: 1, rotation: 0, flipped: false }),
    ];
    expect(new KanoodleSolver(boardFrom(placements, layout), layout).solve()).toBeNull();
    for (const removedName of placements.map(({ piece }) => piece.name)) {
      const singleRemoval = placements.filter(({ piece }) => piece.name !== removedName);
      expect(new KanoodleSolver(boardFrom(singleRemoval, layout), layout).solve()).toBeNull();
    }

    // When
    const recovery = await findClosestRecovery(placements, layout);

    // Then
    expect(recovery?.removeNames).toEqual(["B", "A"]);
    expect(recovery?.solution.find(({ piece }) => piece.name === "D")).toEqual(retained);
  });

  it("returns no removals when the arrangement is already solvable", async () => {
    // Given
    const layout = standardLayout();
    const placements: readonly PlacedPiece[] = [];

    // When
    const recovery = await findClosestRecovery(placements, layout);

    // Then
    expect(recovery?.removeNames).toEqual([]);
    expect(recovery?.solution).toHaveLength(PIECES.length);
  });

  it("yields to the event loop before solver attempts", async () => {
    // Given
    const layout = standardLayout();
    let browserTurnRan = false;
    setTimeout(() => {
      browserTurnRan = true;
    }, 0);

    // When
    await findClosestRecovery([], layout);

    // Then
    expect(browserTurnRan).toBe(true);
  });

  it("returns null when the layout itself cannot be solved", async () => {
    // Given
    const layout = BOARD_LAYOUTS[1];

    // When
    const recovery = await findClosestRecovery([], layout);

    // Then
    expect(recovery).toBeNull();
  });

  it("does not mutate the placements or nested piece data", async () => {
    // Given
    const layout = standardLayout();
    const placements = [placed("A", { x: 9, y: 0, rotation: 0, flipped: false })];
    const snapshot = JSON.stringify(placements);

    // When
    await findClosestRecovery(placements, layout);

    // Then
    expect(JSON.stringify(placements)).toBe(snapshot);
  });

  it("is deterministic for equivalent calls", async () => {
    // Given
    const layout = standardLayout();
    const placements = [
      placed("A", { x: 0, y: 0, rotation: 0, flipped: false }),
      placed("B", { x: 1, y: 1, rotation: 0, flipped: false }),
    ];

    // When
    const first = await findClosestRecovery(placements, layout);
    const second = await findClosestRecovery(placements, layout);

    // Then
    expect(first?.removeNames).toEqual(["B"]);
    expect(second).toEqual(first);
  });

  it("uses the actual solver for the independently reconstructed board", async () => {
    // Given
    const layout = standardLayout();
    const placements = [placed("A", { x: 9, y: 0, rotation: 0, flipped: false })];

    // When
    const recovery = await findClosestRecovery(placements, layout);

    // Then
    expect(recovery).not.toBeNull();
    if (recovery === null) {
      return;
    }
    expect(new KanoodleSolver(boardFrom(recovery.solution, layout), layout).solve()).not.toBeNull();
  });
});
