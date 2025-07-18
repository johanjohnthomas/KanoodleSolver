import React, { useRef } from 'react';
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
  const { gameConfig, removePiece } = useGame();
  const boardRef = useRef<HTMLDivElement>(null);
  
  const [, drop] = useDrop(() => ({
    accept: ['piece', 'board-piece'],
    drop: (item: any, monitor) => {
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
  }));

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

  return (
    <div
      ref={dropRef}
      className={`inline-grid gap-1 p-4 ${theme.boardBg} rounded-lg shadow-lg`}
      style={{ 
        gridTemplateColumns: `repeat(${gameConfig.currentLayout.cols}, 1fr)`,
        gridTemplateRows: `repeat(${gameConfig.currentLayout.rows}, 1fr)`,
      }}
    >
      {board.map((row, y) =>
        row.map((cell, x) => {
          const isValidCell = gameConfig.currentLayout.shape[y][x];
          
          return (
            <div
              key={`${y}-${x}`}
              className={`w-8 h-8 border transition-colors duration-200 ${
                !isValidCell
                  ? 'bg-transparent border-transparent'
                  : cell 
                    ? `${theme.pieceColors[cell]} border-gray-600 cursor-pointer hover:opacity-80`
                    : `${theme.emptyCellBg} border-gray-400 hover:bg-gray-200`
              }`}
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
