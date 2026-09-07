'use client';

import { useState } from 'react';

import { cellsForPlacement } from '@/lib/pieceGeometry';
import type { useTabletop } from '@/hooks/useTabletop';

type Controller = ReturnType<typeof useTabletop>;
type Origin = Readonly<{ x: number; y: number }>;

export function useFlatBoardPreview(table: Controller) {
  const [origin, setOrigin] = useState<Origin | null>(null);
  const held = table.held;
  if (held === null || origin === null) {
    return { cells: new Set<string>(), clear: () => setOrigin(null), previewAt: (x: number, y: number) => setOrigin({ x, y }), status: null, valid: false };
  }

  const request = { ...held, ...origin };
  const valid = table.game.canDrop(request);
  const cells = new Set(cellsForPlacement(held.piece, origin.x, origin.y, held.rotation, held.flipped).map(({ x, y }) => `${x}:${y}`));
  return {
    cells,
    clear: () => setOrigin(null),
    previewAt: (x: number, y: number) => setOrigin({ x, y }),
    status: valid
      ? `Piece ${held.piece.name} fits here. Choose this cell to place it.`
      : `Piece ${held.piece.name} does not fit here. Try another cell or orientation.`,
    valid,
  };
}
