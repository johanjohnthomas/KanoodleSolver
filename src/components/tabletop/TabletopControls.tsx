'use client';

import { ArrowCounterClockwiseIcon, ArrowClockwiseIcon, ArrowsHorizontalIcon, CheckIcon, LightbulbIcon, RewindIcon, XIcon } from '@phosphor-icons/react';
import { m } from 'motion/react';
import { InstrumentButton } from '../InstrumentButton';
import { BEAD_COLORS, beadStyle } from '@/lib/tabletop';
import { PIECES } from '@/lib/pieces';
import type { useTabletop } from '@/hooks/useTabletop';

type Controller = ReturnType<typeof useTabletop>;

export function TabletopControls({ table }: Readonly<{ table: Controller }>) {
  const { held, game } = table;
  const rotation = held ? ((held.rotation % 4 + 4) % 4) * 90 : 0;
  const idleTitle = game.placements.length === 12 ? 'Every piece in place' : game.placements.length ? 'Find the next fit' : 'Make your first move';
  const idleDescription = game.placements.length === 12 ? 'Ready for another challenge?' : 'Choose any piece on the desk';
  return <>
    <section className="tabletop-dock" aria-label="Piece and puzzle controls">
      <div className="hand-status">
        <span className="hand-bead" style={beadStyle(held ? BEAD_COLORS[held.piece.name] : 'var(--desk-line)')}>{held?.piece.name ?? '·'}</span>
        <span><strong>{held ? `Piece ${held.piece.name}` : idleTitle}</strong><small>{held ? `${rotation}° · ${held.flipped ? 'turned over' : 'face up'}` : idleDescription}</small></span>
      </div>
      <div className="turn-controls">
        <InstrumentButton label="Rotate left" icon={<ArrowCounterClockwiseIcon />} onClick={() => table.transform('left')} disabled={!held || game.busy} />
        <InstrumentButton label="Rotate right" icon={<ArrowClockwiseIcon />} onClick={() => table.transform('right')} disabled={!held || game.busy} />
        <InstrumentButton label="Flip" icon={<ArrowsHorizontalIcon />} onClick={() => table.transform('flip')} disabled={!held || game.busy} />
      </div>
      <div className="solve-controls">
        <InstrumentButton label="Undo" icon={<RewindIcon />} onClick={() => table.operate(game.undo)} disabled={!game.canUndo || game.busy} />
        <InstrumentButton label="Hint" icon={<LightbulbIcon />} onClick={() => table.operate(game.getHint)} disabled={game.busy || game.placements.length === 12} />
        <InstrumentButton label={game.busy ? 'Working…' : game.placements.length === 12 ? 'New puzzle' : 'Solve board'} tone="copper" icon={<CheckIcon />}
          onClick={() => table.operate(game.placements.length === 12 ? () => game.newChallenge(4) : game.solveBoard)} disabled={game.busy} />
      </div>
    </section>
    <div className="tabletop-under-dock">
      <div className="piece-rail" role="group" aria-label="Choose a piece">
        {PIECES.map(piece => <m.button type="button" key={piece.name} aria-label={`Piece ${piece.name}`}
          aria-pressed={held?.piece.name === piece.name} data-placed={game.placedNames.has(piece.name) || undefined}
          data-recovery={game.recovery?.removeNames.includes(piece.name) || undefined}
          style={beadStyle(BEAD_COLORS[piece.name])}
          onClick={() => table.pick(piece)} disabled={game.busy} whileTap={{ scale: .92 }}>
          <span className="rail-bead" /><span>{piece.name}</span>{game.placedNames.has(piece.name) && <CheckIcon aria-hidden="true" className="rail-check" />}
        </m.button>)}
      </div>
      {held ? <div className="hand-actions">
        {held.movingName && <button type="button" onClick={table.remove}>Return to desk</button>}
        <button type="button" onClick={table.cancel}><XIcon aria-hidden="true" /> Put down <kbd>Esc</kbd></button>
      </div> : <p className="keyboard-legend"><kbd>A</kbd> / <kbd>D</kbd> rotate <span>·</span> <kbd>F</kbd> flip</p>}
    </div>
  </>;
}
