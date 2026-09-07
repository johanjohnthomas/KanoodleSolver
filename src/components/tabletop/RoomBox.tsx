import type { Texture } from 'three';

type Props = Readonly<{
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  color: string;
  texture?: Texture;
}>;

export function RoomBox({ position, size, color, texture }: Props) {
  return <mesh position={[...position]} castShadow receiveShadow>
    <boxGeometry args={[...size]} />
    <meshStandardMaterial color={color} map={texture} roughness={.78} />
  </mesh>;
}
