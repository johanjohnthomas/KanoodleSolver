'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { AnimatePresence, domAnimation, LazyMotion, MotionConfig, useReducedMotion, m } from 'motion/react';
import { ArrowCounterClockwiseIcon, ArrowUpRightIcon, CubeIcon, GridFourIcon, QuestionIcon } from '@phosphor-icons/react';
import { useTabletop } from '@/hooks/useTabletop';
import { DESK_THEME } from '@/lib/tabletop';
import { SoundToggle } from '../SoundToggle';
import { TabletopControls } from './TabletopControls';
import { AccessibleBoard } from './AccessibleBoard';
import { SolverFeedback } from '../SolverFeedback';
import { SceneBoundary } from './SceneBoundary';

const Scene = dynamic(() => import('./TabletopScene').then(module => module.TabletopScene), {
  ssr: false, loading: () => <div className="scene-loading" role="status">Setting your pieces on the desk…</div>,
});

export function TabletopWorkbench() {
  const table = useTabletop();
  const [flat, setFlat] = useState(false);
  const [overhead, setOverhead] = useState(false);
  const [help, setHelp] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const unavailable = useCallback(() => setFlat(true), []);
  const status = table.request ? (table.valid ? 'Fits here. Release to place.' : 'Not quite. Try another spot or orientation.') : table.notice || table.game.message;

  return <LazyMotion features={domAnimation}><MotionConfig reducedMotion="user">
    <main className="tabletop-shell" style={DESK_THEME}>
      <a className="desk-skip" href="#tabletop-controls">Skip to puzzle controls</a>
      <header className="tabletop-header">
        <a className="tabletop-brand" href="./"><span className="brand-beads" aria-hidden="true"><i /><i /><i /><i /></span><h1>Kanoodle<span>Solver</span></h1></a>
        <div className="header-tools">
          <SoundToggle enabled={table.sound.enabled} onToggle={table.sound.toggle} />
          <button type="button" className="desk-tool" onClick={() => setFlat(value => !value)} aria-pressed={flat}>
            {flat ? <CubeIcon /> : <GridFourIcon />}<span>{flat ? '3D desk' : '2D board'}</span>
          </button>
          <button type="button" className="desk-tool help-button" onClick={() => setHelp(value => !value)} aria-expanded={help} aria-controls="desk-help"><QuestionIcon /><span>How to play</span></button>
        </div>
      </header>
      <AnimatePresence>{help && <m.section id="desk-help" className="desk-help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <h2>Your desk, your pace.</h2><p>Pick up a piece or choose its letter below. Drag it into the case, or click a spot to place it. Green rings show a fit. Pick up any placed piece to move it.</p>
        <p>Use <kbd>A</kbd> to turn left, <kbd>D</kbd> or <kbd>R</kbd> to turn right, <kbd>F</kbd> to flip, and <kbd>Esc</kbd> to put it back. The 2D board offers larger cells and full keyboard control.</p>
      </m.section>}</AnimatePresence>
      <section className="tabletop-stage" aria-label="Interactive Kanoodle desk" data-view={flat ? 'flat' : '3d'}>
        <div className="desk-intro"><h2>A little room<br />to <em>think.</em></h2><p>Twelve pieces. One satisfying fit.</p></div>
        <div className="desk-scene-tools">
          <label className="challenge-picker"><span>Start a challenge</span><select aria-label="Challenge difficulty" defaultValue="" disabled={table.game.busy} onChange={event => {
            const count = Number(event.target.value);
            if (count) table.operate(() => table.game.newChallenge(count));
            event.target.value = '';
          }}><option value="" disabled>Choose a challenge</option><option value="4">Easy · 4 pieces</option><option value="3">Medium · 3 pieces</option><option value="2">Hard · 2 pieces</option></select></label>
          {!flat && <button type="button" className="view-angle" aria-pressed={overhead} onClick={() => setOverhead(value => !value)}>{overhead ? 'Desk view' : 'View from above'}<ArrowUpRightIcon /></button>}
        </div>
        {flat ? <AccessibleBoard table={table} /> : <div className="tabletop-canvas" role="img" aria-label="Three-dimensional Kanoodle case and twelve colorful bead pieces. Use the piece buttons below for keyboard control.">
          <SceneBoundary onUnavailable={unavailable}><Scene placements={table.game.placements} held={table.held} pointer={table.pointer} dragging={table.dragging}
            request={table.request} valid={table.valid} overhead={overhead} reducedMotion={reducedMotion} disabled={table.game.busy}
            onPick={table.pick} onDrag={table.startDrag} onMove={table.move} onDrop={table.drop} onUnavailable={unavailable} /></SceneBoundary>
        </div>}
        <span className="desk-count" aria-label={`${table.game.placements.length} of 12 pieces placed`}><strong>{table.game.placements.length}</strong> / 12 placed</span>
      </section>
      <div className="desk-status" role="status" aria-live="polite" data-invalid={table.request && !table.valid || undefined}>
        <span className="status-seed" /><span>{status}</span>
      </div>
      <div className="tabletop-controls" id="tabletop-controls" tabIndex={-1}>
        <AnimatePresence>{table.game.hasSolverError && <SolverFeedback message={table.game.message} canUndo={table.game.canUndo}
          onUndo={() => table.operate(table.game.undo)} onReset={() => table.operate(table.game.reset)} />}</AnimatePresence>
        <TabletopControls table={table} />
      </div>
      <footer className="tabletop-footer"><p>A quiet puzzle. Solved entirely on your device.</p><div>
        <button type="button" disabled={table.game.busy} onClick={() => table.operate(table.game.reset)}><ArrowCounterClockwiseIcon />Reset challenge</button>
        <button type="button" disabled={table.game.busy} onClick={() => table.operate(table.game.clear)}>Clear board</button>
        <a href="https://github.com/johanjohnthomas/KanoodleSolver">View source <ArrowUpRightIcon /></a>
      </div></footer>
    </main>
  </MotionConfig></LazyMotion>;
}
