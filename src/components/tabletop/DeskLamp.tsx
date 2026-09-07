import { ROOM_DETAILS as details } from '@/lib/room';
import type { RoomAtmosphere } from '@/lib/room';
import { DESK_COLORS } from '@/lib/tabletop';
import { DoubleSide } from 'three';

export function DeskLamp({ atmosphere }: Readonly<{ atmosphere: RoomAtmosphere }>) {
  return <group position={[9, 0, -7]}>
    <mesh position={[0, .12, 0]} castShadow><cylinderGeometry args={[.62, .68, .24, 32]} /><meshStandardMaterial color={DESK_COLORS.moss} roughness={.45} /></mesh>
    <mesh position={[0, 1.65, 0]} castShadow><cylinderGeometry args={[.06, .08, 3, 16]} /><meshStandardMaterial color={DESK_COLORS.brass} metalness={.6} roughness={.3} /></mesh>
    <mesh position={[0, 3.2, 0]} castShadow><cylinderGeometry args={[.5, 1, .85, 32, 1, true]} /><meshStandardMaterial color={DESK_COLORS.moss} roughness={.55} side={DoubleSide} /></mesh>
    <mesh position={[0, 2.82, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[.9, 32]} /><meshBasicMaterial color={atmosphere.lamp ? details.lampShadeLit : details.lampShadeUnlit} /></mesh>
    <pointLight position={[0, 2.65, 0]} intensity={atmosphere.lamp} color={details.lampLight} distance={25} decay={2} />
  </group>;
}
