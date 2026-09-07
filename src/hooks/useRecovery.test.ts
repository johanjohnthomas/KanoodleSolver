import { act, renderHook, waitFor } from '@testing-library/react';
import { useKanoodleGame } from './useKanoodleGame';
import { PIECES } from '@/lib/pieces';

const blockedA = { piece: PIECES[0], x: 9, y: 0, rotation: 0, flipped: false, movingName: null };

it.each(['solveBoard', 'getHint'] as const)('%s suggests the minimal removal without changing the board', async action => {
  const { result } = renderHook(() => useKanoodleGame());
  act(() => { result.current.dropPiece(blockedA); });
  const before = result.current.board;
  act(() => result.current[action]());
  await waitFor(() => expect(result.current.busy).toBe(false));
  expect(result.current.recovery?.removeNames).toEqual(['A']);
  expect(result.current.recovery?.solution).toHaveLength(12);
  expect(result.current.board).toEqual(before);
});

it('lifts the suggested pieces as one undoable board change', async () => {
  const { result } = renderHook(() => useKanoodleGame());
  act(() => { result.current.dropPiece(blockedA); });
  act(() => result.current.solveBoard());
  await waitFor(() => expect(result.current.recovery).not.toBeNull());
  const before = result.current.board;
  act(() => result.current.applyRecovery());
  expect(result.current.placements).toHaveLength(0);
  expect(result.current.recovery).toBeNull();
  act(() => result.current.undo());
  expect(result.current.board).toEqual(before);
  expect(result.current.placements).toHaveLength(1);
});

it('clears stale suggestions when the board changes', async () => {
  const { result } = renderHook(() => useKanoodleGame());
  act(() => { result.current.dropPiece(blockedA); });
  act(() => result.current.getHint());
  await waitFor(() => expect(result.current.recovery).not.toBeNull());
  act(() => result.current.clear());
  expect(result.current.recovery).toBeNull();
});
