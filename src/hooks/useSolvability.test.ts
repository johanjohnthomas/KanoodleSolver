import { act, renderHook, waitFor } from "@testing-library/react";

import { PIECES } from "@/lib/pieces";

import { useKanoodleGame } from "./useKanoodleGame";

const blockedA = {
  piece: PIECES[0],
  x: 9,
  y: 0,
  rotation: 0,
  flipped: false,
  movingName: null,
};

describe("useKanoodleGame solvability checks", () => {
  it("reports a solvable layout without changing the board, placements, or history", async () => {
    // Given
    const { result } = renderHook(() => useKanoodleGame());
    const boardBeforeCheck = result.current.board;
    const placementsBeforeCheck = result.current.placements;

    // When
    act(() => result.current.checkSolvability());

    // Then
    expect(result.current.busy).toBe(true);
    expect(result.current.message).toBe("Checking whether this layout can be completed…");
    await waitFor(() => expect(result.current.busy).toBe(false));
    expect(result.current.message).toBe("This layout is solvable. No pieces changed.");
    expect(result.current.board).toEqual(boardBeforeCheck);
    expect(result.current.placements).toEqual(placementsBeforeCheck);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.recovery).toBeNull();
  });

  it("reports an unsolvable layout while clearing recovery without changing pieces or history", async () => {
    // Given
    const { result } = renderHook(() => useKanoodleGame());
    act(() => result.current.dropPiece(blockedA));
    act(() => result.current.solveBoard());
    await waitFor(() => expect(result.current.recovery).not.toBeNull());
    const boardBeforeCheck = result.current.board;
    const placementsBeforeCheck = result.current.placements;

    // When
    act(() => result.current.checkSolvability());

    // Then
    expect(result.current.busy).toBe(true);
    expect(result.current.recovery).toBeNull();
    await waitFor(() => expect(result.current.busy).toBe(false));
    expect(result.current.message).toBe("This layout cannot be completed as it is. No pieces changed.");
    expect(result.current.board).toEqual(boardBeforeCheck);
    expect(result.current.placements).toEqual(placementsBeforeCheck);
    expect(result.current.recovery).toBeNull();
    expect(result.current.hasSolverError).toBe(false);
    act(() => result.current.undo());
    expect(result.current.placements).toHaveLength(0);
  });
});
