'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useKanoodleGame } from './useKanoodleGame';
import { useSoundEffects } from './useSoundEffects';
import { canReturnToDesk, dropOrigin, isOverBoard } from '@/lib/tabletop';
import type { DeskPoint, HeldPiece } from '@/lib/tabletop';
import type { Piece } from '@/lib/types';

export function useTabletop() {
  const game = useKanoodleGame();
  const sound = useSoundEffects();
  const [held, setHeld] = useState<HeldPiece | null>(null);
  const [pointer, setPointer] = useState<DeskPoint | null>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState('Pick up a piece. See where it takes you.');
  const { play } = sound;
  const previousMessage = useRef(game.message);
  useEffect(() => {
    if (previousMessage.current === game.message) return;
    previousMessage.current = game.message;
    if (game.message.startsWith('Board solved')) play('solve');
    else if (game.hasSolverError) play('error');
    else if (game.message.startsWith('Hint placed')) play('place');
  }, [game.message, game.hasSolverError, play]);

  const pick = (piece: Piece): void => {
    if (game.busy) return;
    const placed = game.placements.find(p => p.piece.name === piece.name);
    setHeld(current => current?.piece.name === piece.name ? current : { piece, rotation: placed?.rotation ?? 0, flipped: placed?.flipped ?? false, movingName: placed ? piece.name : null });
    setPointer(null);
    setNotice(`Piece ${piece.name} in hand. Rotate, flip, or choose a spot.`);
    play('pickup');
  };
  const transform = useCallback((action: 'left' | 'right' | 'flip'): void => {
    setHeld(current => {
      if (!current) return null;
      return action === 'flip' ? { ...current, flipped: !current.flipped } : {
        ...current, rotation: current.rotation + (action === 'left' ? -1 : 1),
      };
    });
    play(action === 'flip' ? 'flip' : 'rotate');
  }, [play]);
  const cancel = useCallback((): void => {
    setHeld(null); setPointer(null); setDragging(false);
    setNotice('Piece put back. Your board is unchanged.');
  }, []);
  useEffect(() => {
    if (!held) return;
    const keydown = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.target instanceof HTMLSelectElement) return;
      const key = event.key.toLowerCase();
      if (!['a', 'd', 'r', 'f', 'escape'].includes(key)) return;
      event.preventDefault();
      if (key === 'escape') cancel();
      else transform(key === 'f' ? 'flip' : key === 'a' ? 'left' : 'right');
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [held, cancel, transform]);

  const request = held && pointer && isOverBoard(pointer) ? { ...held, ...dropOrigin(held, pointer) } : null;
  const valid = request !== null && game.canDrop(request);
  const returningToDesk = held !== null && pointer !== null && canReturnToDesk(held, pointer);
  const drop = (point: DeskPoint): void => {
    setDragging(false);
    if (!held || game.busy) return;
    if (canReturnToDesk(held, point)) {
      remove();
    } else if (isOverBoard(point) && game.dropPiece({ ...held, ...dropOrigin(held, point) })) {
      setNotice(`Piece ${held.piece.name} settled into place.`); play('place'); setHeld(null);
    } else {
      setNotice(isOverBoard(point) ? 'That spot doesn’t fit. Try a turn or another space.' : 'Nothing changed. Drop fully on the tabletop to return a placed piece.');
      play('invalid');
    }
    setPointer(null);
  };
  const operate = (action: () => void): void => {
    setHeld(null); setPointer(null); setDragging(false); setNotice(''); action();
  };
  const remove = (): void => {
    if (!held?.movingName) return;
    const row = game.board.findIndex(cells => cells.includes(held.movingName));
    const column = game.board[row]?.indexOf(held.movingName) ?? -1;
    if (row >= 0 && column >= 0) game.handleCell(column, row);
    setHeld(null); setNotice('Piece returned to the desk.'); play('pickup');
  };
  return { game, sound, held, pointer, dragging, notice, request, valid, returningToDesk, pick, transform, cancel, drop, operate, remove,
    move: setPointer,
    startDrag: () => setDragging(true),
  };
}
