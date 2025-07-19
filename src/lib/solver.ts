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

    // Find the first empty cell to place the next piece (optimization)
    const nextEmptyCell = this.findNextEmptyCell();
    if (!nextEmptyCell) {
      return this.isBoardComplete();
    }

    const { x: startX, y: startY } = nextEmptyCell;

    // Try placing the piece at the first empty cell and nearby positions
    const searchPositions = this.getSearchPositions(startX, startY);

    for (const { x, y } of searchPositions) {
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

    return false;
  }

  private findNextEmptyCell(): { x: number, y: number } | null {
    for (let y = 0; y < this.layout.rows; y++) {
      for (let x = 0; x < this.layout.cols; x++) {
        if (this.layout.shape[y][x] && this.board[y][x] === null) {
          return { x, y };
        }
      }
    }
    return null;
  }

  private getSearchPositions(startX: number, startY: number): { x: number, y: number }[] {
    const positions: { x: number, y: number }[] = [];
    
    // Start with the empty cell position
    positions.push({ x: startX, y: startY });
    
    // Add only nearby positions - keep it simple and fast
    const maxDistance = 2;
    
    for (let distance = 1; distance <= maxDistance; distance++) {
      for (let dx = -distance; dx <= distance; dx++) {
        for (let dy = -distance; dy <= distance; dy++) {
          if (Math.abs(dx) === distance || Math.abs(dy) === distance) {
            const x = startX + dx;
            const y = startY + dy;
            
            if (x >= 0 && x < this.layout.cols && y >= 0 && y < this.layout.rows) {
              positions.push({ x, y });
            }
          }
        }
      }
    }
    
    return positions;
  }

  public solve(): PlacedPiece[] | null {
    this.solution = [];
    this.usedPieces = new Set();
    
    // Initialize used pieces based on current board state
    this.initializeUsedPieces();
    
    // Use simple iterative approach instead of complex recursion
    return this.solveIteratively();
  }

  private solveIteratively(): PlacedPiece[] | null {
    const maxAttempts = 100; // Limit attempts to prevent freezing
    let attempts = 0;
    
    // Get available pieces (not already placed)
    const availablePieces = PIECES.filter(piece => !this.usedPieces.has(piece.name));
    
    if (availablePieces.length === 0) {
      return this.isBoardComplete() ? [...this.solution] : null;
    }

    // Try to place each available piece
    for (const piece of availablePieces) {
      if (attempts++ > maxAttempts) break;
      
      const placement = this.findValidPlacement(piece);
      if (placement) {
        this.placePiece(piece, placement.x, placement.y, placement.rotation, placement.flipped);
        this.usedPieces.add(piece.name);
        this.solution.push(placement);
        
        // Try to solve the rest recursively with limited depth
        const remainingSolution = this.solveIteratively();
        if (remainingSolution) {
          return remainingSolution;
        }
        
        // Backtrack
        this.removePiece(piece, placement.x, placement.y, placement.rotation, placement.flipped);
        this.usedPieces.delete(piece.name);
        this.solution.pop();
      }
    }
    
    return this.isBoardComplete() ? [...this.solution] : null;
  }

  private findValidPlacement(piece: Piece): PlacedPiece | null {
    // Find first empty cell
    const emptyCell = this.findNextEmptyCell();
    if (!emptyCell) return null;

    // Try positions near the empty cell
    const searchRadius = 2; // Keep search small
    
    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        const x = emptyCell.x + dx;
        const y = emptyCell.y + dy;
        
        if (x < 0 || x >= this.layout.cols || y < 0 || y >= this.layout.rows) continue;
        
        // Try rotations and flips
        for (let rotation = 0; rotation < 4; rotation++) {
          for (let flipped = 0; flipped < 2; flipped++) {
            const isFlipped = flipped === 1;
            
            if (this.isValidPosition(piece, x, y, rotation, isFlipped)) {
              return { piece, x, y, rotation, flipped: isFlipped };
            }
          }
        }
      }
    }
    
    return null;
  }

  private initializeUsedPieces(): void {
    // Scan the board to find which pieces are already placed
    const pieceNames = new Set<string>();
    
    for (let y = 0; y < this.layout.rows; y++) {
      for (let x = 0; x < this.layout.cols; x++) {
        const cellValue = this.board[y][x];
        if (cellValue && !pieceNames.has(cellValue)) {
          pieceNames.add(cellValue);
          this.usedPieces.add(cellValue);
        }
      }
    }
  }

  public getHint(): PlacedPiece | null {
    // Simple hint: just find any piece that can be placed
    const currentlyPlacedPieces = this.getCurrentlyPlacedPieces();
    
    // Find pieces not yet placed
    const availablePieces = PIECES.filter(piece => 
      !currentlyPlacedPieces.some(placed => placed.piece.name === piece.name)
    );

    if (availablePieces.length === 0) return null;

    // Try to place the first available piece
    for (const piece of availablePieces) {
      const placement = this.findValidPlacement(piece);
      if (placement) {
        return placement;
      }
    }
    
    return null;
  }

  public getCurrentlyPlacedPieces(): PlacedPiece[] {
    const placedPieces: PlacedPiece[] = [];
    const pieceNames = new Set<string>();
    
    // Scan the board to find which pieces are placed
    for (let y = 0; y < this.layout.rows; y++) {
      for (let x = 0; x < this.layout.cols; x++) {
        const cellValue = this.board[y][x];
        if (cellValue && !pieceNames.has(cellValue)) {
          pieceNames.add(cellValue);
          const piece = PIECES.find(p => p.name === cellValue);
          if (piece) {
            // For hint purposes, we just need to know the piece is placed
            // The exact position/rotation doesn't matter for filtering
            placedPieces.push({ piece, x: 0, y: 0, rotation: 0, flipped: false });
          }
        }
      }
    }
    
    return placedPieces;
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
