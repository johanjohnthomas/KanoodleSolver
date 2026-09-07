'use client';

import { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { caseGeometry, caseInscription } from './sceneGeometry';
import { BOARD_CENTER_Z, DESK_COLORS } from '@/lib/tabletop';
import { cellsForPlacement } from '@/lib/pieceGeometry';
import type { PieceDropRequest } from '@/lib/gameBoard';
import type { DeskPoint } from '@/lib/tabletop';

type Props = Readonly<{ request: PieceDropRequest | null; valid: boolean; onHover: (point: DeskPoint) => void; onPlace: (point: DeskPoint) => void }>;

export function KanoodleCase({ request, valid, onHover, onPlace }: Props) {
  const base = useMemo(() => caseGeometry(false), []);
  const plate = useMemo(() => caseGeometry(true), []);
  const label = useMemo(caseInscription, []);
  const cells = request ? cellsForPlacement(request.piece, request.x, request.y, request.rotation, request.flipped) : [];
  const pointEvent = (event: ThreeEvent<PointerEvent>): void => onHover({ x: event.point.x, z: event.point.z });
  return (
    <group position={[0, 0, BOARD_CENTER_Z]}>
      <mesh geometry={base} rotation={[-Math.PI / 2, 0, 0]} position={[0, .035, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={DESK_COLORS.socket} roughness={.55} />
      </mesh>
      <mesh geometry={plate} rotation={[-Math.PI / 2, 0, 0]} position={[0, .18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={DESK_COLORS.case} roughness={.42} metalness={.08} />
      </mesh>
      {[-3.6, 3.6].map(x => (
        <mesh key={x} position={[x, .21, -3.16]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[.14, .14, 1.45, 20]} />
          <meshStandardMaterial color={DESK_COLORS.lip} roughness={.4} />
        </mesh>
      ))}
      <mesh position={[0, .19, 3.14]} castShadow><boxGeometry args={[1.2, .22, .22]} /><meshStandardMaterial color={DESK_COLORS.lip} roughness={.45} /></mesh>
      <mesh position={[0, .437, 2.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.1, .31]} /><meshBasicMaterial map={label} transparent depthWrite={false} />
      </mesh>
      <mesh position={[0, .41, 0]} rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={pointEvent} onClick={event => { event.stopPropagation(); onPlace({ x: event.point.x, z: event.point.z }); }}>
        <planeGeometry args={[11.5, 5.5]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {cells.filter(c => c.x >= 0 && c.x < 11 && c.y >= 0 && c.y < 5).map(cell => (
        <mesh key={`${cell.x}:${cell.y}`} position={[cell.x - 5, .425, cell.y - 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[.28, .405, 32]} />
          <meshBasicMaterial color={valid ? DESK_COLORS.valid : DESK_COLORS.invalid} transparent opacity={.92} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
