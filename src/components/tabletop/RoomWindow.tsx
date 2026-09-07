import { ROOM_COLORS as colors } from '@/lib/room';
import { RoomBox } from './RoomBox';

export function RoomWindow() {
  return <group>
    <RoomBox position={[-33, 2, -10]} size={[44, 28, .5]} color={colors.plaster} />
    <RoomBox position={[29, 2, -10]} size={[52, 28, .5]} color={colors.plaster} />
    <RoomBox position={[-4, -4.8, -10]} size={[14, 10.6, .5]} color={colors.plaster} />
    <RoomBox position={[-4, 16, -10]} size={[14, 14, .5]} color={colors.plaster} />
    <mesh position={[-4, 4.6, -16]}>
      <planeGeometry args={[28, 22]} />
      <meshBasicMaterial color={colors.sky} />
    </mesh>
    {[-10, -2, 7].map((x, i) => <mesh key={x} position={[x, -.8 - i * .3, -14]} scale={[9, 2.4, 1]}>
      <sphereGeometry args={[1, 32, 16]} /><meshBasicMaterial color={colors.distantHill} />
    </mesh>)}
    {[-9, 3].map(x => <mesh key={x} position={[x, -2, -12.7]} scale={[8, 3.3, 1]}>
      <sphereGeometry args={[1, 32, 16]} /><meshBasicMaterial color={colors.nearHill} />
    </mesh>)}
    {[-9, -6, 1].map((x, i) => <group key={x} position={[x, -.5, -12]}>
      <RoomBox position={[0, .8, 0]} size={[.12, 2.2, .12]} color={colors.leaves} />
      <mesh position={[0, 2 + i * .2, 0]} scale={[.8, 1.25, .5]}>
        <sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color={colors.leaves} roughness={1} />
      </mesh>
    </group>)}
    {[[-7, 3.9], [0, 4.4]].map(([x, y]) => <group key={x} position={[x, y, -14.5]}>
      {[-.7, 0, .7].map((offset, i) => <mesh key={offset} position={[offset, i === 1 ? .2 : 0, 0]} scale={[1, .38, .3]}>
        <sphereGeometry args={[.9, 20, 12]} /><meshBasicMaterial color={colors.cloud} />
      </mesh>)}
    </group>)}
    {[-11, 3].map(x => <RoomBox key={x} position={[x, 4.75, -9.6]} size={[.4, 8.9, .6]} color={colors.trim} />)}
    {[.5, 9].map(y => <RoomBox key={y} position={[-4, y, -9.6]} size={[14.4, .4, .6]} color={colors.trim} />)}
    <RoomBox position={[-4, 4.75, -9.5]} size={[.2, 8.5, .35]} color={colors.trim} />
    <RoomBox position={[-4, 4.65, -9.45]} size={[14, .18, .35]} color={colors.trim} />
    <RoomBox position={[-4, .35, -9.15]} size={[15, .25, 1.5]} color={colors.trim} />
    <mesh position={[-4, 4.75, -9.7]}>
      <planeGeometry args={[13.6, 8.1]} />
      <meshStandardMaterial color={colors.sky} transparent opacity={.06} roughness={.1} depthWrite={false} />
    </mesh>
  </group>;
}
