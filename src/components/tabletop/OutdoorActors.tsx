'use client';

import { ROOM_DETAILS as details } from '@/lib/room';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

function Bird({ offset }: Readonly<{ offset: number }>) {
  const left = useRef<Group>(null); const right = useRef<Group>(null);
  useFrame(() => {
    const flap = Math.sin(performance.now() * .009 + offset) * .6;
    if (left.current && right.current) { left.current.rotation.x = flap; right.current.rotation.x = -flap; }
  });
  return <group position={[offset * .9, Math.abs(offset) * .3, offset * .25]}>
    <mesh scale={[1.6, .6, .8]}><sphereGeometry args={[.1, 12, 8]} /><meshBasicMaterial color={details.bird} /></mesh>
    <group ref={left}><mesh position={[0, 0, -.22]} rotation={[.1, -.25, 0]}><boxGeometry args={[.16, .035, .45]} /><meshBasicMaterial color={details.bird} /></mesh></group>
    <group ref={right}><mesh position={[0, 0, .22]} rotation={[-.1, .25, 0]}><boxGeometry args={[.16, .035, .45]} /><meshBasicMaterial color={details.bird} /></mesh></group>
  </group>;
}

export function BirdFlock() { return <group><Bird offset={-1} /><Bird offset={0} /><Bird offset={1} /></group>; }

export function PassingPlane() {
  return <group scale={1.4}>
    <mesh scale={[1.2, .1, .12]}><sphereGeometry args={[.65, 24, 12]} /><meshStandardMaterial color={details.planeBody} roughness={.5} /></mesh>
    <mesh position={[-.1, 0, 0]} rotation={[0, -.15, 0]}><boxGeometry args={[.35, .045, 1.7]} /><meshStandardMaterial color={details.planeWing} /></mesh>
    <mesh position={[-.58, .13, 0]}><boxGeometry args={[.25, .3, .05]} /><meshStandardMaterial color={details.planeTail} /></mesh>
    <mesh position={[-.6, .04, 0]}><boxGeometry args={[.25, .035, .6]} /><meshStandardMaterial color={details.planeWing} /></mesh>
    <mesh position={[-.1, 0, .86]}><sphereGeometry args={[.04, 8, 6]} /><meshBasicMaterial color={details.navigationLight} /></mesh>
  </group>;
}

export function PassingCar() {
  return <group>
    <mesh position={[0, .38, 0]}><boxGeometry args={[1.6, .4, .72]} /><meshStandardMaterial color={details.carBody} roughness={.4} /></mesh>
    <mesh position={[-.15, .7, 0]}><boxGeometry args={[.85, .35, .65]} /><meshStandardMaterial color={details.carWindow} roughness={.2} /></mesh>
    <mesh position={[-.15, .9, 0]}><boxGeometry args={[.9, .07, .72]} /><meshStandardMaterial color={details.carBody} /></mesh>
    {[-.5, .5].flatMap(x => [-.37, .37].map(z => <mesh key={`${x}:${z}`} position={[x, .22, z]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[.22, .22, .12, 16]} /><meshStandardMaterial color={details.tire} />
    </mesh>))}
    {[-.23, .23].map(z => <mesh key={z} position={[.81, .4, z]}><boxGeometry args={[.025, .13, .16]} /><meshBasicMaterial color={details.headlight} /></mesh>)}
  </group>;
}
