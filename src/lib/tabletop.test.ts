import { PIECES } from './pieces';
import { canReturnToDesk, dropOrigin, placementCenter } from './tabletop';

describe('3D board coordinates', () => {
  it('maps the L square to the four upper-left sockets', () => {
    const piece = PIECES.find(p => p.name === 'L');
    expect(piece).toBeDefined();
    if (!piece) return;
    expect(placementCenter(piece, 0, 0, 0, false)).toEqual({ x: -4.5, z: -3 });
    expect(dropOrigin({ piece, rotation: 0, flipped: false, movingName: null }, { x: -4.5, z: -3 })).toEqual({ x: 0, y: 0 });
  });
  it('round-trips every piece orientation through a 3D center and board origin', () => {
    for (const piece of PIECES) for (const flipped of [false, true]) for (const rotation of [-1, 0, 1, 2, 3, 4]) {
      const point = placementCenter(piece, 3, 1, rotation, flipped);
      expect(dropOrigin({ piece, rotation, flipped, movingName: null }, point)).toEqual({ x: 3, y: 1 });
    }
  });
});

describe('tabletop return footprint', () => {
  const held = { piece: PIECES[0], rotation: 0, flipped: false, movingName: 'A' };
  it.each([{ x: -8, z: -2 }, { x: 8, z: -2 }, { x: 0, z: 5 }])('accepts a clear tabletop position %j', point => {
    expect(canReturnToDesk(held, point)).toBe(true);
  });
  it('does not treat an unused piece as a board return', () => {
    expect(canReturnToDesk({ ...held, movingName: null }, { x: -8, z: -2 })).toBe(false);
  });
  it('uses the rotated footprint when checking the desk edge', () => {
    expect(canReturnToDesk(held, { x: 10, z: 0 })).toBe(true);
    expect(canReturnToDesk({ ...held, rotation: 1, flipped: true }, { x: 10, z: 0 })).toBe(false);
  });
});
