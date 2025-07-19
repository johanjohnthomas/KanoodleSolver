import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { PIECES } from '@/lib/pieces';

interface RandomGameSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRandomGame: (numPieces: number, selectedPieces: string[]) => void;
}

// Component to render a small visual representation of a piece
const PiecePreview: React.FC<{ piece: any; isSelected: boolean; onClick: () => void }> = ({ 
  piece, 
  isSelected, 
  onClick 
}) => {
  const cellSize = 12;
  const maxRows = Math.max(...piece.shape.map((row: number[]) => row.length));
  const maxCols = piece.shape.length;
  
  return (
    <div
      onClick={onClick}
      className={`
        p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-medium text-gray-700">{piece.name}</div>
        <div 
          className="grid gap-1"
          style={{ 
            gridTemplateColumns: `repeat(${maxCols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${maxRows}, ${cellSize}px)`
          }}
        >
          {piece.shape.map((row: number[], rowIndex: number) =>
            row.map((cell: number, colIndex: number) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="border border-gray-300"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: cell ? piece.color : 'transparent',
                  opacity: cell ? 1 : 0.1
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const RandomGameSetup: React.FC<RandomGameSetupProps> = ({ isOpen, onClose, onStartRandomGame }) => {
  const [selectedPieces, setSelectedPieces] = useState<string[]>([]);

  const handlePieceToggle = (pieceName: string) => {
    setSelectedPieces(prev => 
      prev.includes(pieceName) 
        ? prev.filter(name => name !== pieceName)
        : [...prev, pieceName]
    );
  };

  const handleSelectAll = () => {
    setSelectedPieces(PIECES.map(p => p.name));
  };

  const handleSelectNone = () => {
    setSelectedPieces([]);
  };

  const handleStart = () => {
    if (selectedPieces.length === 0) {
      alert('Please select at least one piece to start with');
      return;
    }
    onStartRandomGame(selectedPieces.length, selectedPieces);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Random Game Setup</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Select the pieces you want to be randomly placed on the board at the start of the game. 
            Click on pieces to select/deselect them.
          </p>
        </div>

        {/* Piece selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Selected pieces ({selectedPieces.length}/{PIECES.length}):
            </label>
            <div className="space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={handleSelectNone}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Select None
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {PIECES.map(piece => (
              <PiecePreview
                key={piece.name}
                piece={piece}
                isSelected={selectedPieces.includes(piece.name)}
                onClick={() => handlePieceToggle(piece.name)}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold"
            disabled={selectedPieces.length === 0}
          >
            Start Game with {selectedPieces.length} Piece{selectedPieces.length !== 1 ? 's' : ''}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomGameSetup;
