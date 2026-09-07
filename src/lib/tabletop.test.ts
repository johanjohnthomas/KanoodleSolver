import { PIECES } from './pieces';
import { dropOrigin, placementCenter } from './tabletop';

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
