import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Piece } from '@/lib/types';
import { useGame } from '@/contexts/GameContext';

interface PieceProps {
  piece: Piece;
}

const PieceComponent: React.FC<PieceProps> = ({ piece }) => {
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { placedPieces } = useGame();
  
  const isUsed = placedPieces.some(p => p.piece.name === piece.name);
  
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'piece',
    item: { 
      piece, 
      rotation, 
      flipped,
      sourceType: 'bottom-panel' // Indicate this is from the bottom panel
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [piece, rotation, flipped]); // Add dependencies to recreate when rotation/flipped changes

  // Use empty image for drag preview to customize the preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const handleRotate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRotation((prev) => (prev + 1) % 4);
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFlipped(prev => !prev);
  };

  const getCurrentShape = () => {
    // Apply flipping first if needed
    if (flipped && piece.flips && piece.flips.length > 0) {
      return piece.flips[0];
    }
    
    // Apply rotation if needed
    if (rotation > 0 && piece.rotations && piece.rotations.length > rotation) {
      return piece.rotations[rotation];
    }
    
    return piece.shape;
  };

  // Get the bounding box of the piece to avoid rendering empty cells
  const getBoundingBox = (shape: number[][]) => {
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
  };

  const renderCompactShape = (shape: number[][]) => {
    const { minRow, maxRow, minCol, maxCol } = getBoundingBox(shape);
    
    if (minRow > maxRow || minCol > maxCol) {
      return <div className="w-8 h-8 bg-gray-200"></div>; // Empty piece fallback
    }
    
    const rows = [];
    for (let i = minRow; i <= maxRow; i++) {
      const cols = [];
      for (let j = minCol; j <= maxCol; j++) {
        cols.push(
          <div
            key={`${i}-${j}`}
            className={`w-8 h-8 border border-gray-200 ${
              shape[i][j] ? piece.color : 'bg-transparent'
            }`}
            style={{
              minWidth: '32px',
              minHeight: '32px',
            }}
          />
        );
      }
      rows.push(
        <div key={i} className="flex">
          {cols}
        </div>
      );
    }
    
    return <div className="inline-block">{rows}</div>;
  };

  const currentShape = getCurrentShape();

  // Hide the piece if it's used
  if (isUsed) {
    return null;
  }

  return (
    <div
      className={`p-2 m-1 rounded-lg shadow-md border-2 transition-all duration-200 bg-white border-gray-300 hover:border-blue-400 hover:shadow-lg`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-xs text-gray-700">{piece.name}</span>
        <div className="flex gap-1">
          <button
            onClick={handleRotate}
            className="text-xs px-1 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-[10px]"
            title="Rotate piece"
          >
            ↻
          </button>
          <button
            onClick={handleFlip}
            className="text-xs px-1 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-[10px]"
            title="Flip piece"
          >
            ⟲
          </button>
        </div>
      </div>
      
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className="inline-block cursor-move"
      >
        {renderCompactShape(currentShape)}
      </div>
      
      {flipped && (
        <div className="text-[10px] text-blue-600 mt-1">Flipped</div>
      )}
      {rotation > 0 && (
        <div className="text-[10px] text-green-600 mt-1">Rotated {rotation * 90}°</div>
      )}
    </div>
  );
};

export default PieceComponent;
