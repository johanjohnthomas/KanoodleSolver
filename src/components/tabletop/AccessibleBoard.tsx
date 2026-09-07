'use client';

import { BEAD_COLORS, placementCenter, beadStyle } from '@/lib/tabletop';
import type { useTabletop } from '@/hooks/useTabletop';

export function AccessibleBoard({ table }: Readonly<{ table: ReturnType<typeof useTabletop> }>) {
  return <section className="flat-board-section" aria-label="Accessible 2D board">
    <p>Choose a piece below, set its orientation, then choose its top-left board cell.</p>
    <div className="flat-board-scroll" tabIndex={0} aria-label="Scrollable puzzle board">
      <div className="flat-board" role="grid" aria-label="Kanoodle board">
        {table.game.board.flatMap((row, y) => row.map((name, x) => <button key={`${x}:${y}`} type="button" role="gridcell"
          data-board-x={x} data-board-y={y} data-piece={name ?? undefined}
          aria-label={`Row ${y + 1}, column ${x + 1}, ${name ? `piece ${name}` : 'empty'}`}
          disabled={table.game.busy}
          style={name ? beadStyle(BEAD_COLORS[name]) : undefined}
          onClick={() => {
            if (table.held) table.drop(placementCenter(table.held.piece, x, y, table.held.rotation, table.held.flipped));
            else if (name) { const piece = table.game.placements.find(p => p.piece.name === name)?.piece; if (piece) table.pick(piece); }
          }}>{name}</button>))}
      </div>
    </div>
  </section>;
}
