'use client';

import { useState } from 'react';
import { m } from 'motion/react';

import { BEAD_COLORS, placementCenter, beadStyle } from '@/lib/tabletop';
import type { useTabletop } from '@/hooks/useTabletop';
import { FlatPiecePalette } from './FlatPiecePalette';
import { FlatTransformControls } from './FlatTransformControls';
import { useFlatBoardPreview } from './useFlatBoardPreview';
import { RecoveryGuide } from './RecoveryGuide';

export function AccessibleBoard({ table }: Readonly<{ table: ReturnType<typeof useTabletop> }>) {
  const [precision, setPrecision] = useState(false);
  const preview = useFlatBoardPreview(table);
  const dropAt = (x: number, y: number): void => {
    if (!table.held) return;
    const valid = table.game.canDrop({ ...table.held, x, y });
    table.drop(placementCenter(table.held.piece, x, y, table.held.rotation, table.held.flipped));
    if (valid) preview.clear();
    else preview.previewAt(x, y);
  };

  return <section className="flat-board-section" aria-label="Accessible 2D board">
    <div className="flat-board-heading">
      <div><h3>Set the pieces in the case</h3><p>Choose a piece, turn it if needed, then choose its top-left cell.</p></div>
      <button type="button" className="flat-size-toggle" aria-pressed={precision} onClick={() => setPrecision(value => !value)}>
        {precision ? 'Fit board to screen' : 'Use larger cells'}
      </button>
    </div>
    <div className="flat-board-scroll" data-precision={precision || undefined} tabIndex={precision ? 0 : -1} aria-label={precision ? 'Scrollable puzzle board' : undefined}>
      <div className="flat-board" role="grid" aria-label="Kanoodle board">
        {table.game.board.flatMap((row, y) => row.map((name, x) => {
          const isPreview = preview.cells.has(`${x}:${y}`);
          const right = name !== null && row[x + 1] === name;
          const down = name !== null && table.game.board[y + 1]?.[x] === name;
          return <button key={`${x}:${y}`} type="button" role="gridcell" className="flat-board-cell"
            data-board-x={x} data-board-y={y} data-piece={name ?? undefined}
            data-recovery={name !== null && table.game.recovery?.removeNames.includes(name) || undefined}
            data-preview={isPreview ? (preview.valid ? 'valid' : 'invalid') : undefined}
            data-connect-right={right || undefined} data-connect-down={down || undefined}
            aria-label={`Row ${y + 1}, column ${x + 1}, ${name ? `piece ${name}` : 'empty'}`}
            disabled={table.game.busy}
            style={name ? beadStyle(BEAD_COLORS[name]) : undefined}
            onBlur={preview.clear}
            onFocus={() => preview.previewAt(x, y)}
            onMouseEnter={() => preview.previewAt(x, y)}
            onPointerEnter={() => preview.previewAt(x, y)}
            onDragEnter={() => preview.previewAt(x, y)}
            onDragOver={event => { if (table.held) event.preventDefault(); }}
            onDrop={event => {
              event.preventDefault();
              dropAt(x, y);
            }}
            onClick={() => {
              if (table.held) dropAt(x, y);
              else if (name) {
                const piece = table.game.placements.find(placement => placement.piece.name === name)?.piece;
                if (piece) table.pick(piece);
                preview.clear();
              }
            }}>
            {name && <m.span className="flat-board-bead" key={name} initial={{ scale: .72 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>{name}</m.span>}
          </button>;
        }))}
      </div>
    </div>
    <RecoveryGuide table={table} />
    <p className="flat-preview-status" role="status" aria-live="polite" data-valid={preview.status && preview.valid || undefined} data-invalid={preview.status && !preview.valid || undefined}>
      {preview.status ?? 'Hover or focus a cell to see the exact footprint.'}
    </p>
    <FlatTransformControls table={table} />
    <FlatPiecePalette table={table} />
  </section>;
}
