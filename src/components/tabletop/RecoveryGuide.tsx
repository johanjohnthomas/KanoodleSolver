'use client';

import { ArrowUpIcon } from '@phosphor-icons/react';
import { m } from 'motion/react';
import type { useTabletop } from '@/hooks/useTabletop';

export function RecoveryGuide({ table }: Readonly<{ table: ReturnType<typeof useTabletop> }>) {
  const suggestion = table.game.recovery;
  if (!suggestion) return null;
  const count = suggestion.removeNames.length;
  const kept = table.game.placements.length - count;
  return <m.section className="recovery-guide" role="status" aria-live="polite" aria-label="Closest solution guidance"
    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <div className="recovery-copy">
      <h2>Lift {count} {count === 1 ? 'piece' : 'pieces'} to keep going</h2>
      <p>{kept > 0 ? `One closest completion keeps the other ${kept} ${kept === 1 ? 'piece' : 'pieces'} exactly in place.` : 'These are the fewest pieces to lift for a complete board.'}</p>
      <div className="recovery-pieces" aria-label="Pieces suggested to lift">
        {suggestion.removeNames.map(name => <button type="button" key={name} disabled={table.game.busy}
          aria-label={`Select highlighted piece ${name}`} onClick={() => {
            const placed = table.game.placements.find(({ piece }) => piece.name === name);
            if (placed) table.pick(placed.piece);
          }}>{name}<ArrowUpIcon aria-hidden="true" /></button>)}
      </div>
    </div>
    <button type="button" className="recovery-lift" disabled={table.game.busy} onClick={() => table.operate(table.game.applyRecovery)}>
      Lift highlighted pieces
    </button>
  </m.section>;
}
