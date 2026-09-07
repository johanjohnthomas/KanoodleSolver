'use client';

import { ArrowClockwiseIcon, ArrowCounterClockwiseIcon, ArrowsHorizontalIcon } from '@phosphor-icons/react';

import type { useTabletop } from '@/hooks/useTabletop';

type Controller = ReturnType<typeof useTabletop>;

export function FlatTransformControls({ table }: Readonly<{ table: Controller }>) {
  const held = table.held;
  const disabled = held === null || table.game.busy;
  const rotation = held ? ((held.rotation % 4 + 4) % 4) * 90 : 0;
  const summary = held
    ? `Piece ${held.piece.name} · ${rotation}° · ${held.flipped ? 'turned over' : 'face up'}`
    : 'Choose a piece to turn it';

  return <div className="flat-transform-bar">
    <p aria-live="polite">{summary}</p>
    <div className="flat-transform-actions" role="group" aria-label="2D piece orientation">
      <button type="button" aria-label="Turn piece left" disabled={disabled} onClick={() => table.transform('left')}><ArrowCounterClockwiseIcon aria-hidden="true" /></button>
      <button type="button" aria-label="Turn piece right" disabled={disabled} onClick={() => table.transform('right')}><ArrowClockwiseIcon aria-hidden="true" /></button>
      <button type="button" aria-label="Turn piece over" disabled={disabled} onClick={() => table.transform('flip')}><ArrowsHorizontalIcon aria-hidden="true" /></button>
    </div>
  </div>;
}
