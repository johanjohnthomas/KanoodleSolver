import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { OVERHEAD_VIEW, SEATED_VIEW } from './room';

type CameraView = Readonly<{
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  width: number;
  height: number;
}>;

const frameCamera = (camera: PerspectiveCamera, position: Vector3, target: Vector3): void => {
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateMatrixWorld();
};

const expectPlayerOrientation = (camera: PerspectiveCamera): void => {
  const center = new Vector3(0, 0, 0).project(camera);
  const worldRight = new Vector3(1, 0, 0).project(camera);
  const farRow = new Vector3(0, 0, -1).project(camera);
  const nearRow = new Vector3(0, 0, 1).project(camera);
  expect(worldRight.x).toBeGreaterThan(center.x);
  expect(farRow.y).toBeGreaterThan(nearRow.y);
};

const fittedCamera = (view: CameraView, width: number, height: number): PerspectiveCamera => {
  const camera = new PerspectiveCamera(50, width / height, .1, 200);
  const position = new Vector3(...view.position);
  const target = new Vector3(...view.target);
  const halfHeight = Math.max(view.height / 2, view.width / (2 * camera.aspect));
  camera.fov = MathUtils.radToDeg(2 * Math.atan(halfHeight / position.distanceTo(target)));
  camera.updateProjectionMatrix();
  frameCamera(camera, position, target);
  return camera;
};

describe('room camera views', () => {
  it.each([
    ['seated to overhead', SEATED_VIEW, OVERHEAD_VIEW],
    ['overhead to seated', OVERHEAD_VIEW, SEATED_VIEW],
  ] as const)('keeps the player orientation through every frame of %s', (_name, from, to) => {
    const camera = fittedCamera(from, 1280, 720);
    const position = new Vector3(...from.position);
    const target = new Vector3(...from.target);
    const destination = new Vector3(...to.position);
    const destinationTarget = new Vector3(...to.target);
    const blend = 1 - Math.exp(-8 / 60);

    expect(position.z).toBeGreaterThan(target.z);
    frameCamera(camera, position, target);
    expectPlayerOrientation(camera);
    for (let frame = 0; frame < 180; frame += 1) {
      position.lerp(destination, blend);
      target.lerp(destinationTarget, blend);
      expect(position.z).toBeGreaterThan(target.z);
      frameCamera(camera, position, target);
      expectPlayerOrientation(camera);
    }
  });

  it.each([[1280, 720], [390, 620]] as const)('fits the complete case at %i × %i', (width, height) => {
    const camera = fittedCamera(OVERHEAD_VIEW, width, height);
    for (const x of [-6.1, 6.1]) {
      for (const z of [-4.7, 1.7]) {
        const point = new Vector3(x, 0, z).project(camera);
        expect(Math.abs(point.x)).toBeLessThan(1);
        expect(Math.abs(point.y)).toBeLessThan(1);
      }
    }
  });

  it('uses the exact overhead endpoint when motion is reduced', () => {
    const camera = fittedCamera(SEATED_VIEW, 1280, 720);
    const position = new Vector3(...SEATED_VIEW.position).lerp(new Vector3(...OVERHEAD_VIEW.position), 1);
    const target = new Vector3(...SEATED_VIEW.target).lerp(new Vector3(...OVERHEAD_VIEW.target), 1);
    frameCamera(camera, position, target);

    position.toArray().forEach((value, index) => expect(value).toBeCloseTo(OVERHEAD_VIEW.position[index], 12));
    target.toArray().forEach((value, index) => expect(value).toBeCloseTo(OVERHEAD_VIEW.target[index], 12));
    expectPlayerOrientation(camera);
  });
});
