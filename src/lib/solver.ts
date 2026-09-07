import { PIECES } from "./pieces";
import {
  cellsForPlacement,
  cloneBoard,
  createEmptyBoard,
  isValidPiecePlacement,
  occupiedCells,
  placePieceOnBoard,
  uniqueOrientations,
} from "./pieceGeometry";
import type { Cell } from "./pieceGeometry";
import type { Board, BoardLayout, Piece, PlacedPiece } from "./types";

export {
  createEmptyBoard,
  getPieceShape,
  isValidPiecePlacement,
  placePieceOnBoard,
} from "./pieceGeometry";

type Candidate = Readonly<{ placement: PlacedPiece; cells: readonly Cell[] }>;

type CandidateIndex = Readonly<{
  byCell: ReadonlyMap<string, readonly Candidate[]>;
  byPiece: ReadonlyMap<string, readonly Candidate[]>;
}>;

const placementMatchesSeed = (
  placement: PlacedPiece,
  seedCells: readonly Cell[],
): boolean => {
  const expected = new Set(seedCells.map(({ x, y }) => `${x}:${y}`));
  const actual = cellsForPlacement(
    placement.piece,
    placement.x,
    placement.y,
    placement.rotation,
    placement.flipped,
  );
  return actual.length === expected.size && actual.every(({ x, y }) => expected.has(`${x}:${y}`));
};

export class KanoodleSolver {
  private readonly initialBoard: Board;
  private board: Board;
  private solution: PlacedPiece[] = [];

  constructor(
    board: Board,
    private readonly layout: BoardLayout,
  ) {
    this.initialBoard = cloneBoard(board);
    this.board = cloneBoard(board);
  }

  public solve(): PlacedPiece[] | null {
    this.board = cloneBoard(this.initialBoard);
    const seeded = this.readSeededPlacements();
    if (seeded === null) {
      return null;
    }

    const usedNames = new Set(seeded.map(({ piece }) => piece.name));
    const remainingPieces = PIECES.filter((piece) => !usedNames.has(piece.name));
    const emptyArea = this.layout.shape.reduce(
      (total, row, y) => total + row.filter((active, x) => active && this.board[y][x] === null).length,
      0,
    );
    const remainingArea = remainingPieces.reduce(
      (total, piece) => total + occupiedCells(piece.shape).length,
      0,
    );
    if (emptyArea !== remainingArea) {
      return null;
    }

    const candidates = remainingPieces.flatMap((piece) => this.candidatesFor(piece));
    const candidateIndex = this.indexCandidates(candidates);
    const chosen: PlacedPiece[] = [];
    if (!this.search(candidateIndex, usedNames, chosen)) {
      this.board = cloneBoard(this.initialBoard);
      return null;
    }

    this.solution = [...seeded, ...chosen];
    return [...this.solution];
  }

  public getHint(): PlacedPiece | null {
    const seededNames = new Set(
      this.initialBoard.flat().filter((cell): cell is string => cell !== null),
    );
    return this.solve()?.find(({ piece }) => !seededNames.has(piece.name)) ?? null;
  }

  public getSolution(): Board {
    return cloneBoard(this.board);
  }

  public generateRandomStartingPosition(
    numPieces?: number,
    availablePieceNames?: readonly string[],
  ): PlacedPiece[] {
    const complete = this.solve();
    if (complete === null) {
      return [];
    }

    const requested = availablePieceNames
      ? new Set(availablePieceNames)
      : new Set(
          [...PIECES]
            .sort(() => Math.random() - 0.5)
            .slice(0, numPieces ?? 3)
            .map(({ name }) => name),
        );
    const starting = complete.filter(({ piece }) => requested.has(piece.name));
    this.board = createEmptyBoard(this.layout);
    for (const placement of starting) {
      this.board = placePieceOnBoard(
        this.board,
        placement.piece,
        placement.x,
        placement.y,
        placement.rotation,
        placement.flipped,
      );
    }
    this.solution = [...starting];
    return [...starting];
  }

  private candidatesFor(piece: Piece): readonly Candidate[] {
    const candidates: Candidate[] = [];
    for (const { rotation, flipped } of uniqueOrientations(piece)) {
      for (let y = 0; y < this.layout.rows; y += 1) {
        for (let x = 0; x < this.layout.cols; x += 1) {
          if (isValidPiecePlacement(this.board, this.layout, piece, x, y, rotation, flipped)) {
            candidates.push({
              placement: { piece, x, y, rotation, flipped },
              cells: cellsForPlacement(piece, x, y, rotation, flipped),
            });
          }
        }
      }
    }
    return candidates;
  }

  private search(
    candidates: CandidateIndex,
    usedNames: Set<string>,
    chosen: PlacedPiece[],
  ): boolean {
    const emptyCells = this.layout.shape.flatMap((row, y) =>
      row.flatMap((active, x) => (active && this.board[y][x] === null ? [{ x, y }] : [])),
    );
    if (emptyCells.length === 0) {
      return usedNames.size === PIECES.length;
    }

    let options: readonly Candidate[] | null = null;
    for (const piece of PIECES) {
      if (usedNames.has(piece.name)) {
        continue;
      }
      const viable = (candidates.byPiece.get(piece.name) ?? []).filter(({ cells }) =>
        cells.every(({ x, y }) => this.board[y][x] === null),
      );
      if (viable.length === 0) {
        return false;
      }
      if (options === null || viable.length < options.length) {
        options = viable;
      }
    }

    for (const empty of emptyCells) {
      const viable = (candidates.byCell.get(`${empty.x}:${empty.y}`) ?? []).filter(
        ({ placement, cells }) => !usedNames.has(placement.piece.name) &&
          cells.every(({ x, y }) => this.board[y][x] === null),
      );
      if (viable.length === 0) {
        return false;
      }
      if (options === null || viable.length < options.length) {
        options = viable;
      }
    }

    for (const candidate of options ?? []) {
      const pieceName = candidate.placement.piece.name;
      this.writeCandidate(candidate, pieceName);
      usedNames.add(pieceName);
      chosen.push(candidate.placement);
      if (this.search(candidates, usedNames, chosen)) {
        return true;
      }
      chosen.pop();
      usedNames.delete(pieceName);
      this.writeCandidate(candidate, null);
    }
    return false;
  }

  private indexCandidates(candidates: readonly Candidate[]): CandidateIndex {
    const byCell = new Map<string, Candidate[]>();
    const byPiece = new Map<string, Candidate[]>();
    for (const candidate of candidates) {
      const pieceCandidates = byPiece.get(candidate.placement.piece.name) ?? [];
      pieceCandidates.push(candidate);
      byPiece.set(candidate.placement.piece.name, pieceCandidates);
      for (const { x, y } of candidate.cells) {
        const key = `${x}:${y}`;
        const cellCandidates = byCell.get(key) ?? [];
        cellCandidates.push(candidate);
        byCell.set(key, cellCandidates);
      }
    }
    return { byCell, byPiece };
  }

  private writeCandidate(candidate: Candidate, value: string | null): void {
    for (const { x, y } of candidate.cells) {
      this.board[y][x] = value;
    }
  }

  private readSeededPlacements(): PlacedPiece[] | null {
    const seeded: PlacedPiece[] = [];
    for (const piece of PIECES) {
      const cells = this.board.flatMap((row, y) =>
        row.flatMap((value, x) => (value === piece.name ? [{ x, y }] : [])),
      );
      if (cells.length === 0) {
        continue;
      }
      const anchorX = Math.min(...cells.map(({ x }) => x));
      const anchorY = Math.min(...cells.map(({ y }) => y));
      const placement = uniqueOrientations(piece)
        .map(({ rotation, flipped }) => ({ piece, x: anchorX, y: anchorY, rotation, flipped }))
        .find((candidate) => placementMatchesSeed(candidate, cells));
      if (placement === undefined) {
        return null;
      }
      seeded.push(placement);
    }
    return seeded;
  }
}
