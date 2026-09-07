import {
  createEmptyBoard,
  placePieceOnBoard,
} from "./pieceGeometry";
import { KanoodleSolver } from "./solver";
import type { Board, BoardLayout, PlacedPiece } from "./types";

export type SolverRecovery = Readonly<{
  removeNames: readonly string[];
  solution: readonly PlacedPiece[];
}>;

const boardFromPlacements = (
  placements: readonly PlacedPiece[],
  layout: BoardLayout,
): Board => placements.reduce(
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

const removalCombinations = (
  placementCount: number,
  removalCount: number,
): readonly (readonly number[])[] => {
  const combinations: number[][] = [];
  const selected: number[] = [];

  const visit = (highestAvailable: number): void => {
    if (selected.length === removalCount) {
      combinations.push([...selected]);
      return;
    }

    const stillNeeded = removalCount - selected.length;
    for (let index = highestAvailable; index >= stillNeeded - 1; index -= 1) {
      selected.push(index);
      visit(index - 1);
      selected.pop();
    }
  };

  visit(placementCount - 1);
  return combinations;
};

const yieldToBrowser = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

export async function findClosestRecovery(
  placements: readonly PlacedPiece[],
  layout: BoardLayout,
): Promise<SolverRecovery | null> {
  const emptySolution = new KanoodleSolver(createEmptyBoard(layout), layout).solve();
  if (emptySolution === null) {
    return null;
  }

  for (let removalCount = 0; removalCount <= placements.length; removalCount += 1) {
    for (const removedIndices of removalCombinations(placements.length, removalCount)) {
      await yieldToBrowser();
      const removed = new Set(removedIndices);
      const retained = placements.filter((_, index) => !removed.has(index));
      const solution = retained.length === 0
        ? emptySolution
        : new KanoodleSolver(boardFromPlacements(retained, layout), layout).solve();
      if (solution === null) {
        continue;
      }

      const retainedByName = new Map(
        retained.map((placement) => [placement.piece.name, placement]),
      );
      return {
        removeNames: removedIndices.map((index) => placements[index].piece.name),
        solution: solution.map(
          (placement) => retainedByName.get(placement.piece.name) ?? placement,
        ),
      };
    }
  }

  return { removeNames: placements.map(({ piece }) => piece.name), solution: emptySolution };
}
