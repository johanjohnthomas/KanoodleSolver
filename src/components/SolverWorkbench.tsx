"use client";

import { GithubLogoIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { AnimatePresence, domAnimation, LazyMotion, m, MotionConfig, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

import { DragPreview } from "./DragPreview";
import { PieceInspector } from "./PieceInspector";
import { PieceTray } from "./PieceTray";
import { PuzzleBoard } from "./PuzzleBoard";
import { SolverFeedback } from "./SolverFeedback";
import { SolverActions } from "./SolverActions";
import { SoundToggle } from "./SoundToggle";
import { useKanoodleGame } from "@/hooks/useKanoodleGame";
import { usePieceDrag } from "@/hooks/usePieceDrag";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { BoardTarget, PieceDragPayload } from "@/hooks/usePieceDrag";
import { cellsForPlacement } from "@/lib/pieceGeometry";
import { PIECES } from "@/lib/pieces";

export function SolverWorkbench() {
  const game = useKanoodleGame();
  const sounds = useSoundEffects();
  const { dropPiece, rejectDrop } = game;
  const { play } = sounds;
  const reduceMotion = useReducedMotion();
  const previousMessage = useRef(game.message);
  const handleDrop = useCallback((payload: PieceDragPayload, target: BoardTarget | null): void => {
    if (target === null) {
      rejectDrop();
      return;
    }
    dropPiece({ ...payload, ...target });
  }, [dropPiece, rejectDrop]);
  const drag = usePieceDrag({
    onDrop: handleDrop,
    onPickup: () => play("pickup"),
    onTransform: (kind) => play(kind),
  });
  const dragRequest = drag.session?.target
    ? { ...drag.session.payload, ...drag.session.target }
    : null;
  const dragValid = dragRequest !== null && game.canDrop(dragRequest);
  const boardPreview = dragRequest === null ? null : {
    cells: cellsForPlacement(
      dragRequest.piece,
      dragRequest.x,
      dragRequest.y,
      dragRequest.rotation,
      dragRequest.flipped,
    ),
    valid: dragValid,
    movingName: dragRequest.movingName,
  };
  const inspectedPiece = drag.session?.payload.piece ?? game.selectedPiece;
  const inspectedOrientation = drag.session?.payload ?? game.orientation;

  useEffect(() => {
    if (previousMessage.current === game.message) return;
    previousMessage.current = game.message;
    if (game.message.startsWith("Board solved")) play("solve");
    else if (game.message.includes("no complete solution")) play("error");
    else if (game.message.includes("does not fit") || game.message.includes("outside the board")) play("invalid");
    else if (game.message.includes("placed")) play("place");
  }, [game.message, play]);

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
            <SoundToggle enabled={sounds.enabled} onToggle={sounds.toggle} />
          </div>
        </header>

        <div className="calibration-line" aria-hidden="true"><span /></div>

        <section className="status-strip" data-tone={game.messageTone} aria-live="polite" aria-atomic="true">
          <m.p
            key={game.message}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {game.message}
          </m.p>
        </section>

        <AnimatePresence>
          {game.hasSolverError ? (
            <SolverFeedback
              message={game.message}
              canUndo={game.canUndo}
              onUndo={game.undo}
              onReset={game.reset}
            />
          ) : null}
        </AnimatePresence>

        <div className="workbench-grid">
          <PuzzleBoard
            board={game.board}
            layout={game.layout}
            selectedPiece={inspectedPiece}
            canPlace={game.canPlace}
            onCellClick={game.handleCell}
            placements={game.placements}
            preview={boardPreview}
            getDragHandleProps={(placement, onClick) => drag.bind({
              piece: placement.piece,
              rotation: placement.rotation,
              flipped: placement.flipped,
              movingName: placement.piece.name,
            }, () => {
              onClick();
              sounds.play("pickup");
            })}
            disabled={game.busy}
          />
          <PieceInspector
            piece={inspectedPiece}
            rotation={inspectedOrientation.rotation}
            flipped={inspectedOrientation.flipped}
            onRotate={(change) => {
              game.rotate(change);
              sounds.play("rotate");
            }}
            onFlip={() => {
              game.toggleFlip();
              sounds.play("flip");
            }}
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
          getDragHandleProps={(piece, onClick) => drag.bind({
            piece,
            rotation: game.selectedPiece?.name === piece.name ? game.orientation.rotation : 0,
            flipped: game.selectedPiece?.name === piece.name && game.orientation.flipped,
            movingName: null,
          }, () => {
            onClick();
            sounds.play("pickup");
          })}
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
        <AnimatePresence>
          {drag.session ? <DragPreview session={drag.session} valid={dragValid} /> : null}
        </AnimatePresence>
      </main>
      </MotionConfig>
    </LazyMotion>
  );
}
