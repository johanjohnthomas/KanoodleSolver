'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { m } from 'motion/react';

import { occupiedCells, getPieceShape } from '@/lib/pieceGeometry';
import { BEAD_COLORS, beadStyle } from '@/lib/tabletop';
import type { Piece } from '@/lib/types';

type FlatPieceProps = Readonly<{
  piece: Piece;
  rotation?: number;
  flipped?: boolean;
}>;

type PieceStyle = CSSProperties & Readonly<{
  '--piece-columns': number;
  '--piece-rows': number;
}>;

export function FlatPiece({ piece, rotation = 0, flipped = false }: FlatPieceProps) {
  const normalizedRotation = ((rotation % 4) + 4) % 4;
  const previous = useRef({ rotation: normalizedRotation, flipped });
  const delta = normalizedRotation - previous.current.rotation;
  const entryRotation = delta === 1 || delta === -3 ? -90 : delta === -1 || delta === 3 ? 90 : 0;
  const flipChanged = previous.current.flipped !== flipped;
  const entryScaleX = flipChanged && normalizedRotation % 2 === 0 ? -1 : 1;
  const entryScaleY = flipChanged && normalizedRotation % 2 === 1 ? -1 : 1;
  const cells = occupiedCells(getPieceShape(piece, rotation, flipped));
  const occupied = new Set(cells.map(({ x, y }) => `${x}:${y}`));
  const columns = Math.max(...cells.map(({ x }) => x)) + 1;
  const rows = Math.max(...cells.map(({ y }) => y)) + 1;
  const style: PieceStyle = {
    ...beadStyle(BEAD_COLORS[piece.name]),
    '--piece-columns': columns,
    '--piece-rows': rows,
  };
  useEffect(() => {
    previous.current = { rotation: normalizedRotation, flipped };
  }, [flipped, normalizedRotation]);

  return <m.span
    className="flat-piece-motion"
    aria-hidden="true"
    data-piece-orientation={`${normalizedRotation}:${flipped ? 'flipped' : 'face'}`}
    key={`${normalizedRotation}:${flipped}`}
    initial={{ rotate: entryRotation, scaleX: entryScaleX, scaleY: entryScaleY }}
    animate={{ rotate: 0, scaleX: 1, scaleY: 1 }}
    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
  >
    <span className="flat-piece" style={style}>
      {cells.map(({ x, y }) => <span
        className="flat-piece-bead"
        data-testid="flat-piece-bead"
        data-x={x}
        data-y={y}
        data-right={occupied.has(`${x + 1}:${y}`) || undefined}
        data-down={occupied.has(`${x}:${y + 1}`) || undefined}
        key={`${x}:${y}`}
        style={{ gridColumn: x + 1, gridRow: y + 1 }}
      />)}
    </span>
  </m.span>;
}
