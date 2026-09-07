'use client';

import { PIECES } from '@/lib/pieces';
import type { useTabletop } from '@/hooks/useTabletop';
import { FlatPiece } from './FlatPiece';

type Controller = ReturnType<typeof useTabletop>;

export function FlatPiecePalette({ table }: Readonly<{ table: Controller }>) {
  return <div className="flat-palette" role="group" aria-label="2D piece palette">
    {PIECES.map(piece => {
      const selected = table.held?.piece.name === piece.name;
      return <button
        type="button"
        className="flat-palette-piece"
        key={piece.name}
        aria-label={`Select piece ${piece.name}`}
        aria-pressed={selected}
        data-placed={table.game.placedNames.has(piece.name) || undefined}
        disabled={table.game.busy}
        draggable={!table.game.busy}
        onClick={() => table.pick(piece)}
        onDragStart={event => {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', piece.name);
          table.pick(piece);
        }}
      >
        <FlatPiece
          piece={piece}
          rotation={selected ? table.held?.rotation : 0}
          flipped={selected ? table.held?.flipped : false}
        />
        <span className="flat-palette-letter">{piece.name}</span>
      </button>;
    })}
  </div>;
}
