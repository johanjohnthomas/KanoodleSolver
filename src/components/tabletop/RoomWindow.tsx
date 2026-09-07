import { ROOM_COLORS as colors } from '@/lib/room';
import type { RoomAtmosphere } from '@/lib/room';
import { RoomBox } from './RoomBox';
import { OutdoorScene } from './OutdoorScene';
import { OutdoorActivity } from './OutdoorActivity';

export function RoomWindow({ atmosphere, activity, reducedMotion }: Readonly<{ atmosphere: RoomAtmosphere; activity: boolean; reducedMotion: boolean }>) {
  return <group>
    <RoomBox position={[-33, 10, -10]} size={[44, 60, .5]} color={colors.plaster} />
    <RoomBox position={[29, 10, -10]} size={[52, 60, .5]} color={colors.plaster} />
    <RoomBox position={[-4, -4.8, -10]} size={[14, 10.6, .5]} color={colors.plaster} />
    <RoomBox position={[-4, 24.5, -10]} size={[14, 31, .5]} color={colors.plaster} />
    <OutdoorScene atmosphere={atmosphere} />
    <OutdoorActivity enabled={activity && !reducedMotion} />
    {[-11, 3].map(x => <RoomBox key={x} position={[x, 4.75, -9.6]} size={[.4, 8.9, .6]} color={colors.trim} />)}
    {[.5, 9].map(y => <RoomBox key={y} position={[-4, y, -9.6]} size={[14.4, .4, .6]} color={colors.trim} />)}
    <RoomBox position={[-4, 4.75, -9.5]} size={[.2, 8.5, .35]} color={colors.trim} />
    <RoomBox position={[-4, 4.65, -9.45]} size={[14, .18, .35]} color={colors.trim} />
    <RoomBox position={[-4, .35, -9.15]} size={[15, .25, 1.5]} color={colors.trim} />
    <mesh position={[-4, 4.75, -9.7]}>
      <planeGeometry args={[13.6, 8.1]} />
      <meshStandardMaterial color={atmosphere.skyBottom} transparent opacity={.04} roughness={.1} depthWrite={false} />
    </mesh>
  </group>;
}
