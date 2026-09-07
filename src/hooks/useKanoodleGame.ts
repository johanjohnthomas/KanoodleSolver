"use client";

import { useCallback, useMemo, useState } from "react";

import { applyPieceDrop, canDropPiece, removeNamedPiece } from "@/lib/gameBoard";
import { BOARD_LAYOUTS, PIECES } from "@/lib/pieces";
import {
  createEmptyBoard,
  isValidPiecePlacement,
  KanoodleSolver,
  placePieceOnBoard,
} from "@/lib/solver";
import type { Board, Piece, PlacedPiece } from "@/lib/types";
import type { PieceDropRequest } from "@/lib/gameBoard";
import { findClosestRecovery } from '@/lib/solverRecovery';
import type { SolverRecovery } from '@/lib/solverRecovery';

type Orientation = Readonly<{ rotation: number; flipped: boolean }>;
type Snapshot = Readonly<{ board: Board; placements: readonly PlacedPiece[] }>;

const layout = BOARD_LAYOUTS[0];
const emptyBoard = (): Board => createEmptyBoard(layout);

export function useKanoodleGame() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [resetBoard, setResetBoard] = useState<Board>(emptyBoard);
  const [resetPlacements, setResetPlacements] = useState<readonly PlacedPiece[]>([]);
  const [placements, setPlacements] = useState<readonly PlacedPiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(PIECES[0]);
  const [orientation, setOrientation] = useState<Orientation>({ rotation: 0, flipped: false });
  const [history, setHistory] = useState<readonly Snapshot[]>([]);
  const [message, setMessage] = useState("Piece A is selected. Choose a board cell.");
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState<SolverRecovery | null>(null);

  const placedNames = useMemo(
    () => new Set(placements.map(({ piece }) => piece.name)),
    [placements],
  );
  const hasSolverError = recovery !== null || message.includes("no complete solution") || message.includes("No guaranteed hint exists");
  const messageTone = hasSolverError || message.includes("does not fit")
    ? "error"
    : message.startsWith("Board solved") ? "success" : "neutral";

  const commit = useCallback(
    (nextBoard: Board, nextPlacements: readonly PlacedPiece[], nextMessage: string) => {
      setHistory((current) => [...current, { board, placements }]);
      setRecovery(null);
      setBoard(nextBoard);
      setPlacements(nextPlacements);
      setMessage(nextMessage);
    },
    [board, placements],
  );

  const selectPiece = useCallback((piece: Piece) => {
    setSelectedPiece(piece);
    setOrientation({ rotation: 0, flipped: false });
    setMessage(`Piece ${piece.name} selected. Set its orientation or choose a cell.`);
  }, []);

  const canDrop = useCallback(
    (request: PieceDropRequest) => canDropPiece(board, layout, request),
    [board],
  );

  const dropPiece = useCallback((request: PieceDropRequest): boolean => {
    const result = applyPieceDrop(board, layout, placements, request);
    if (result === null) {
      setMessage(`Piece ${request.piece.name} does not fit at that position. Try another cell or orientation.`);
      return false;
    }
    commit(result.board, result.placements, `Piece ${request.piece.name} placed.`);
    const usedNames = new Set(result.placements.map(({ piece }) => piece.name));
    setSelectedPiece(PIECES.find(({ name }) => !usedNames.has(name)) ?? null);
    setOrientation({ rotation: 0, flipped: false });
    return true;
  }, [board, commit, placements]);

  const canPlace = useCallback(
    (x: number, y: number) =>
      selectedPiece !== null &&
      isValidPiecePlacement(
        board,
        layout,
        selectedPiece,
        x,
        y,
        orientation.rotation,
        orientation.flipped,
      ),
    [board, orientation, selectedPiece],
  );

  const handleCell = useCallback(
    (x: number, y: number) => {
      const occupiedName = board[y][x];
      if (occupiedName !== null) {
        const placed = placements.find(({ piece }) => piece.name === occupiedName);
        if (placed === undefined) {
          return;
        }
        commit(
          removeNamedPiece(board, occupiedName),
          placements.filter(({ piece }) => piece.name !== occupiedName),
          `Piece ${occupiedName} returned to the drawer.`,
        );
        setSelectedPiece(placed.piece);
        setOrientation({ rotation: placed.rotation, flipped: placed.flipped });
        return;
      }

      if (selectedPiece === null || !canPlace(x, y)) {
        setMessage(selectedPiece === null ? "Choose a piece before placing it." : "That orientation does not fit there.");
        return;
      }

      dropPiece({
        piece: selectedPiece,
        x,
        y,
        rotation: orientation.rotation,
        flipped: orientation.flipped,
        movingName: null,
      });
    },
    [board, canPlace, commit, dropPiece, orientation, placements, selectedPiece],
  );

  const checkSolvability = useCallback(() => {
    setBusy(true);
    setRecovery(null);
    setMessage('Checking whether this layout can be completed…');
    window.setTimeout(() => {
      const solution = new KanoodleSolver(board, layout).solve();
      setMessage(solution === null
        ? 'This layout cannot be completed as it is. No pieces changed.'
        : 'This layout is solvable. No pieces changed.');
      setBusy(false);
    }, 20);
  }, [board]);

  const requestAssistance = useCallback((mode: 'solve' | 'hint') => {
    setBusy(true);
    setRecovery(null);
    setMessage(mode === 'solve' ? 'Solving this arrangement…' : 'Finding a guaranteed hint…');
    window.setTimeout(async () => {
      const solver = new KanoodleSolver(board, layout);
      const solution = solver.solve();
      if (solution === null) {
        setMessage('Finding the fewest pieces to lift…');
        const suggestion = await findClosestRecovery(placements, layout);
        setRecovery(suggestion);
        setMessage(suggestion ? `Lift ${suggestion.removeNames.join(', ')} to open a path to a complete board.` : 'This arrangement has no complete solution. Try resetting the board.');
      } else if (mode === 'solve') {
        commit(solver.getSolution(), solution, "Board solved. Every cell is covered.");
        setSelectedPiece(null);
      } else {
        const hint = solution.find(({ piece }) => !placements.some(placed => placed.piece.name === piece.name));
        if (hint) commit(
          placePieceOnBoard(board, hint.piece, hint.x, hint.y, hint.rotation, hint.flipped),
          [...placements, hint],
          `Hint placed piece ${hint.piece.name}. The board still has a complete solution.`,
        );
        else setMessage('Board solved. Every cell is covered.');
      }
      setBusy(false);
    }, 20);
  }, [board, commit, placements]);
  const solveBoard = useCallback(() => requestAssistance('solve'), [requestAssistance]);
  const getHint = useCallback(() => requestAssistance('hint'), [requestAssistance]);
  const applyRecovery = useCallback(() => {
    if (busy || !recovery) return;
    const removed = new Set(recovery.removeNames);
    commit(board.map(row => row.map(name => name !== null && removed.has(name) ? null : name)),
      placements.filter(({ piece }) => !removed.has(piece.name)), 'Highlighted pieces returned to the desk. The remaining arrangement can be completed.');
  }, [board, busy, commit, placements, recovery]);

  const newChallenge = useCallback((seedCount: number) => {
    setBusy(true);
    setRecovery(null);
    setMessage("Preparing a guaranteed-solvable challenge…");
    window.setTimeout(() => {
      const solver = new KanoodleSolver(emptyBoard(), layout);
      const starting = solver.generateRandomStartingPosition(seedCount);
      const nextBoard = solver.getSolution();
      setBoard(nextBoard);
      setResetBoard(nextBoard);
      setPlacements(starting);
      setResetPlacements(starting);
      setHistory([]);
      setSelectedPiece(PIECES.find(({ name }) => !starting.some(({ piece }) => piece.name === name)) ?? null);
      setOrientation({ rotation: 0, flipped: false });
      setMessage(`${seedCount}-piece challenge ready. Every starting piece is locked into a full solution.`);
      setBusy(false);
    }, 20);
  }, []);

  const reset = useCallback(() => {
    setRecovery(null);
    setHistory((current) => [...current, { board, placements }]);
    setBoard(resetBoard.map((row) => [...row]));
    setPlacements(resetPlacements);
    setMessage("Returned to the challenge starting position.");
  }, [board, placements, resetBoard, resetPlacements]);

  const clear = useCallback(() => {
    commit(emptyBoard(), [], "Board cleared. Piece A is selected.");
    setResetBoard(emptyBoard());
    setResetPlacements([]);
    setSelectedPiece(PIECES[0]);
    setOrientation({ rotation: 0, flipped: false });
  }, [commit]);

  const undo = useCallback(() => {
    const previous = history.at(-1);
    if (previous === undefined) {
      return;
    }
    setBoard(previous.board);
    setRecovery(null);
    setPlacements(previous.placements);
    setHistory((current) => current.slice(0, -1));
    setMessage("Last board change undone.");
  }, [history]);

  const rejectDrop = useCallback(() => {
    setMessage("That piece was released outside the board. Nothing changed.");
  }, []);

  const rotate = useCallback((change: number) => {
    setOrientation((current) => ({ ...current, rotation: (current.rotation + change + 4) % 4 }));
  }, []);

  const toggleFlip = useCallback(() => {
    setOrientation((current) => ({ ...current, flipped: !current.flipped }));
  }, []);

  return {
    board,
    busy,
    canPlace,
    canDrop,
    checkSolvability,
    clear,
    dropPiece,
    getHint,
    handleCell,
    layout,
    message,
    messageTone,
    hasSolverError,
    recovery,
    applyRecovery,
    newChallenge,
    orientation,
    placedNames,
    placements,
    reset,
    rejectDrop,
    rotate,
    selectPiece,
    selectedPiece,
    solveBoard,
    toggleFlip,
    undo,
    canUndo: history.length > 0,
  };
}
