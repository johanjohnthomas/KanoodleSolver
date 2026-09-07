'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Group, MathUtils, Plane, Vector3 } from 'three';
import { occupiedCells } from '@/lib/pieceGeometry';
import { BEAD_COLORS, DESK_COLORS, pieceBounds } from '@/lib/tabletop';
import type { DeskPoint } from '@/lib/tabletop';
import type { Piece } from '@/lib/types';

type Props = Readonly<{
  piece: Piece; point: DeskPoint; rotation: number; flipped: boolean; angle: number;
  lifted: boolean; seated: boolean; dragging: boolean; reducedMotion: boolean;
  needsAttention: boolean; disabled: boolean;
  onPick: () => void; onDrag: () => void; onMove: (point: DeskPoint) => void; onDrop: (point: DeskPoint) => void;
}>;
const dragPlane = new Plane(new Vector3(0, 1, 0), -.65);
const intersection = new Vector3();
const planePoint = (event: ThreeEvent<PointerEvent>): DeskPoint | null => {
  const hit = event.ray.intersectPlane(dragPlane, intersection);
  return hit ? { x: hit.x, z: hit.z } : null;
};

export function BeadPiece({ piece, point, rotation, flipped, angle, lifted, seated, dragging, reducedMotion, needsAttention, disabled,
  onPick, onDrag, onMove, onDrop }: Props) {
  const positionRef = useRef<Group>(null); const turnRef = useRef<Group>(null); const flipRef = useRef<Group>(null);
  const pressed = useRef<Readonly<{ x: number; y: number }> | null>(null);
  const didDrag = useRef(false);
  const initialPosition = useRef<[number, number, number]>([point.x, seated ? .64 : .46, point.z]);
  const targetPosition = useMemo(() => new Vector3(), []);
  const cells = useMemo(() => occupiedCells(piece.shape), [piece]);
  const bounds = useMemo(() => pieceBounds(piece), [piece]);
  const height = dragging ? 1.5 : lifted ? 1.22 : seated ? .64 : .46;
  const yaw = -rotation * Math.PI / 2 + angle;
  const roll = flipped ? Math.PI : 0;
  useFrame((state, dt) => {
    const root = positionRef.current; const turn = turnRef.current; const flip = flipRef.current;
    if (!root || !turn || !flip) return;
    const step = Math.min(dt, 1 / 30);
    const turningOver = Math.abs(flip.rotation.z - roll) > .01;
    const clearance = turningOver && lifted ? Math.abs(Math.sin(flip.rotation.z)) * bounds.width / 2 : 0;
    const target = targetPosition.set(point.x, height + clearance, point.z);
    const moving = root.position.distanceTo(target) > .001 || Math.abs(turn.rotation.y - yaw) > .001 || Math.abs(flip.rotation.z - roll) > .001;
    if (reducedMotion) { root.position.copy(target); turn.rotation.y = yaw; flip.rotation.z = roll; }
    else {
      root.position.lerp(target, 1 - Math.exp(-18 * step));
      turn.rotation.y = MathUtils.damp(turn.rotation.y, yaw, 12, step);
      flip.rotation.z = MathUtils.damp(flip.rotation.z, roll, 12, step);
    }
    if (moving) state.invalidate();
  });
  return (
    <group ref={positionRef} position={initialPosition.current} name={`piece-${piece.name}`}>
      <group ref={turnRef}>
        <group ref={flipRef}
          onPointerDown={event => {
            if (disabled || event.button !== 0) return;
            event.stopPropagation(); pressed.current = { x: event.clientX, y: event.clientY }; didDrag.current = false;
            if (event.target && 'setPointerCapture' in event.target && typeof event.target.setPointerCapture === 'function') event.target.setPointerCapture(event.pointerId);
            onPick();
          }}
          onPointerMove={event => {
            if (disabled) return;
            event.stopPropagation();
            if (!pressed.current) return;
            const distance = Math.hypot(event.clientX - pressed.current.x, event.clientY - pressed.current.y);
            if (distance < 5 && !didDrag.current) return;
            didDrag.current = true; onDrag(); const next = planePoint(event); if (next) onMove(next);
          }}
          onPointerUp={event => {
            event.stopPropagation();
            if (event.target && 'releasePointerCapture' in event.target && typeof event.target.releasePointerCapture === 'function') event.target.releasePointerCapture(event.pointerId);
            pressed.current = null;
            if (didDrag.current && !disabled) { const next = planePoint(event); if (next) onDrop(next); }
            didDrag.current = false;
          }}
          onPointerCancel={() => { pressed.current = null; didDrag.current = false; }}
          onClick={event => event.stopPropagation()}
          onPointerOver={event => { if (disabled) return; event.stopPropagation(); document.body.style.cursor = 'grab'; }}
          onPointerOut={() => { document.body.style.cursor = ''; }}>
          {cells.map(cell => (
            <mesh key={`${cell.x}:${cell.y}`} position={[cell.x - (bounds.width - 1) / 2, 0, cell.y - (bounds.depth - 1) / 2]} castShadow receiveShadow>
              <sphereGeometry args={[.455, 28, 20]} />
              <meshPhysicalMaterial color={BEAD_COLORS[piece.name]} roughness={.24} metalness={.03} clearcoat={.48} clearcoatRoughness={.22}
                emissive={DESK_COLORS.recovery} emissiveIntensity={needsAttention ? .22 : 0} />
              {needsAttention && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .12, 0]}>
                <torusGeometry args={[.48, .05, 8, 32]} /><meshBasicMaterial color={DESK_COLORS.recovery} />
              </mesh>}
            </mesh>
          ))}
          {cells.flatMap(cell => [{ x: cell.x + 1, y: cell.y }, { x: cell.x, y: cell.y + 1 }]
            .filter(next => cells.some(c => c.x === next.x && c.y === next.y))
            .map(next => (
              <mesh key={`${cell.x}:${cell.y}:${next.x}:${next.y}`}
                position={[(cell.x + next.x) / 2 - (bounds.width - 1) / 2, 0, (cell.y + next.y) / 2 - (bounds.depth - 1) / 2]}
                rotation={next.x !== cell.x ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[.22, .22, 1, 16]} />
                <meshPhysicalMaterial color={BEAD_COLORS[piece.name]} roughness={.25} clearcoat={.4} />
              </mesh>
            )))}
        </group>
      </group>
    </group>
  );
}
