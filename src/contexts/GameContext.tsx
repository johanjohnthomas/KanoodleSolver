"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Board, GameState, PlacedPiece, BoardLayout, GameConfig } from '@/lib/types';
import { BOARD_LAYOUTS } from '@/lib/pieces';
import { KanoodleSolver, createEmptyBoard, isValidPiecePlacement, placePieceOnBoard } from '@/lib/solver';

interface GameContextType {
  board: Board;
  resetBoard: Board;
  gameState: GameState;
  gameConfig: GameConfig;
  placedPieces: PlacedPiece[];
  
  // Actions
  setBoard: (board: Board) => void;
  placePiece: (piece: any, x: number, y: number, rotation?: number, flipped?: boolean) => boolean;
  removePiece: (x: number, y: number) => void;
  startGame: () => void;
  resetGame: () => void;
  solveGame: () => void;
  getHint: () => void;
  updateGameConfig: (config: Partial<GameConfig>) => void;
  
  // Getters
  isBoardComplete: () => boolean;
  canPlacePiece: (piece: any, x: number, y: number, rotation?: number, flipped?: boolean) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    currentLayout: BOARD_LAYOUTS[0],
    showHints: false,
    autoSolve: false,
  });
  
  const [board, setBoard] = useState<Board>(() => createEmptyBoard(gameConfig.currentLayout));
  const [resetBoard, setResetBoard] = useState<Board>(() => createEmptyBoard(gameConfig.currentLayout));
  const [gameState, setGameState] = useState<GameState>('idle');
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>([]);

  const updateGameConfig = useCallback((config: Partial<GameConfig>) => {
    setGameConfig(prev => {
      const newConfig = { ...prev, ...config };
      
      // If layout changed, reset the board
      if (config.currentLayout && config.currentLayout !== prev.currentLayout) {
        const newBoard = createEmptyBoard(config.currentLayout);
        setBoard(newBoard);
        setResetBoard(newBoard);
        setPlacedPieces([]);
        setGameState('idle');
      }
      
      return newConfig;
    });
  }, []);

  const placePiece = useCallback((piece: any, x: number, y: number, rotation: number = 0, flipped: boolean = false): boolean => {
    if (!piece || !piece.shape) {
      console.error('Invalid piece passed to placePiece:', piece);
      return false;
    }

    let success = false;
    
    // Use functional state updates to work with the latest state
    setBoard(currentBoard => {
      setPlacedPieces(currentPlacedPieces => {
        // Create a working copy of the board
        let workingBoard = currentBoard.map(row => [...row]);
        
        // Check if this piece is already placed and remove it
        const existingPiece = currentPlacedPieces.find(p => p.piece.name === piece.name);
        if (existingPiece) {
          // Remove the existing piece from the working board
          for (let i = 0; i < workingBoard.length; i++) {
            for (let j = 0; j < workingBoard[i].length; j++) {
              if (workingBoard[i][j] === piece.name) {
                workingBoard[i][j] = null;
              }
            }
          }
        }
        
        // Validate the placement on the working board
        if (!isValidPiecePlacement(workingBoard, gameConfig.currentLayout, piece, x, y, rotation, flipped)) {
          success = false;
          return currentPlacedPieces; // Return unchanged
        }

        // Place the piece on the working board
        const finalBoard = placePieceOnBoard(workingBoard, piece, x, y, rotation, flipped);
        
        // Update the board state
        setBoard(finalBoard);
        success = true;
        
        // Prepare the new placed pieces array
        const newPlacedPiece: PlacedPiece = { piece, x, y, rotation, flipped };
        const filteredPieces = currentPlacedPieces.filter(p => p.piece.name !== piece.name);
        const newPlacedPieces = [...filteredPieces, newPlacedPiece];
        
        return newPlacedPieces;
      });
      
      return currentBoard; // This will be overridden by the inner setBoard
    });
    
    return success;
  }, [gameConfig.currentLayout]);

  const removePiece = useCallback((x: number, y: number) => {
    const newBoard = board.map(row => [...row]);
    const pieceToRemove = newBoard[y][x];
    
    if (pieceToRemove) {
      // Remove all instances of this piece
      for (let i = 0; i < newBoard.length; i++) {
        for (let j = 0; j < newBoard[i].length; j++) {
          if (newBoard[i][j] === pieceToRemove) {
            newBoard[i][j] = null;
          }
        }
      }
      
      setBoard(newBoard);
      setPlacedPieces(prev => prev.filter(p => p.piece.name !== pieceToRemove));
    }
  }, [board]);

  const startGame = useCallback(() => {
    const solver = new KanoodleSolver(createEmptyBoard(gameConfig.currentLayout), gameConfig.currentLayout);
    const startingPieces = solver.generateRandomStartingPosition();
    const newBoard = solver.getSolution();
    
    setBoard(newBoard);
    setResetBoard(newBoard);
    setPlacedPieces(startingPieces);
    setGameState('playing');
  }, [gameConfig.currentLayout]);

  const resetGame = useCallback(() => {
    setBoard(resetBoard.map(row => [...row]));
    setGameState('playing');
  }, [resetBoard]);

  const solveGame = useCallback(() => {
    const solver = new KanoodleSolver(board, gameConfig.currentLayout);
    const solution = solver.solve();
    
    if (solution) {
      const solvedBoard = solver.getSolution();
      setBoard(solvedBoard);
      setPlacedPieces(solution);
      setGameState('solved');
    }
  }, [board, gameConfig.currentLayout]);

  const getHint = useCallback(() => {
    const solver = new KanoodleSolver(board, gameConfig.currentLayout);
    const hint = solver.getHint();
    
    if (hint) {
      const success = placePiece(hint.piece, hint.x, hint.y, hint.rotation, hint.flipped);
      if (success) {
        // Update reset board to include the hint
        const newResetBoard = placePieceOnBoard(resetBoard, hint.piece, hint.x, hint.y, hint.rotation, hint.flipped);
        setResetBoard(newResetBoard);
      }
    }
  }, [board, gameConfig.currentLayout, placePiece, resetBoard]);

  const canPlacePiece = useCallback((piece: any, x: number, y: number, rotation: number = 0, flipped: boolean = false): boolean => {
    return isValidPiecePlacement(board, gameConfig.currentLayout, piece, x, y, rotation, flipped);
  }, [board, gameConfig.currentLayout]);

  const isBoardComplete = useCallback((): boolean => {
    for (let y = 0; y < gameConfig.currentLayout.rows; y++) {
      for (let x = 0; x < gameConfig.currentLayout.cols; x++) {
        if (gameConfig.currentLayout.shape[y][x] && board[y][x] === null) {
          return false;
        }
      }
    }
    return true;
  }, [board, gameConfig.currentLayout]);

  const value: GameContextType = {
    board,
    resetBoard,
    gameState,
    gameConfig,
    placedPieces,
    setBoard,
    placePiece,
    removePiece,
    startGame,
    resetGame,
    solveGame,
    getHint,
    updateGameConfig,
    isBoardComplete,
    canPlacePiece,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
