import { act, renderHook } from '@testing-library/react';
import { useTabletop } from './useTabletop';
import { PIECES } from '@/lib/pieces';

function placedPiece() {
  const hook = renderHook(() => useTabletop());
  act(() => { hook.result.current.game.dropPiece({ piece: PIECES[0], x: 0, y: 0, rotation: 0, flipped: false, movingName: null }); });
  act(() => hook.result.current.pick(PIECES[0]));
  return hook;
}

it('returns a placed piece when dropped on the desk', () => {
  const { result } = placedPiece();
  act(() => result.current.drop({ x: -8, z: -2 }));
  expect(result.current.game.placements).toHaveLength(0);
  expect(result.current.game.board.flat().filter(Boolean)).toHaveLength(0);
  expect(result.current.held).toBeNull();
});

it('restores the exact placement when a desk return is undone', () => {
  const { result } = placedPiece();
  const before = result.current.game.placements;
  act(() => result.current.drop({ x: -8, z: -2 }));
  act(() => result.current.game.undo());
  expect(result.current.game.placements).toEqual(before);
});

it.each([{ x: 20, z: 0 }, { x: 5.8, z: 0 }, { x: 0, z: 2.5 }, { x: 11, z: 0 }])('preserves a placed piece for an unsafe return at %j', point => {
  const { result } = placedPiece();
  const before = result.current.game.board;
  act(() => result.current.drop(point));
  expect(result.current.game.board).toEqual(before);
  expect(result.current.game.placements).toHaveLength(1);
});

it('preserves the board when pickup is cancelled', () => {
  const { result } = placedPiece();
  const before = result.current.game.board;
  act(() => result.current.cancel());
  expect(result.current.game.board).toEqual(before);
});

it('previews a safe desk return without changing the board', () => {
  const { result } = placedPiece();
  act(() => result.current.move({ x: -8, z: -2 }));
  expect(result.current.returningToDesk).toBe(true);
  expect(result.current.game.placements).toHaveLength(1);
});
