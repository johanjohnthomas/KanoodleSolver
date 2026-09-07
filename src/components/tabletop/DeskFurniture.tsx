'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { Group } from 'three';
import { DESK_COLORS } from '@/lib/tabletop';
import { DEDICATION, ROOM_COLORS } from '@/lib/room';
import { deskTexture } from './sceneGeometry';
import { RoomBox } from './RoomBox';

type Props = Readonly<{ open: boolean; reducedMotion: boolean; onToggle: () => void }>;

function noteTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = DESK_COLORS.paper; context.fillRect(0, 0, 1024, 512);
    context.strokeStyle = DESK_COLORS.line; context.lineWidth = 2; context.strokeRect(24, 24, 976, 464);
    context.fillStyle = DESK_COLORS.moss; context.textAlign = 'center'; context.font = 'italic 84px Georgia, serif';
    const [recipient, signature] = DEDICATION.split(' with ');
    context.fillText(recipient, 512, 190); context.fillText(`with ${signature}`, 512, 285);
  }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}

export function DeskFurniture({ open, reducedMotion, onToggle }: Props) {
  const wood = useMemo(deskTexture, []);
  const note = useMemo(noteTexture, []);
  const drawer = useRef<Group>(null);
  const { invalidate } = useThree();
  useEffect(() => () => { wood.dispose(); note.dispose(); }, [wood, note]);
  useEffect(() => invalidate(), [open, reducedMotion, invalidate]);
  useFrame((state, dt) => {
    if (!drawer.current) return;
    const target = open ? 4 : 0;
    drawer.current.position.z = reducedMotion ? target : drawer.current.position.z + (target - drawer.current.position.z) * (1 - Math.exp(-9 * Math.min(dt, 1 / 30)));
    if (Math.abs(drawer.current.position.z - target) > .001) state.invalidate();
  });
  return <group>
    <RoomBox position={[0, -.48, 0]} size={[23.2, .72, 17.6]} color={DESK_COLORS.paper} texture={wood} />
    {[-10.2, 10.2].flatMap(x => [-7, 7].map(z =>
      <RoomBox key={`${x}:${z}`} position={[x, -3.7, z]} size={[.85, 6, .85]} color={ROOM_COLORS.woodEdge} />))}
    {[-10.5, 10.5].map(x => <RoomBox key={x} position={[x, -1.25, 0]} size={[.5, 1.3, 15.3]} color={ROOM_COLORS.woodEdge} />)}
    <RoomBox position={[0, -1.25, -7.8]} size={[21, 1.3, .5]} color={ROOM_COLORS.woodEdge} />
    {[-7.9, 7.9].map(x => <RoomBox key={x} position={[x, -1.25, 8.15]} size={[6.4, 1.3, .5]} color={ROOM_COLORS.woodEdge} />)}
    <RoomBox position={[0, -1.2, 5.9]} size={[9, 1.4, 4.7]} color={DESK_COLORS.socket} />
    <group ref={drawer} name="desk-drawer" userData={{ open }}>
      <RoomBox position={[0, -1.85, 6.1]} size={[8.7, .18, 4.8]} color={ROOM_COLORS.drawerLining} />
      {[-4.3, 4.3].map(x => <RoomBox key={x} position={[x, -1.35, 6.1]} size={[.18, 1.1, 4.8]} color={ROOM_COLORS.woodEdge} />)}
      <RoomBox position={[0, -1.35, 3.8]} size={[8.7, 1.1, .18]} color={ROOM_COLORS.woodEdge} />
      <group onClick={event => { event.stopPropagation(); onToggle(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
        <RoomBox position={[0, -1.2, 8.6]} size={[9.1, 1.55, .3]} color={ROOM_COLORS.woodEdge} texture={wood} />
        <mesh position={[0, -1.15, 8.91]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[.1, .1, 1.6, 20]} /><meshStandardMaterial color={DESK_COLORS.brass} metalness={.65} roughness={.3} />
        </mesh>
        {[-.65, .65].map(x => <mesh key={x} position={[x, -1.15, 8.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[.07, .07, .28, 12]} /><meshStandardMaterial color={DESK_COLORS.brass} metalness={.65} roughness={.3} />
        </mesh>)}
      </group>
      <mesh position={[0, -1.73, 6.25]} rotation={[-Math.PI / 2, 0, -.045]}>
        <planeGeometry args={[7.4, 3.7]} /><meshBasicMaterial map={note} />
      </mesh>
    </group>
  </group>;
}
