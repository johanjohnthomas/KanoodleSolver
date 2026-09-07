import { act, renderHook, waitFor } from "@testing-library/react";

import { useKanoodleGame } from "./useKanoodleGame";
import { cellsForPlacement } from "@/lib/pieceGeometry";

describe("useKanoodleGame challenge reset", () => {
  it("restores seed placement metadata after a piece is moved or removed", async () => {
    const { result } = renderHook(() => useKanoodleGame());

    act(() => result.current.newChallenge(4));
    await waitFor(() => expect(result.current.busy).toBe(false));

    const starting = result.current.placements;
    const seed = starting[0];
    const movedRequest = Array.from({ length: result.current.layout.rows }, (_, y) =>
      Array.from({ length: result.current.layout.cols }, (_, x) => ({
        piece: seed.piece,
        x,
        y,
        rotation: seed.rotation,
        flipped: seed.flipped,
        movingName: seed.piece.name,
      })),
    ).flat().find((request) =>
      (request.x !== seed.x || request.y !== seed.y) && result.current.canDrop(request),
    );

    expect(movedRequest).toBeDefined();
    if (movedRequest === undefined) return;

    act(() => result.current.dropPiece(movedRequest));
    act(() => result.current.reset());
    expect(result.current.placements).toEqual(starting);

    const occupiedCell = cellsForPlacement(
      seed.piece,
      seed.x,
      seed.y,
      seed.rotation,
      seed.flipped,
    )[0];
    act(() => result.current.handleCell(occupiedCell.x, occupiedCell.y));
    expect(result.current.placements).toHaveLength(starting.length - 1);

    act(() => result.current.reset());
    expect(result.current.placements).toEqual(starting);
  });
});
