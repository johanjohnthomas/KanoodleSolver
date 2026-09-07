'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { PCFSoftShadowMap } from 'three';
import { BeadPiece } from './BeadPiece';
import { KanoodleCase } from './KanoodleCase';
import { DeskFurniture } from './DeskFurniture';
import { RoomWindow } from './RoomWindow';
import { ROOM_COLORS, ROOM_ATMOSPHERES, SEATED_VIEW } from '@/lib/room';
import type { TimeOfDay } from '@/lib/room';
import { SceneCamera } from './SceneCamera';
import { DeskLamp } from './DeskLamp';
import { DESK_COLORS, SCATTER, placementCenter } from '@/lib/tabletop';
import type { DeskPoint, HeldPiece } from '@/lib/tabletop';
import type { PieceDropRequest } from '@/lib/gameBoard';
import { PIECES } from '@/lib/pieces';
import type { Piece, PlacedPiece } from '@/lib/types';

export type TabletopSceneProps = Readonly<{
  placements: readonly PlacedPiece[]; held: HeldPiece | null; pointer: DeskPoint | null; dragging: boolean;
  request: PieceDropRequest | null; valid: boolean; overhead: boolean; reducedMotion: boolean; disabled: boolean;
  drawerOpen: boolean; onDrawerToggle: () => void;
  recoveryNames: readonly string[];
  timeOfDay: TimeOfDay; activity: boolean;
  onPick: (piece: Piece) => void; onDrag: () => void; onMove: (point: DeskPoint) => void;
  onDrop: (point: DeskPoint) => void; onUnavailable: () => void;
}>;

function SceneContents(props: TabletopSceneProps) {
  const atmosphere = ROOM_ATMOSPHERES[props.timeOfDay];
  return <>
    <SceneCamera overhead={props.overhead} reducedMotion={props.reducedMotion} />
    <ambientLight intensity={atmosphere.ambientPower} color={atmosphere.ambient} />
    <hemisphereLight args={[atmosphere.skyLight, atmosphere.groundLight, atmosphere.hemispherePower]} />
    <directionalLight position={[-8, 16, -5]} intensity={atmosphere.keyPower} color={atmosphere.key} castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-15} shadow-camera-right={15}
      shadow-camera-top={14} shadow-camera-bottom={-14} shadow-normalBias={.035} shadow-bias={-.00015} shadow-radius={4} />
    <directionalLight position={[8, 8, 5]} intensity={atmosphere.fillPower} color={atmosphere.fill} />
    {!props.overhead && <RoomWindow atmosphere={atmosphere} activity={props.activity} reducedMotion={props.reducedMotion} />}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6.8, 0]} receiveShadow>
      <planeGeometry args={[160, 160]} /><meshStandardMaterial color={ROOM_COLORS.floor} roughness={1} />
    </mesh>
    <DeskFurniture open={props.drawerOpen} reducedMotion={props.reducedMotion} onToggle={props.onDrawerToggle} />
    <DeskLamp atmosphere={atmosphere} />
    <KanoodleCase request={props.request} valid={props.valid}
      onHover={point => { if (props.held && !props.dragging) props.onMove(point); }}
      onPlace={point => { if (props.held && !props.disabled && !props.dragging) props.onDrop(point); }} />
    {PIECES.map((piece, index) => {
      const placement = props.placements.find(p => p.piece.name === piece.name);
      const selected = props.held?.piece.name === piece.name;
      const held = selected ? props.held : null;
      const scatter = SCATTER[index];
      const origin = placement ? placementCenter(piece, placement.x, placement.y, placement.rotation, placement.flipped) : scatter;
      const position = selected && props.dragging && props.pointer ? props.pointer : origin;
      return <BeadPiece key={piece.name} piece={piece} point={position}
        rotation={held?.rotation ?? placement?.rotation ?? 0} flipped={held?.flipped ?? placement?.flipped ?? false}
        angle={selected || placement ? 0 : scatter.angle} lifted={selected} seated={Boolean(placement)}
        dragging={selected && props.dragging} reducedMotion={props.reducedMotion}
        needsAttention={props.recoveryNames.includes(piece.name)}
        onPick={() => { if (!props.disabled) props.onPick(piece); }} onDrag={props.onDrag}
        onMove={props.onMove} onDrop={props.onDrop} />;
    })}
  </>;
}

export function TabletopScene(props: TabletopSceneProps) {
  const [supported, setSupported] = useState(false);
  const { onUnavailable } = props;
  useEffect(() => {
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2');
    if (!context) { onUnavailable(); return; }
    context.getExtension('WEBGL_lose_context')?.loseContext();
    setSupported(true);
  }, [onUnavailable]);
  if (!supported) return <p className="scene-loading">Setting your pieces on the desk…</p>;
  return <Canvas shadows={{ type: PCFSoftShadowMap }} frameloop="demand" dpr={[1, 1.75]}
    camera={{ position: [...SEATED_VIEW.position], fov: 50, near: .1, far: 200 }}
    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    onCreated={({ gl }) => { gl.setClearColor(DESK_COLORS.desk); }}
    fallback={<button type="button" onClick={props.onUnavailable}>Open the accessible 2D board</button>}>
    <SceneContents {...props} />
  </Canvas>;
}
