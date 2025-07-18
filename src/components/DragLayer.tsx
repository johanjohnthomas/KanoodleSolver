import React from 'react';
import { useDragLayer } from 'react-dnd';
import { Piece } from '@/lib/types';

interface DragLayerProps {}

const DragLayer: React.FC<DragLayerProps> = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  // Get the piece shape for preview
  const renderPiecePreview = () => {
    if (!item || !item.piece) return null;

    const piece = item.piece;
    const rotation = item.rotation || 0;
    const flipped = item.flipped || false;
    
    let shape: number[][];
    
    // Use the same transformation logic as the rest of the app
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

    // Get bounding box
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
    
    if (minRow > maxRow || minCol > maxCol) {
      return null;
    }

    const rows = [];
    for (let i = minRow; i <= maxRow; i++) {
      const cols = [];
      for (let j = minCol; j <= maxCol; j++) {
        cols.push(
          <div
            key={`${i}-${j}`}
            className={`w-8 h-8 border border-gray-300 ${
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
    
    return (
      <div className="inline-block pointer-events-none opacity-80">
        {rows}
      </div>
    );
  };

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: currentOffset.x - 16, // Offset to center the piece on cursor
        top: currentOffset.y - 16,
      }}
    >
      {renderPiecePreview()}
    </div>
  );
};

export default DragLayer;
