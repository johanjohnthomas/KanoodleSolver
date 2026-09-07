"use client";

import { useCallback, useMemo, useState } from "react";

import { BOARD_LAYOUTS, PIECES } from "@/lib/pieces";
import {
  createEmptyBoard,
  isValidPiecePlacement,
  KanoodleSolver,
  placePieceOnBoard,
} from "@/lib/solver";
import type { Board, Piece, PlacedPiece } from "@/lib/types";

type Orientation = Readonly<{ rotation: number; flipped: boolean }>;
type Snapshot = Readonly<{ board: Board; placements: readonly PlacedPiece[] }>;

const layout = BOARD_LAYOUTS[0];
const emptyBoard = (): Board => createEmptyBoard(layout);

const removeNamedPiece = (board: Board, name: string): Board =>
  board.map((row) => row.map((cell) => (cell === name ? null : cell)));

export function useKanoodleGame() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [resetBoard, setResetBoard] = useState<Board>(emptyBoard);
  const [placements, setPlacements] = useState<readonly PlacedPiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(PIECES[0]);
  const [orientation, setOrientation] = useState<Orientation>({ rotation: 0, flipped: false });
  const [history, setHistory] = useState<readonly Snapshot[]>([]);
  const [message, setMessage] = useState("Piece A is selected. Choose a board cell.");
  const [busy, setBusy] = useState(false);

  const placedNames = useMemo(
    () => new Set(placements.map(({ piece }) => piece.name)),
    [placements],
  );

  const commit = useCallback(
    (nextBoard: Board, nextPlacements: readonly PlacedPiece[], nextMessage: string) => {
      setHistory((current) => [...current, { board, placements }]);
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

      const placement: PlacedPiece = {
        piece: selectedPiece,
        x,
        y,
        rotation: orientation.rotation,
        flipped: orientation.flipped,
      };
      commit(
        placePieceOnBoard(board, selectedPiece, x, y, orientation.rotation, orientation.flipped),
        [...placements, placement],
        `Piece ${selectedPiece.name} placed.`,
      );
      const nextPiece = PIECES.find(({ name }) => !placedNames.has(name) && name !== selectedPiece.name) ?? null;
      setSelectedPiece(nextPiece);
      setOrientation({ rotation: 0, flipped: false });
    },
    [board, canPlace, commit, orientation, placedNames, placements, selectedPiece],
  );

  const solveBoard = useCallback(() => {
    setBusy(true);
    setMessage("Solving this arrangement…");
    window.setTimeout(() => {
      const solver = new KanoodleSolver(board, layout);
      const solution = solver.solve();
      if (solution === null) {
        setMessage("This arrangement has no complete solution. Undo or reset a piece and try again.");
      } else {
        commit(solver.getSolution(), solution, "Board solved. Every cell is covered.");
        setSelectedPiece(null);
      }
      setBusy(false);
    }, 20);
  }, [board, commit]);

  const getHint = useCallback(() => {
    setBusy(true);
    setMessage("Finding a hint that keeps the board solvable…");
    window.setTimeout(() => {
      const hint = new KanoodleSolver(board, layout).getHint();
      if (hint === null) {
        setMessage("No guaranteed hint exists for this arrangement. Undo or reset and try again.");
      } else {
        commit(
          placePieceOnBoard(board, hint.piece, hint.x, hint.y, hint.rotation, hint.flipped),
          [...placements, hint],
          `Hint placed piece ${hint.piece.name}. The board still has a complete solution.`,
        );
      }
      setBusy(false);
    }, 20);
  }, [board, commit, placements]);

  const newChallenge = useCallback((seedCount: number) => {
    setBusy(true);
    setMessage("Preparing a guaranteed-solvable challenge…");
    window.setTimeout(() => {
      const solver = new KanoodleSolver(emptyBoard(), layout);
      const starting = solver.generateRandomStartingPosition(seedCount);
      const nextBoard = solver.getSolution();
      setBoard(nextBoard);
      setResetBoard(nextBoard);
      setPlacements(starting);
      setHistory([]);
      setSelectedPiece(PIECES.find(({ name }) => !starting.some(({ piece }) => piece.name === name)) ?? null);
      setOrientation({ rotation: 0, flipped: false });
      setMessage(`${seedCount}-piece challenge ready. Every starting piece is locked into a full solution.`);
      setBusy(false);
    }, 20);
  }, []);

  const reset = useCallback(() => {
    setHistory((current) => [...current, { board, placements }]);
    setBoard(resetBoard.map((row) => [...row]));
    const resetNames = new Set(resetBoard.flat().filter((cell): cell is string => cell !== null));
    const resetPlacements = placements.filter(({ piece }) => resetNames.has(piece.name));
    setPlacements(resetPlacements);
    setMessage("Returned to the challenge starting position.");
  }, [board, placements, resetBoard]);

  const clear = useCallback(() => {
    commit(emptyBoard(), [], "Board cleared. Piece A is selected.");
    setResetBoard(emptyBoard());
    setSelectedPiece(PIECES[0]);
    setOrientation({ rotation: 0, flipped: false });
  }, [commit]);

  const undo = useCallback(() => {
    const previous = history.at(-1);
    if (previous === undefined) {
      return;
    }
    setBoard(previous.board);
    setPlacements(previous.placements);
    setHistory((current) => current.slice(0, -1));
    setMessage("Last board change undone.");
  }, [history]);

  return {
    board,
    busy,
    canPlace,
    clear,
    getHint,
    handleCell,
    layout,
    message,
    newChallenge,
    orientation,
    placedNames,
    placements,
    reset,
    rotate: (change: number) => setOrientation((current) => ({ ...current, rotation: (current.rotation + change + 4) % 4 })),
    selectPiece,
    selectedPiece,
    solveBoard,
    toggleFlip: () => setOrientation((current) => ({ ...current, flipped: !current.flipped })),
    undo,
    canUndo: history.length > 0,
  };
}
