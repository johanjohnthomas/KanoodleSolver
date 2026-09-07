"use client";

import { GithubLogoIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { domAnimation, LazyMotion, m, MotionConfig, useReducedMotion } from "motion/react";

import { PieceInspector } from "./PieceInspector";
import { PieceTray } from "./PieceTray";
import { PuzzleBoard } from "./PuzzleBoard";
import { SolverActions } from "./SolverActions";
import { useKanoodleGame } from "@/hooks/useKanoodleGame";
import { PIECES } from "@/lib/pieces";

export function SolverWorkbench() {
  const game = useKanoodleGame();
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#board-title">Skip to the board</a>
      <main className="workbench-page">
        <header className="workbench-header">
          <div className="brand-lockup">
            <h1>Kanoodle Solver</h1>
            <p>Build the board you see. We’ll find the way through.</p>
          </div>
          <div className="status-plaque">
            <span className="status-plaque__count">{game.placements.length} / 12 placed</span>
            <span className="status-plaque__local"><LockSimpleIcon aria-hidden="true" /> Solves locally</span>
          </div>
        </header>

        <div className="calibration-line" aria-hidden="true"><span /></div>

        <section className="status-strip" aria-live="polite" aria-atomic="true">
          <m.p
            key={game.message}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {game.message}
          </m.p>
        </section>

        <div className="workbench-grid">
          <PuzzleBoard
            board={game.board}
            layout={game.layout}
            selectedPiece={game.selectedPiece}
            canPlace={game.canPlace}
            onCellClick={game.handleCell}
            disabled={game.busy}
          />
          <PieceInspector
            piece={game.selectedPiece}
            rotation={game.orientation.rotation}
            flipped={game.orientation.flipped}
            onRotate={game.rotate}
            onFlip={game.toggleFlip}
          />
        </div>

        <SolverActions
          busy={game.busy}
          canUndo={game.canUndo}
          solved={game.placements.length === 12}
          onNewChallenge={game.newChallenge}
          onHint={game.getHint}
          onSolve={game.solveBoard}
          onReset={game.reset}
          onClear={game.clear}
          onUndo={game.undo}
        />

        <PieceTray
          pieces={PIECES}
          placed={game.placements}
          selectedName={game.selectedPiece?.name ?? null}
          onSelect={game.selectPiece}
        />

        <section className="how-it-works" aria-labelledby="how-title">
          <div>
            <h2 id="how-title">A real solver, not a lucky guess</h2>
            <p>Every rotation and reflection is searched with exact backtracking. A hint is only shown when the rest of the board can still be completed.</p>
          </div>
          <a href="https://github.com/johanjohnthomas/KanoodleSolver" aria-label="View the project source on GitHub">
            <GithubLogoIcon aria-hidden="true" /> View source
          </a>
        </section>
      </main>
      </MotionConfig>
    </LazyMotion>
  );
}
