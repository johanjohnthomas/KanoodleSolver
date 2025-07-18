import React from 'react';
import { useDrag } from 'react-dnd';
import { Piece } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

interface BoardPieceProps {
  piece: Piece;
  x: number;
  y: number;
  rotation: number;
  flipped: boolean;
  onRemove: (x: number, y: number) => void;
}

const BoardPiece: React.FC<BoardPieceProps> = ({ piece, x, y, rotation, flipped, onRemove }) => {
  const { theme } = useTheme();
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'board-piece',
    item: { piece, x, y, rotation, flipped },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleClick = () => {
    onRemove(x, y);
  };

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`w-8 h-8 border transition-colors duration-200 ${theme.pieceColors[piece.name]} border-gray-600 cursor-move hover:opacity-80`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={handleClick}
      title={`Piece ${piece.name} (click to remove or drag to move)`}
    />
  );
};

export default BoardPiece;
