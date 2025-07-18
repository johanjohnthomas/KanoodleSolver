import React, { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Board as BoardType } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useGame } from '@/contexts/GameContext';

interface BoardProps {
  board: BoardType;
  onDropPiece: (item: any, x: number, y: number) => void;
  onMovePiece?: (item: any, x: number, y: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onDropPiece, onMovePiece }) => {
  const { theme } = useTheme();
  const { gameConfig, removePiece, canPlacePiece } = useGame();
  const boardRef = useRef<HTMLDivElement>(null);
  const [hoverPreview, setHoverPreview] = useState<{
    piece: any;
    x: number;
    y: number;
    rotation: number;
    flipped: boolean;
    isValid: boolean;
  } | null>(null);
  
  const [, drop] = useDrop(() => ({
    accept: ['piece', 'board-piece'],
    hover: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      
      if (offset && boardRef.current && item.piece) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const padding = 16; // p-4 = 1rem = 16px
        const cellSize = 32; // w-8/h-8 = 2rem = 32px
        const gap = 4; // gap-1 = 0.25rem = 4px
        const cellWithGap = cellSize + gap;

        // Calculate the hover position based on cursor location
        const x = Math.floor((offset.x - boardRect.left - padding) / cellWithGap);
        const y = Math.floor((offset.y - boardRect.top - padding) / cellWithGap);
        
        // Ensure coordinates are within bounds
        if (x >= 0 && x < gameConfig.currentLayout.cols && y >= 0 && y < gameConfig.currentLayout.rows) {
          const rotation = item.rotation || 0;
          const flipped = item.flipped || false;
          const isValid = canPlacePiece(item.piece, x, y, rotation, flipped);
          
          setHoverPreview({
            piece: item.piece,
            x,
            y,
            rotation,
            flipped,
            isValid
          });
        } else {
          setHoverPreview(null);
        }
      } else {
        setHoverPreview(null);
      }
    },
    drop: (item: any, monitor) => {
      setHoverPreview(null); // Clear preview on drop
      
      const offset = monitor.getClientOffset();
      
      if (offset && boardRef.current) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const padding = 16; // p-4 = 1rem = 16px
        const cellSize = 32; // w-8/h-8 = 2rem = 32px
        const gap = 4; // gap-1 = 0.25rem = 4px
        const cellWithGap = cellSize + gap;

        // Calculate the drop position based on cursor location
        const x = Math.floor((offset.x - boardRect.left - padding) / cellWithGap);
        const y = Math.floor((offset.y - boardRect.top - padding) / cellWithGap);
        
        // Ensure coordinates are within bounds
        if (x >= 0 && x < gameConfig.currentLayout.cols && y >= 0 && y < gameConfig.currentLayout.rows) {
          if (monitor.getItemType() === 'board-piece' && onMovePiece) {
            onMovePiece(item, x, y);
          } else {
            onDropPiece(item, x, y);
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [gameConfig.currentLayout.cols, gameConfig.currentLayout.rows, canPlacePiece, onDropPiece, onMovePiece]);

  // Correctly combine the refs
  const dropRef = (el: HTMLDivElement) => {
    boardRef.current = el;
    drop(el);
  };

  const handleCellClick = (x: number, y: number) => {
    if (board[y][x] !== null) {
      removePiece(x, y);
    }
  };

  // Function to get the transformed shape for preview
  const getTransformedShape = (piece: any, rotation: number, flipped: boolean) => {
    if (!piece || !piece.shape) return [];
    
    let shape: number[][];
    
    if (flipped) {
      // Use pre-computed flipped rotations if available
      if (piece.flippedRotations && piece.flippedRotations.length > rotation) {
        shape = piece.flippedRotations[rotation];
      } else {
        // Fallback: flip then rotate
        const flippedShape = piece.flips && piece.flips.length > 1 ? piece.flips[1] : piece.shape.map((row: number[]) => [...row].reverse());
        shape = flippedShape;
        
        // Apply rotation to the flipped shape
        for (let i = 0; i < rotation; i++) {
          const size = shape.length;
          const newShape: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
          
          for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
              newShape[col][size - 1 - row] = shape[row][col];
            }
          }
          shape = newShape;
        }
      }
    } else {
      // Use pre-computed rotations for original shape
      if (piece.rotations && piece.rotations.length > rotation) {
        shape = piece.rotations[rotation];
      } else {
        // Fallback to dynamic rotation
        shape = piece.shape;
        for (let i = 0; i < rotation; i++) {
          const size = shape.length;
          const newShape: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
          
          for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
              newShape[col][size - 1 - row] = shape[row][col];
            }
          }
          shape = newShape;
        }
      }
    }
    
    return shape;
  };

  // Function to check if a cell should show preview
  const shouldShowPreview = (x: number, y: number) => {
    if (!hoverPreview) return null;
    
    const shape = getTransformedShape(hoverPreview.piece, hoverPreview.rotation, hoverPreview.flipped);
    
    for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
      for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
        if (shape[rowIndex][colIndex]) {
          const previewY = hoverPreview.y + rowIndex;
          const previewX = hoverPreview.x + colIndex;
          
          if (previewX === x && previewY === y) {
            return hoverPreview.isValid ? 'valid' : 'invalid';
          }
        }
      }
    }
    
    return null;
  };

  return (
    <div
      ref={dropRef}
      className={`inline-grid gap-1 p-4 ${theme.boardBg} rounded-lg shadow-lg`}
      style={{ 
        gridTemplateColumns: `repeat(${gameConfig.currentLayout.cols}, 1fr)`,
        gridTemplateRows: `repeat(${gameConfig.currentLayout.rows}, 1fr)`,
      }}
      onMouseLeave={() => setHoverPreview(null)} // Clear preview when mouse leaves board
    >
      {board.map((row, y) =>
        row.map((cell, x) => {
          const isValidCell = gameConfig.currentLayout.shape[y][x];
          const previewState = shouldShowPreview(x, y);
          
          let cellClasses = `w-8 h-8 border transition-colors duration-200`;
          
          if (!isValidCell) {
            cellClasses += ' bg-transparent border-transparent';
          } else if (previewState === 'valid') {
            cellClasses += ' border-green-500 border-2 bg-green-200';
          } else if (previewState === 'invalid') {
            cellClasses += ' border-red-500 border-2 bg-red-200';
          } else if (cell) {
            cellClasses += ` ${theme.pieceColors[cell]} border-gray-600 cursor-pointer hover:opacity-80`;
          } else {
            cellClasses += ` ${theme.emptyCellBg} border-gray-400 hover:bg-gray-200`;
          }
          
          return (
            <div
              key={`${y}-${x}`}
              className={cellClasses}
              onClick={() => handleCellClick(x, y)}
              title={cell ? `Piece ${cell} (click to remove)` : isValidCell ? 'Empty cell' : ''}
            />
          );
        })
      )}
    </div>
  );
};

export default Board;
