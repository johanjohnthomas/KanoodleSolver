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
    let shape = piece.shape;
    
    // Apply transformations
    if (item.flipped && piece.flips && piece.flips.length > 0) {
      shape = piece.flips[0];
    }
    
    if (item.rotation > 0 && piece.rotations && piece.rotations.length > item.rotation) {
      shape = piece.rotations[item.rotation];
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
