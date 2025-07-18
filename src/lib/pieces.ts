import { Piece, BoardLayout } from './types';
import piecesData from '@/data/pieces.json';

// Generate all rotations for a 4x4 piece
function generateRotations(shape: number[][]): number[][][] {
  const rotations: number[][][] = [];
  let currentShape = shape;
  
  for (let i = 0; i < 4; i++) {
    rotations.push(currentShape.map(row => [...row]));
    currentShape = rotateShape4x4(currentShape);
  }
  
  return rotations;
}

// Generate flipped versions for a 4x4 piece
function generateFlips(shape: number[][]): number[][][] {
  const flips: number[][][] = [];
  
  // Original
  flips.push(shape.map(row => [...row]));
  
  // Horizontal flip
  flips.push(shape.map(row => [...row].reverse()));
  
  // Vertical flip
  flips.push([...shape].reverse());
  
  // Both flips
  flips.push([...shape].reverse().map(row => [...row].reverse()));
  
  return flips;
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
      shape: pieceData.shape,
      color: pieceData.color,
      rotations: [],
      flips: [],
    };
    
    // Generate transformations
    piece.rotations = generateRotations(piece.shape);
    piece.flips = generateFlips(piece.shape);
    
    pieces.push(piece);
  }
  
  return pieces;
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
