import type { CSSProperties } from 'react';
import { occupiedCells, getPieceShape } from './pieceGeometry';
import type { Piece } from './types';

export type DeskPoint = Readonly<{ x: number; z: number }>;
export type HeldPiece = Readonly<{ piece: Piece; rotation: number; flipped: boolean; movingName: string | null }>;
export const BOARD_CENTER_Z = -1.5;
export const DESK_COLORS = {
  page: '#f5f0e7', paper: '#fffaf2', ink: '#343b32', muted: '#69705f', moss: '#405743', line: '#d8d4c8', lit: '#eae2d0',
  desk: '#dfc8a8', grain: '#b49169', case: '#222824', lip: '#343d36',
  socket: '#101713', brass: '#b3a481', valid: '#42704f', invalid: '#a34237', recovery: '#e7b858',
  ambient: '#fff2dd', sky: '#fff7e8', ground: '#9d8970', key: '#fff5e5', fill: '#ffffff',
} as const;
export const DESK_THEME: CSSProperties & Readonly<Record<`--desk-${string}`, string>> = {
  '--desk-page': DESK_COLORS.page, '--desk-paper': DESK_COLORS.paper, '--desk-ink': DESK_COLORS.ink,
  '--desk-muted': DESK_COLORS.muted, '--desk-moss': DESK_COLORS.moss, '--desk-line': DESK_COLORS.line,
  '--desk-wood': DESK_COLORS.desk, '--desk-lit': DESK_COLORS.lit,
  '--desk-case': DESK_COLORS.case, '--desk-lip': DESK_COLORS.lip, '--desk-socket': DESK_COLORS.socket,
  '--desk-valid': DESK_COLORS.valid, '--desk-invalid': DESK_COLORS.invalid,
  '--desk-recovery': DESK_COLORS.recovery,
  '--desk-shadow-flat-tray': '0 18px 36px rgb(55 44 29 / 18%), inset 0 1px 1px rgb(255 255 255 / 12%)',
  '--desk-shadow-flat-inset': 'inset 0 4px 14px rgb(0 0 0 / 36%), 0 1px rgb(255 255 255 / 8%)',
  '--desk-shadow-flat-socket': 'inset 0 3px 7px rgb(0 0 0 / 55%), 0 1px rgb(255 255 255 / 7%)',
  '--desk-shadow-flat-bead': 'inset -3px -4px 7px rgb(0 0 0 / 15%), inset 2px 3px 5px rgb(255 255 255 / 28%), 0 3px 7px rgb(0 0 0 / 22%)',
  '--desk-shadow-flat-palette': '0 5px 12px rgb(75 59 35 / 8%)',
  '--desk-shadow-flat-miniature': 'inset -2px -2px 3px rgb(0 0 0 / 14%), inset 1px 2px 3px rgb(255 255 255 / 26%), 0 2px 4px rgb(55 44 29 / 18%)',
};
export const BEAD_COLORS: Readonly<Record<string, string>> = {
  A: '#e56d45', B: '#8655be', C: '#8bc9d2', D: '#ef9a36',
  E: '#467bd0', F: '#ede0c4', G: '#3cb4bf', H: '#e67fa4',
  I: '#cf4554', J: '#58a26d', K: '#d7c649', L: '#ad729d',
};
export const SCATTER: readonly Readonly<{ x: number; z: number; angle: number }>[] = [
  { x: -8, z: -2.3, angle: -.22 }, { x: -4.5, z: 3.2, angle: -.1 },
  { x: 7.8, z: -4, angle: .32 }, { x: 8, z: -.6, angle: -.28 },
  { x: -8.4, z: 3.5, angle: .12 }, { x: 6.2, z: 4.5, angle: .15 },
  { x: -3.6, z: 6, angle: -.2 }, { x: 2.7, z: 4.5, angle: .22 },
  { x: -4.4, z: -5.7, angle: -.15 }, { x: 4.2, z: -5.9, angle: .17 },
  { x: .2, z: 6.5, angle: -.12 }, { x: 8.5, z: 3.1, angle: .23 },
];
export const beadStyle = (color: string): CSSProperties & Readonly<{ '--bead': string }> => ({ '--bead': color });

export function pieceBounds(piece: Piece, rotation = 0, flipped = false) {
  const cells = occupiedCells(getPieceShape(piece, rotation, flipped));
  return { width: Math.max(...cells.map(c => c.x)) + 1, depth: Math.max(...cells.map(c => c.y)) + 1 };
}

export function dropOrigin(held: HeldPiece, point: DeskPoint) {
  const bounds = pieceBounds(held.piece, held.rotation, held.flipped);
  return {
    x: Math.round(point.x + 5 - (bounds.width - 1) / 2),
    y: Math.round(point.z - BOARD_CENTER_Z + 2 - (bounds.depth - 1) / 2),
  };
}

export function placementCenter(piece: Piece, x: number, y: number, rotation: number, flipped: boolean): DeskPoint {
  const bounds = pieceBounds(piece, rotation, flipped);
  return { x: x - 5 + (bounds.width - 1) / 2, z: y - 2 + BOARD_CENTER_Z + (bounds.depth - 1) / 2 };
}

export const isOverBoard = (point: DeskPoint): boolean =>
  Math.abs(point.x) < 5.75 && Math.abs(point.z - BOARD_CENTER_Z) < 2.75;
