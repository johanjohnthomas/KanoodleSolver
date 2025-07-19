import { Board, Piece, PlacedPiece, BoardLayout } from './types';
import { PIECES } from './pieces';

// Utility functions for shape transformations
function rotateShape90(shape: number[][]): number[][] {
  const size = shape.length;
  const rotated: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      rotated[j][size - 1 - i] = shape[i][j];
    }
  }
  
  return rotated;
}

function flipShapeHorizontal(shape: number[][]): number[][] {
  return shape.map(row => [...row].reverse());
}

function getRotatedShape(shape: number[][], rotations: number): number[][] {
  console.log('getRotatedShape - input shape:', shape, 'rotations:', rotations);
  let result = shape;
  for (let i = 0; i < rotations; i++) {
    result = rotateShape90(result);
    console.log(`After rotation ${i + 1}:`, result);
  }
  return result;
}

export class KanoodleSolver {
  private board: Board;
  private layout: BoardLayout;
  private solution: PlacedPiece[] = [];
  private usedPieces: Set<string> = new Set();

  constructor(board: Board, layout: BoardLayout) {
    this.board = this.cloneBoard(board);
    this.layout = layout;
  }

  private cloneBoard(board: Board): Board {
    return board.map(row => [...row]);
  }

  private getTransformedShape(piece: Piece, rotation: number = 0, flipped: boolean = false): number[][] {
    console.log('getTransformedShape - piece:', piece.name, 'rotation:', rotation, 'flipped:', flipped);
    
    let shape: number[][];
    
    if (flipped) {
      // Use pre-computed flipped rotations if available
      if (piece.flippedRotations && piece.flippedRotations.length > rotation) {
        shape = piece.flippedRotations[rotation];
      } else {
        // Fallback: flip then rotate
        const flippedShape = piece.flips && piece.flips.length > 1 ? piece.flips[1] : flipShapeHorizontal(piece.shape);
        shape = getRotatedShape(flippedShape, rotation);
      }
    } else {
      // Use pre-computed rotations for original shape
      if (piece.rotations && piece.rotations.length > rotation) {
        shape = piece.rotations[rotation];
      } else {
        // Fallback to dynamic rotation
        shape = getRotatedShape(piece.shape, rotation);
      }
    }
    
    console.log('Final transformed shape:', shape);
    return shape;
  }

  private isValidPosition(piece: Piece, x: number, y: number, rotation: number = 0, flipped: boolean = false): boolean {
    const shape = this.getTransformedShape(piece, rotation, flipped);
    
    // Check all 4x4 cells in the shape
    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
      for (let colIndex = 0; colIndex < 4; colIndex++) {
        if (shape[rowIndex][colIndex]) {
          const boardY = y + rowIndex;
          const boardX = x + colIndex;

          // Check boundaries
          if (boardY < 0 || boardY >= this.layout.rows || 
              boardX < 0 || boardX >= this.layout.cols) {
            return false;
          }

          // Check if position is valid in layout
          if (!this.layout.shape[boardY][boardX]) {
            return false;
          }

          // Check if position is already occupied
          if (this.board[boardY][boardX] !== null) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private placePiece(piece: Piece, x: number, y: number, rotation: number = 0, flipped: boolean = false): void {
    const shape = this.getTransformedShape(piece, rotation, flipped);
    
    // Place piece on all 4x4 cells
    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
      for (let colIndex = 0; colIndex < 4; colIndex++) {
        if (shape[rowIndex][colIndex]) {
          const boardY = y + rowIndex;
          const boardX = x + colIndex;
          this.board[boardY][boardX] = piece.name;
        }
      }
    }
  }

  private removePiece(piece: Piece, x: number, y: number, rotation: number = 0, flipped: boolean = false): void {
    const shape = this.getTransformedShape(piece, rotation, flipped);
    
    // Remove piece from all 4x4 cells
    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
      for (let colIndex = 0; colIndex < 4; colIndex++) {
        if (shape[rowIndex][colIndex]) {
          const boardY = y + rowIndex;
          const boardX = x + colIndex;
          this.board[boardY][boardX] = null;
        }
      }
    }
  }

  private isBoardComplete(): boolean {
    for (let y = 0; y < this.layout.rows; y++) {
      for (let x = 0; x < this.layout.cols; x++) {
        if (this.layout.shape[y][x] && this.board[y][x] === null) {
          return false;
        }
      }
    }
    return true;
  }

  private solveRecursive(pieceIndex: number = 0): boolean {
    if (pieceIndex >= PIECES.length) {
      return this.isBoardComplete();
    }

    const piece = PIECES[pieceIndex];
    
    // Skip if piece is already placed
    if (this.usedPieces.has(piece.name)) {
      return this.solveRecursive(pieceIndex + 1);
    }

    // Try all positions and orientations
    for (let y = 0; y < this.layout.rows; y++) {
      for (let x = 0; x < this.layout.cols; x++) {
        // Try all rotations
        for (let rotation = 0; rotation < 4; rotation++) {
          // Try normal and flipped
          for (let flipped = 0; flipped < 2; flipped++) {
            const isFlipped = flipped === 1;
            
            if (this.isValidPosition(piece, x, y, rotation, isFlipped)) {
              this.placePiece(piece, x, y, rotation, isFlipped);
              this.usedPieces.add(piece.name);
              this.solution.push({ piece, x, y, rotation, flipped: isFlipped });

              if (this.solveRecursive(pieceIndex + 1)) {
                return true;
              }

              // Backtrack
              this.removePiece(piece, x, y, rotation, isFlipped);
              this.usedPieces.delete(piece.name);
              this.solution.pop();
            }
          }
        }
      }
    }

    return false;
  }

  public solve(): PlacedPiece[] | null {
    this.solution = [];
    this.usedPieces = new Set();
    
    if (this.solveRecursive()) {
      return [...this.solution];
    }
    
    return null;
  }

  public getHint(): PlacedPiece | null {
    // First, try to solve the current board state
    const solution = this.solve();
    if (!solution) {
      return null;
    }

    // Find the first piece that's not already placed
    for (const placedPiece of solution) {
      if (!this.usedPieces.has(placedPiece.piece.name)) {
        return placedPiece;
      }
    }

    return null;
  }

  public getSolution(): Board {
    return this.cloneBoard(this.board);
  }

  public generateRandomStartingPosition(numPieces?: number, availablePieceNames?: string[]): PlacedPiece[] {
    let piecesToPlace: typeof PIECES;
    
    if (availablePieceNames) {
      // If specific piece names are provided, use those exact pieces
      piecesToPlace = PIECES.filter(piece => availablePieceNames.includes(piece.name));
    } else {
      // Use default behavior: random selection from all pieces
      const pieceCount = numPieces ?? Math.floor(Math.random() * 3) + 2;
      const shuffledPieces = [...PIECES].sort(() => Math.random() - 0.5);
      piecesToPlace = shuffledPieces.slice(0, pieceCount);
    }
    
    // Shuffle the pieces to place them in random order
    const shuffledPiecesToPlace = [...piecesToPlace].sort(() => Math.random() - 0.5);
    const placedPieces: PlacedPiece[] = [];

    for (const piece of shuffledPiecesToPlace) {
      // Try to place piece randomly
      for (let attempts = 0; attempts < 50; attempts++) {
        const x = Math.floor(Math.random() * this.layout.cols);
        const y = Math.floor(Math.random() * this.layout.rows);
        const rotation = Math.floor(Math.random() * 4);
        const flipped = Math.random() < 0.5;

        if (this.isValidPosition(piece, x, y, rotation, flipped)) {
          this.placePiece(piece, x, y, rotation, flipped);
          this.usedPieces.add(piece.name);
          placedPieces.push({ piece, x, y, rotation, flipped });
          break;
        }
      }
    }

    return placedPieces;
  }
}

export function createEmptyBoard(layout: BoardLayout): Board {
  return Array(layout.rows).fill(null).map(() => Array(layout.cols).fill(null));
}

export function isValidPiecePlacement(
  board: Board,
  layout: BoardLayout,
  piece: Piece,
  x: number,
  y: number,
  rotation: number = 0,
  flipped: boolean = false
): boolean {
  if (!piece || !piece.shape) {
    console.error('Invalid piece passed to isValidPiecePlacement:', piece);
    return false;
  }

  console.log('isValidPiecePlacement - piece:', piece.name, 'rotation:', rotation, 'flipped:', flipped);

  let shape: number[][];
  
  if (flipped) {
    // Use pre-computed flipped rotations if available
    if (piece.flippedRotations && piece.flippedRotations.length > rotation) {
      shape = piece.flippedRotations[rotation];
    } else {
      // Fallback: flip then rotate
      const flippedShape = piece.flips && piece.flips.length > 1 ? piece.flips[1] : flipShapeHorizontal(piece.shape);
      shape = getRotatedShape(flippedShape, rotation);
    }
  } else {
    // Use pre-computed rotations for original shape
    if (piece.rotations && piece.rotations.length > rotation) {
      shape = piece.rotations[rotation];
    } else {
      // Fallback to dynamic rotation
      shape = getRotatedShape(piece.shape, rotation);
    }
  }
  
  for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
    for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
      if (shape[rowIndex][colIndex]) {
        const boardY = y + rowIndex;
        const boardX = x + colIndex;

        // Check boundaries
        if (boardY < 0 || boardY >= layout.rows || 
            boardX < 0 || boardX >= layout.cols) {
          return false;
        }

        // Check if position is valid in layout
        if (!layout.shape[boardY][boardX]) {
          return false;
        }

        // Check if position is already occupied
        if (board[boardY][boardX] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

export function placePieceOnBoard(
  board: Board,
  piece: Piece,
  x: number,
  y: number,
  rotation: number = 0,
  flipped: boolean = false
): Board {
  if (!piece || !piece.shape) {
    console.error('Invalid piece passed to placePieceOnBoard:', piece);
    return board;
  }

  console.log('placePieceOnBoard - piece:', piece.name, 'rotation:', rotation, 'flipped:', flipped);
  console.log('Original shape:', piece.shape);

  const newBoard = board.map(row => [...row]);
  let shape: number[][];
  
  if (flipped) {
    // Use pre-computed flipped rotations if available
    if (piece.flippedRotations && piece.flippedRotations.length > rotation) {
      shape = piece.flippedRotations[rotation];
    } else {
      // Fallback: flip then rotate
      const flippedShape = piece.flips && piece.flips.length > 1 ? piece.flips[1] : flipShapeHorizontal(piece.shape);
      shape = getRotatedShape(flippedShape, rotation);
    }
  } else {
    // Use pre-computed rotations for original shape
    if (piece.rotations && piece.rotations.length > rotation) {
      shape = piece.rotations[rotation];
    } else {
      // Fallback to dynamic rotation
      shape = getRotatedShape(piece.shape, rotation);
    }
  }
  
  console.log('Final shape for placement:', shape);
  
  for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
    for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
      if (shape[rowIndex][colIndex]) {
        const boardY = y + rowIndex;
        const boardX = x + colIndex;
        newBoard[boardY][boardX] = piece.name;
      }
    }
  }

  return newBoard;
}
