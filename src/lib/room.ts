import type { CSSProperties } from 'react';

export const DEDICATION = 'Made for Rach with love <3';
export const ROOM_COLORS = {
  plaster: '#e8dfcf', floor: '#c6b69d', trim: '#faf3e5', sky: '#b6d9df',
  distantHill: '#a6bfa5', nearHill: '#708e6d', leaves: '#526e4f',
  woodEdge: '#bb9163', drawerLining: '#68715c', cloud: '#fff8e8',
} as const;

export const ROOM_DETAILS = {
  bark: '#71604c', sun: '#ffe9b8', moon: '#fff5d6', stars: '#e5edf2', bird: '#344753',
  planeBody: '#e9e5da', planeWing: '#dfddd7', planeTail: '#b46d52', navigationLight: '#df6d54',
  carBody: '#bb6b4a', carWindow: '#879fa5', tire: '#29302e', headlight: '#fff0c4',
  lampShadeLit: '#ffdc9e', lampShadeUnlit: '#e5d8b9', lampLight: '#ffd29b',
} as const;
export const ROOM_THEME: CSSProperties & Readonly<Record<`--room-${string}`, string>> = {
  '--room-night-background': '#273347', '--room-night-text': '#f1eadb',
  '--room-night-accent': '#b4cfac', '--room-night-muted': '#d6dfdb', '--room-sunset-background': '#e9d3b9',
};

export type TimeOfDay = 'day' | 'sunset' | 'night';
export const parseTimeOfDay = (value: string | null): TimeOfDay =>
  value === 'sunset' || value === 'night' ? value : 'day';

export const ROOM_ATMOSPHERES = {
  day: { skyTop: '#8bc3df', skyBottom: '#edf0d7', hills: '#8ba886', meadow: '#6f936e', leaves: '#456f4c',
    cloud: '#fff9eb', road: '#a49f8f', house: '#eee1c9', roof: '#a87257', window: '#94b3bc',
    ambient: '#fff2dd', ambientPower: .85, skyLight: '#d9eafa', groundLight: '#a48b65', hemispherePower: 1.2,
    key: '#fff2d5', keyPower: 2.8, fill: '#ffffff', fillPower: .55, lamp: 0, night: false },
  sunset: { skyTop: '#bd96b1', skyBottom: '#f6c891', hills: '#a18c85', meadow: '#8b8e67', leaves: '#5e6d49',
    cloud: '#ffe0bc', road: '#988c7f', house: '#ebcdaf', roof: '#95634f', window: '#ffcd89',
    ambient: '#f2c1a0', ambientPower: .6, skyLight: '#dab8cd', groundLight: '#85634d', hemispherePower: .8,
    key: '#ffc482', keyPower: 2.4, fill: '#d4bfd8', fillPower: .35, lamp: 16, night: false },
  night: { skyTop: '#101d35', skyBottom: '#344766', hills: '#334b5a', meadow: '#304b46', leaves: '#253d36',
    cloud: '#586b87', road: '#555a65', house: '#8f918b', roof: '#575c65', window: '#ffd390',
    ambient: '#9eacc7', ambientPower: .5, skyLight: '#718dae', groundLight: '#655442', hemispherePower: .65,
    key: '#ffd6a2', keyPower: 1.7, fill: '#93b5df', fillPower: .65, lamp: 38, night: true },
} as const;
export type RoomAtmosphere = (typeof ROOM_ATMOSPHERES)[TimeOfDay];

export const SEATED_VIEW = { position: [0, 8.5, 24], target: [0, -.5, -1.5], width: 28, height: 28 } as const;
export const OVERHEAD_VIEW = { position: [0, 32, 4], target: [0, 0, 0], width: 21.5, height: 16 } as const;
