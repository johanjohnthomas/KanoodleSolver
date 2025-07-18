"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useGame } from "@/contexts/GameContext";
import { BOARD_LAYOUTS } from "@/lib/pieces";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { gameConfig, updateGameConfig } = useGame();

  if (!isOpen) {
    return null;
  }

  const handleColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    part: "boardBg" | "emptyCellBg" | string
  ) => {
    if (part === "boardBg" || part === "emptyCellBg") {
      setTheme({ ...theme, [part]: `bg-[${e.target.value}]` });
    } else {
      setTheme({
        ...theme,
        pieceColors: { ...theme.pieceColors, [part]: `bg-[${e.target.value}]` },
      });
    }
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const layout = BOARD_LAYOUTS.find(l => l.name === e.target.value);
    if (layout) {
      updateGameConfig({ currentLayout: layout });
    }
  };

  const handleConfigChange = (key: keyof typeof gameConfig, value: boolean) => {
    updateGameConfig({ [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg max-h-[80vh] overflow-y-auto max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Game Settings</h2>

        {/* Board Layout Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Board Layout</h3>
          <select
            value={gameConfig.currentLayout.name}
            onChange={handleLayoutChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {BOARD_LAYOUTS.map((layout) => (
              <option key={layout.name} value={layout.name}>
                {layout.name} ({layout.rows}×{layout.cols})
              </option>
            ))}
          </select>
        </div>

        {/* Game Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Game Options</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={gameConfig.showHints}
                onChange={(e) => handleConfigChange('showHints', e.target.checked)}
                className="mr-2"
              />
              Show visual hints
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={gameConfig.autoSolve}
                onChange={(e) => handleConfigChange('autoSolve', e.target.checked)}
                className="mr-2"
              />
              Auto-solve when possible
            </label>
          </div>
        </div>

        {/* Visual Customization */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Visual Customization</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-600">Board Background:</span>
              <input
                type="color"
                onChange={(e) => handleColorChange(e, "boardBg")}
                className="w-full mt-1 h-8 rounded border border-gray-300"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Empty Cell:</span>
              <input
                type="color"
                onChange={(e) => handleColorChange(e, "emptyCellBg")}
                className="w-full mt-1 h-8 rounded border border-gray-300"
              />
            </label>
          </div>
        </div>

        {/* Piece Colors */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Piece Colors</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(theme.pieceColors).map((pieceName) => (
              <label key={pieceName} className="block">
                <span className="text-sm text-gray-600">Piece {pieceName}:</span>
                <input
                  type="color"
                  onChange={(e) => handleColorChange(e, pieceName)}
                  className="w-full mt-1 h-8 rounded border border-gray-300"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Layout Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Current Layout Preview</h3>
          <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
            <div 
              className="inline-grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${gameConfig.currentLayout.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gameConfig.currentLayout.rows}, 1fr)`,
              }}
            >
              {gameConfig.currentLayout.shape.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`w-3 h-3 ${
                      cell ? 'bg-blue-200 border border-blue-300' : 'bg-transparent'
                    }`}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Apply Settings
          </button>
          <button
            onClick={() => {
              setTheme({
                boardBg: "bg-gray-200",
                emptyCellBg: "bg-gray-300",
                pieceColors: {
                  A: "bg-red-500", B: "bg-blue-500", C: "bg-green-500", D: "bg-yellow-500",
                  E: "bg-purple-500", F: "bg-orange-500", G: "bg-pink-500", H: "bg-indigo-500",
                  I: "bg-teal-500", J: "bg-lime-500", K: "bg-cyan-500", L: "bg-amber-500",
                },
              });
              updateGameConfig({ currentLayout: BOARD_LAYOUTS[0], showHints: false, autoSolve: false });
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
