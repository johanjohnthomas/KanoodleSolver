'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OrthographicCamera, Vector3, PCFSoftShadowMap } from 'three';
import { BeadPiece } from './BeadPiece';
import { KanoodleCase } from './KanoodleCase';
import { deskTexture } from './sceneGeometry';
import { DESK_COLORS, SCATTER, placementCenter } from '@/lib/tabletop';
import type { DeskPoint, HeldPiece } from '@/lib/tabletop';
import type { PieceDropRequest } from '@/lib/gameBoard';
import { PIECES } from '@/lib/pieces';
import type { Piece, PlacedPiece } from '@/lib/types';

const deskCamera = new Vector3(1.2, 19, 14);
const topCamera = new Vector3(0, 25, .01);

export type TabletopSceneProps = Readonly<{
  placements: readonly PlacedPiece[]; held: HeldPiece | null; pointer: DeskPoint | null; dragging: boolean;
  request: PieceDropRequest | null; valid: boolean; overhead: boolean; reducedMotion: boolean; disabled: boolean;
  onPick: (piece: Piece) => void; onDrag: () => void; onMove: (point: DeskPoint) => void;
  onDrop: (point: DeskPoint) => void; onUnavailable: () => void;
}>;

function CameraRig({ overhead, reducedMotion }: Readonly<{ overhead: boolean; reducedMotion: boolean }>) {
  const { camera, size, invalidate } = useThree();
  const entered = useRef(false);
  useEffect(() => {
    if (camera instanceof OrthographicCamera) {
      camera.zoom = Math.min(size.width / 21.5, size.height / (overhead ? 16 : 13.8));
      camera.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, size, overhead, invalidate]);
  useFrame((state, dt) => {
    const target = overhead ? topCamera : deskCamera;
    if (reducedMotion) camera.position.copy(target);
    else camera.position.lerp(target, 1 - Math.exp(-5 * Math.min(dt, 1 / 30)));
    camera.lookAt(0, 0, .1);
    if (camera.position.distanceTo(target) > .001 || !entered.current) { state.invalidate(); entered.current = true; }
  });
  return null;
}

function Desk() {
  const texture = useMemo(deskTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.12, 0]} receiveShadow>
    <planeGeometry args={[160, 160]} /><meshStandardMaterial map={texture} roughness={.86} />
  </mesh>;
}

function SceneContents(props: TabletopSceneProps) {
  return <>
    <CameraRig overhead={props.overhead} reducedMotion={props.reducedMotion} />
    <ambientLight intensity={1.1} color={DESK_COLORS.ambient} />
    <hemisphereLight args={[DESK_COLORS.sky, DESK_COLORS.ground, 1.5]} />
    <directionalLight position={[-8, 16, -5]} intensity={3.3} color={DESK_COLORS.key} castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-15} shadow-camera-right={15}
      shadow-camera-top={14} shadow-camera-bottom={-14} shadow-normalBias={.035} shadow-bias={-.00015} shadow-radius={4} />
    <directionalLight position={[8, 8, 5]} intensity={.6} color={DESK_COLORS.fill} />
    <Desk />
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
  return <Canvas orthographic shadows={{ type: PCFSoftShadowMap }} frameloop="demand" dpr={[1, 1.75]}
    camera={{ position: [2, 23, 18], zoom: 40, near: .1, far: 200 }}
    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    onCreated={({ gl }) => { gl.setClearColor(DESK_COLORS.desk); }}
    fallback={<button type="button" onClick={props.onUnavailable}>Open the accessible 2D board</button>}>
    <SceneContents {...props} />
  </Canvas>;
}
