'use client';

import { ROOM_DETAILS as details } from '@/lib/room';

import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { RoomAtmosphere } from '@/lib/room';
import { RoomBox } from './RoomBox';

function skyTexture(atmosphere: RoomAtmosphere) {
  const canvas = document.createElement('canvas'); canvas.width = 16; canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, atmosphere.skyTop); gradient.addColorStop(1, atmosphere.skyBottom);
    context.fillStyle = gradient; context.fillRect(0, 0, 16, 512);
  }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}

function Tree({ x, z, atmosphere, scale = 1 }: Readonly<{ x: number; z: number; atmosphere: RoomAtmosphere; scale?: number }>) {
  return <group position={[x, .8, z]} scale={scale}>
    <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[.1, .18, 3, 12]} /><meshStandardMaterial color={details.bark} roughness={1} /></mesh>
    {[[0, 3.8, 0], [-.8, 3.2, .2], [.8, 3.4, -.1], [.1, 4.8, 0]].map(([cx, cy, cz], index) =>
      <mesh key={index} position={[cx, cy, cz]} scale={[1.2, 1.35, .85]}>
        <sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color={atmosphere.leaves} roughness={1} />
      </mesh>)}
  </group>;
}

function Cottage({ x, atmosphere }: Readonly<{ x: number; atmosphere: RoomAtmosphere }>) {
  return <group position={[x, .85, -24]}>
    <RoomBox position={[0, 1.25, 0]} size={[3.6, 2.5, 2.8]} color={atmosphere.house} />
    <mesh position={[0, 3, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, .6, .8]}>
      <coneGeometry args={[2.8, 2, 4]} /><meshStandardMaterial color={atmosphere.roof} roughness={.9} />
    </mesh>
    <RoomBox position={[.8, 3.3, -.3]} size={[.4, 1.4, .45]} color={atmosphere.roof} />
    {[-.95, .95].map(wx => <mesh key={wx} position={[wx, 1.5, 1.41]}>
      <planeGeometry args={[.65, .85]} /><meshStandardMaterial color={atmosphere.window}
        emissive={atmosphere.window} emissiveIntensity={atmosphere.night ? .8 : .08} />
    </mesh>)}
    <RoomBox position={[0, .75, 1.42]} size={[.65, 1.5, .06]} color={atmosphere.roof} />
  </group>;
}

export function OutdoorScene({ atmosphere }: Readonly<{ atmosphere: RoomAtmosphere }>) {
  const sky = useMemo(() => skyTexture(atmosphere), [atmosphere]);
  useEffect(() => () => sky.dispose(), [sky]);
  return <group>
    <mesh position={[-4, 6, -38]}><planeGeometry args={[80, 36]} /><meshBasicMaterial map={sky} /></mesh>
    <mesh position={[4, 8, -32]}><sphereGeometry args={[.8, 32, 20]} /><meshBasicMaterial color={atmosphere.night ? details.moon : details.sun} /></mesh>
    {atmosphere.night && Array.from({ length: 24 }, (_, i) => <mesh key={i} position={[-22 + (i * 7.31) % 43, 7 + (i * 1.73) % 9, -33]}>
      <sphereGeometry args={[i % 3 === 0 ? .065 : .04, 8, 6]} /><meshBasicMaterial color={details.stars} />
    </mesh>)}
    {[-19, -2, 17].map((x, i) => <mesh key={x} position={[x, -1.8, -32 - i]} scale={[14, 6 - i, 7]}>
      <sphereGeometry args={[1, 40, 20]} /><meshBasicMaterial color={atmosphere.hills} />
    </mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .7, -26]}>
      <planeGeometry args={[70, 28]} /><meshStandardMaterial color={atmosphere.meadow} roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .93, -15.5]}>
      <planeGeometry args={[60, 2.8]} /><meshStandardMaterial color={atmosphere.road} roughness={1} />
    </mesh>
    {Array.from({ length: 16 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-24 + i * 3, .945, -15.5]}>
      <planeGeometry args={[1.3, .055]} /><meshBasicMaterial color={atmosphere.house} />
    </mesh>)}
    <Cottage x={-11} atmosphere={atmosphere} /><Cottage x={6} atmosphere={atmosphere} />
    <Tree x={-17} z={-20} atmosphere={atmosphere} scale={1.1} />
    <Tree x={-4} z={-22} atmosphere={atmosphere} scale={.8} />
    <Tree x={12} z={-20} atmosphere={atmosphere} />
    {Array.from({ length: 15 }, (_, i) => <RoomBox key={i} position={[-21 + i * 3, 1.5, -18]} size={[.09, 1.3, .12]} color={atmosphere.house} />)}
    <RoomBox position={[0, 1.5, -18]} size={[44, .09, .1]} color={atmosphere.house} />
    <RoomBox position={[0, 1.9, -18]} size={[44, .09, .1]} color={atmosphere.house} />
    {!atmosphere.night && [-14, 0, 14].map((x, index) => <group key={x} position={[x, 6.8 + index * .3, -28]}>
      {[-1, 0, 1].map((offset, i) => <mesh key={offset} position={[offset, i === 1 ? .25 : 0, 0]} scale={[1.3, .5, .4]}>
        <sphereGeometry args={[1, 24, 16]} /><meshBasicMaterial color={atmosphere.cloud} />
      </mesh>)}
    </group>)}
  </group>;
}
