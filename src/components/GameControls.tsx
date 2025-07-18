import React from 'react';
import { useGame } from '@/contexts/GameContext';

const GameControls: React.FC = () => {
  const { 
    gameState, 
    startGame, 
    resetGame, 
    solveGame, 
    getHint,
    isBoardComplete,
    placedPieces
  } = useGame();

  const handlePlayClick = () => {
    startGame();
  };

  const handleResetClick = () => {
    resetGame();
  };

  const handleSolveClick = () => {
    solveGame();
  };

  const handleHintClick = () => {
    getHint();
  };

  const completedCells = placedPieces.length;
  const totalPieces = 12; // Total number of pieces

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handlePlayClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-semibold"
          disabled={gameState === 'playing'}
        >
          {gameState === 'idle' ? 'Start Game' : 'New Game'}
        </button>
        
        <button
          onClick={handleResetClick}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-semibold"
          disabled={gameState === 'idle'}
        >
          Reset
        </button>
        
        <button
          onClick={handleHintClick}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold"
          disabled={gameState !== 'playing'}
        >
          Hint
        </button>
        
        <button
          onClick={handleSolveClick}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors font-semibold"
          disabled={gameState !== 'playing'}
        >
          Solve
        </button>
      </div>

      {/* Game Status */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progress:</span>
          <span className="text-sm text-gray-600">{completedCells}/{totalPieces} pieces</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCells / totalPieces) * 100}%` }}
          />
        </div>

        <div className="text-center">
          {gameState === 'idle' && (
            <span className="text-sm text-gray-500">Click "Start Game" to begin</span>
          )}
          {gameState === 'playing' && !isBoardComplete() && (
            <span className="text-sm text-blue-600">Game in progress...</span>
          )}
          {gameState === 'playing' && isBoardComplete() && (
            <span className="text-sm text-green-600 font-semibold">🎉 Congratulations! Puzzle solved!</span>
          )}
          {gameState === 'solved' && (
            <span className="text-sm text-purple-600 font-semibold">✨ Puzzle solved automatically!</span>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="text-xs text-gray-500 border-t pt-2">
        <div className="font-medium mb-1">Tips:</div>
        <ul className="space-y-1">
          <li>• Drag pieces from the right panel to the board</li>
          <li>• Use rotate (↻) and flip (⟲) buttons on pieces</li>
          <li>• Click placed pieces to remove them</li>
          <li>• Use "Hint" for automatic piece placement</li>
        </ul>
      </div>
    </div>
  );
};

export default GameControls;
