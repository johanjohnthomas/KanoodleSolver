export type Piece = {
  shape: number[][]; // 4x4 matrix
  name: string;
  color: string;
  rotations: number[][][]; // rotations of the original shape
  flips: number[][][]; // [original, flipped]
  flippedRotations: number[][][]; // rotations of the flipped shape
};

export type PlacedPiece = {
  piece: Piece;
  x: number;
  y: number;
  rotation: number;
  flipped: boolean;
};

export type Board = (string | null)[][];

export type GameState = 'idle' | 'playing' | 'solved';

export interface Theme {
  boardBg: string;
  emptyCellBg: string;
  pieceColors: {
    [key: string]: string;
  };
}

export interface BoardLayout {
  name: string;
  rows: number;
  cols: number;
  shape: boolean[][];
}

export interface GameConfig {
  currentLayout: BoardLayout;
  showHints: boolean;
  autoSolve: boolean;
}
