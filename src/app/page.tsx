"use client";

import React, { useState } from "react";
import Board from "@/components/Board";
import PieceComponent from "@/components/Piece";
import GameControls from "@/components/GameControls";
import Settings from "@/components/Settings";
import { DndWrapper } from "@/components/DndWrapper";
import { useGame } from "@/contexts/GameContext";
import { PIECES } from "@/lib/pieces";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { board, placePiece, removePiece, gameConfig, gameState } = useGame();

  const handleDropPiece = (item: any, x: number, y: number) => {
    console.log('Dropping piece:', item); // Debug log
    const piece = item.piece;
    const rotation = item.rotation || 0;
    const flipped = item.flipped || false;
    
    if (!piece) {
      console.error('No piece found in drop item:', item);
      return;
    }
    
    placePiece(piece, x, y, rotation, flipped);
  };

  const handleMovePiece = (item: any, x: number, y: number) => {
    console.log('Moving piece:', item); // Debug log
    const piece = item.piece;
    const rotation = item.rotation || 0;
    const flipped = item.flipped || false;
    
    if (!piece) {
      console.error('No piece found in move item:', item);
      return;
    }
    
    // Remove the piece from its current position
    removePiece(item.x, item.y);
    
    // Place the piece in the new position
    placePiece(piece, x, y, rotation, flipped);
  };

  return (
    <DndWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Kanoodle Solver
            </h1>
            <p className="text-lg text-gray-600">
              Solve puzzles with drag & drop, hints, and auto-solving
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold"
              >
                ⚙️ Settings
              </button>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-700">
                  Layout: {gameConfig.currentLayout.name}
                </span>
              </div>
            </div>
          </header>

          {/* Main Game Area */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Panel - Game Controls */}
            <div className="w-full lg:w-80 order-2 lg:order-1">
              <GameControls />
            </div>

            {/* Center - Game Board */}
            <div className="flex-1 flex justify-center order-1 lg:order-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Board 
                  board={board} 
                  onDropPiece={handleDropPiece} 
                  onMovePiece={handleMovePiece}
                />
              </div>
            </div>
          </div>

          {/* Bottom Panel - Game Pieces */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
                  Game Pieces
                </h2>
                {/* Piece Legend */}
                <div className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                  <span>• Drag pieces to the board</span>
                  <span>• Use ↻ to rotate</span>
                  <span>• Use ⟲ to flip</span>
                  <span>• Click board pieces to remove</span>
                  <span>• Used pieces disappear from here</span>
                </div>
              </div>
              
              {/* Horizontal pieces layout */}
              <div className="flex flex-wrap gap-2 justify-center">
                {PIECES.map((piece) => (
                  <div key={piece.name} className="flex-shrink-0">
                    <PieceComponent piece={piece} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Status Footer */}
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>
              {gameState === 'idle' && "Welcome to Kanoodle Solver! Start a new game to begin."}
              {gameState === 'playing' && "Drag pieces to the board and solve the puzzle!"}
              {gameState === 'solved' && "🎉 Puzzle solved! Start a new game to play again."}
            </p>
          </footer>
        </div>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </DndWrapper>
  );
}
