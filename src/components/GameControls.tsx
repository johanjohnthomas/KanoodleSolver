import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import RandomGameSetup from './RandomGameSetup';

const GameControls: React.FC = () => {
  const { 
    gameState, 
    startGame, 
    startRandomGame,
    resetGame, 
    solveGame, 
    getHint,
    isBoardComplete,
    placedPieces,
    hintMessage,
    clearHintMessage,
    nextHintPreview
  } = useGame();

  const [showRandomSetup, setShowRandomSetup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlayClick = () => {
    startGame();
  };

  const handleResetClick = () => {
    resetGame();
  };

  const handleSolveClick = () => {
    setIsProcessing(true);
    // Use setTimeout to allow UI to update before processing
    setTimeout(() => {
      try {
        solveGame();
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  };

  const handleHintClick = () => {
    setIsProcessing(true);
    // Use setTimeout to allow UI to update before processing
    setTimeout(() => {
      try {
        getHint();
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  };

  const handleRandomGameSetup = () => {
    setShowRandomSetup(true);
  };

  const handleStartRandomGame = (numPieces: number, selectedPieces: string[]) => {
    startRandomGame(numPieces, selectedPieces);
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
          onClick={handleRandomGameSetup}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors font-semibold"
          disabled={gameState === 'playing'}
        >
          Random Game
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
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={gameState !== 'playing' || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Working...
            </>
          ) : (
            'Hint'
          )}
        </button>
        
        <button
          onClick={handleSolveClick}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={gameState !== 'playing' || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Solving...
            </>
          ) : (
            'Solve'
          )}
        </button>
      </div>

      {/* Game Status */}
      <div className="flex flex-col gap-2">
        {/* Hint Message */}
        {hintMessage && (
          <div className="text-center p-2 bg-blue-50 border border-blue-200 rounded-md">
            <span className="text-sm text-blue-700 font-medium">{hintMessage}</span>
            <button 
              onClick={clearHintMessage}
              className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Next Hint Preview Info */}
        {nextHintPreview && (
          <div className="text-center p-2 bg-green-50 border border-green-200 rounded-md">
            <span className="text-sm text-green-700">
              💡 Next hint available: {nextHintPreview.piece.name} piece
            </span>
          </div>
        )}
        
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
            <li>• Use "Random Game" for custom starting configurations</li>
            <li>• Hint and Solve use fast algorithms for quick results</li>
          </ul>
        </div>      {/* Random Game Setup Modal */}
      <RandomGameSetup
        isOpen={showRandomSetup}
        onClose={() => setShowRandomSetup(false)}
        onStartRandomGame={handleStartRandomGame}
      />
    </div>
  );
};

export default GameControls;
