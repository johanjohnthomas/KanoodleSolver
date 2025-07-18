import { Piece, BoardLayout } from './types';
import piecesData from '@/data/pieces.json';

// Generate all rotations for a 4x4 piece
function generateRotations(shape: number[][]): number[][][] {
  const rotations: number[][][] = [];
  let currentShape = shape;
  
  for (let i = 0; i < 4; i++) {
    // Normalize each rotation so all pieces are positioned consistently
    const normalizedShape = normalizeShape(currentShape);
    rotations.push(normalizedShape);
    currentShape = rotateShape4x4(currentShape);
  }
  
  return rotations;
}

// Generate flipped versions and their rotations for a 4x4 piece
function generateFlipsAndRotations(shape: number[][]): { flips: number[][][], flippedRotations: number[][][] } {
  const flips: number[][][] = [];
  
  // Original (not flipped) - normalize it
  flips.push(normalizeShape(shape));
  
  // Horizontal flip - normalize it
  const flippedShape = shape.map(row => [...row].reverse());
  flips.push(normalizeShape(flippedShape));
  
  // Generate rotations for the normalized flipped shape
  const flippedRotations = generateRotations(flippedShape);
  
  return { flips, flippedRotations };
}

// Rotate a 4x4 shape 90 degrees clockwise
function rotateShape4x4(shape: number[][]): number[][] {
  const rotated: number[][] = Array(4).fill(null).map(() => Array(4).fill(0));
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      rotated[j][4 - 1 - i] = shape[i][j];
    }
  }
  
  return rotated;
}

// Validate that a shape is a proper 4x4 matrix
function validateShape(shape: number[][]): boolean {
  if (shape.length !== 4) return false;
  return shape.every(row => row.length === 4 && row.every(cell => cell === 0 || cell === 1));
}

// Load pieces from JSON and generate transformations
function loadPieces(): Piece[] {
  const pieces: Piece[] = [];
  
  for (const pieceData of piecesData.pieces) {
    if (!validateShape(pieceData.shape)) {
      console.error(`Invalid shape for piece ${pieceData.name}:`, pieceData.shape);
      continue;
    }
    
    const piece: Piece = {
      name: pieceData.name,
      shape: normalizeShape(pieceData.shape), // Normalize the original shape too
      color: pieceData.color,
      rotations: [],
      flips: [],
      flippedRotations: [],
    };

    // Generate transformations
    piece.rotations = generateRotations(piece.shape);
    const { flips, flippedRotations } = generateFlipsAndRotations(piece.shape);
    piece.flips = flips;
    piece.flippedRotations = flippedRotations;
    
    pieces.push(piece);
  }
  
  return pieces;
}

// Calculate the bounding box of a piece shape
function getBoundingBox(shape: number[][]): { minRow: number; maxRow: number; minCol: number; maxCol: number; } {
  let minRow = 4, maxRow = -1, minCol = 4, maxCol = -1;
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (shape[i][j] === 1) {
        minRow = Math.min(minRow, i);
        maxRow = Math.max(maxRow, i);
        minCol = Math.min(minCol, j);
        maxCol = Math.max(maxCol, j);
      }
    }
  }
  
  return { minRow, maxRow, minCol, maxCol };
}

// Normalize a shape by moving it to the top-left of the 4x4 grid
function normalizeShape(shape: number[][]): number[][] {
  const bounds = getBoundingBox(shape);
  
  if (bounds.minRow > bounds.maxRow || bounds.minCol > bounds.maxCol) {
    return shape; // Empty shape, return as-is
  }
  
  const normalized: number[][] = Array(4).fill(null).map(() => Array(4).fill(0));
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (shape[i][j] === 1) {
        const newRow = i - bounds.minRow;
        const newCol = j - bounds.minCol;
        if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
          normalized[newRow][newCol] = 1;
        }
      }
    }
  }
  
  return normalized;
}

// Export the pieces loaded from JSON
export const PIECES: Piece[] = loadPieces();

export const BOARD_LAYOUTS: BoardLayout[] = [
  {
    name: 'Standard',
    rows: 5,
    cols: 11,
    shape: Array(5).fill(null).map(() => Array(11).fill(true)),
  },
  {
    name: 'Pyramid',
    rows: 5,
    cols: 9,
    shape: [
      [false, false, false, false, true, false, false, false, false],
      [false, false, false, true, true, true, false, false, false],
      [false, false, true, true, true, true, true, false, false],
      [false, true, true, true, true, true, true, true, false],
      [true, true, true, true, true, true, true, true, true],
    ],
  },
  {
    name: 'Cross',
    rows: 5,
    cols: 5,
    shape: [
      [false, false, true, false, false],
      [false, true, true, true, false],
      [true, true, true, true, true],
      [false, true, true, true, false],
      [false, false, true, false, false],
    ],
  },
  {
    name: 'Diamond',
    rows: 7,
    cols: 7,
    shape: [
      [false, false, false, true, false, false, false],
      [false, false, true, true, true, false, false],
      [false, true, true, true, true, true, false],
      [true, true, true, true, true, true, true],
      [false, true, true, true, true, true, false],
      [false, false, true, true, true, false, false],
      [false, false, false, true, false, false, false],
    ],
  },
];
