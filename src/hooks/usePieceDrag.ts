"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent as ReactPointerEvent } from "react";

import type { Piece } from "@/lib/types";

export type BoardTarget = Readonly<{ x: number; y: number }>;

export type PieceDragPayload = Readonly<{
  piece: Piece;
  rotation: number;
  flipped: boolean;
  movingName: string | null;
}>;

export type PieceDragSession = Readonly<{
  payload: PieceDragPayload;
  pointer: Readonly<{ x: number; y: number }>;
  target: BoardTarget | null;
  active: boolean;
}>;

export type DragHandleProps = Readonly<{
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}>;

type PieceDragOptions = Readonly<{
  onDrop: (payload: PieceDragPayload, target: BoardTarget | null) => void;
  onPickup: () => void;
  onTransform: (kind: "rotate" | "flip") => void;
}>;

const targetAtPoint = (x: number, y: number): BoardTarget | null => {
  const element = document.elementFromPoint(x, y);
  const cell = element?.closest<HTMLElement>("[data-board-x][data-board-y]");
  if (cell === undefined || cell === null) return null;
  const boardX = Number(cell.dataset.boardX);
  const boardY = Number(cell.dataset.boardY);
  return Number.isInteger(boardX) && Number.isInteger(boardY)
    ? { x: boardX, y: boardY }
    : null;
};

const distanceFrom = (
  first: Readonly<{ x: number; y: number }>,
  second: Readonly<{ x: number; y: number }>,
): number => Math.hypot(second.x - first.x, second.y - first.y);

const edgeScrollDelta = (pointerY: number): number => {
  const edge = Math.min(96, window.innerHeight * 0.18);
  if (pointerY < edge) return -Math.ceil((edge - pointerY) / 6);
  if (pointerY > window.innerHeight - edge) return Math.ceil((pointerY - (window.innerHeight - edge)) / 6);
  return 0;
};

export function usePieceDrag({ onDrop, onPickup, onTransform }: PieceDragOptions) {
  const [session, setSession] = useState<PieceDragSession | null>(null);
  const sessionRef = useRef<PieceDragSession | null>(null);
  const startPointRef = useRef<Readonly<{ x: number; y: number }> | null>(null);
  const suppressClickRef = useRef(false);

  const updateSession = useCallback((next: PieceDragSession | null): void => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  const start = useCallback((
    event: ReactPointerEvent<HTMLButtonElement>,
    payload: PieceDragPayload,
  ): void => {
    if (event.button !== 0) return;
    const point = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    startPointRef.current = point;
    suppressClickRef.current = false;
    updateSession({ payload, pointer: point, target: null, active: false });
  }, [updateSession]);

  const move = useCallback((event: ReactPointerEvent<HTMLButtonElement>): void => {
    const current = sessionRef.current;
    const startedAt = startPointRef.current;
    if (current === null || startedAt === null) return;
    const pointer = { x: event.clientX, y: event.clientY };
    const active = current.active || distanceFrom(startedAt, pointer) >= 6;
    if (active && !current.active) onPickup();
    if (active) event.preventDefault();
    updateSession({
      ...current,
      active,
      pointer,
      target: active ? targetAtPoint(pointer.x, pointer.y) : null,
    });
  }, [onPickup, updateSession]);

  const finish = useCallback((event: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean): void => {
    const current = sessionRef.current;
    if (current?.active) {
      suppressClickRef.current = true;
      if (!cancelled) onDrop(current.payload, targetAtPoint(event.clientX, event.clientY));
    }
    startPointRef.current = null;
    updateSession(null);
  }, [onDrop, updateSession]);

  useEffect(() => {
    if (!session?.active) return;
    const handleKey = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key !== "a" && key !== "d" && key !== "r" && key !== "f") return;
      event.preventDefault();
      const current = sessionRef.current;
      if (current === null) return;
      const payload = key === "f"
        ? { ...current.payload, flipped: !current.payload.flipped }
        : {
            ...current.payload,
            rotation: (current.payload.rotation + (key === "a" ? 3 : 1)) % 4,
          };
      onTransform(key === "f" ? "flip" : "rotate");
      updateSession({ ...current, payload });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onTransform, session?.active, updateSession]);

  useEffect(() => {
    if (!session?.active) return;
    let frame = 0;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    const scrollNearEdge = (): void => {
      const current = sessionRef.current;
      if (current === null) return;
      const delta = edgeScrollDelta(current.pointer.y);
      if (delta !== 0) {
        window.scrollBy(0, delta);
        updateSession({
          ...current,
          target: targetAtPoint(current.pointer.x, current.pointer.y),
        });
      }
      frame = window.requestAnimationFrame(scrollNearEdge);
    };
    frame = window.requestAnimationFrame(scrollNearEdge);
    return () => {
      window.cancelAnimationFrame(frame);
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, [session?.active, updateSession]);

  const bind = useCallback((
    payload: PieceDragPayload,
    onClick: () => void,
  ): DragHandleProps => ({
    onPointerDown: (event) => start(event, payload),
    onPointerMove: move,
    onPointerUp: (event) => finish(event, false),
    onPointerCancel: (event) => finish(event, true),
    onClick: (event) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        event.preventDefault();
        return;
      }
      onClick();
    },
  }), [finish, move, start]);

  return { bind, session: session?.active ? session : null };
}
