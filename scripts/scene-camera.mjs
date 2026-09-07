import { PerspectiveCamera, Vector3 } from 'three';

export function sceneCamera(bounds, overhead = false) {
  const camera = new PerspectiveCamera(50, bounds.width / bounds.height, .1, 200);
  const position = overhead ? new Vector3(0, 32, .01) : new Vector3(0, 8.5, 24);
  const target = overhead ? new Vector3(0, 0, .1) : new Vector3(0, -.5, -1.5);
  const halfHeight = Math.max((overhead ? 16 : 28) / 2, (overhead ? 21.5 : 28) / (2 * camera.aspect));
  camera.fov = 2 * Math.atan(halfHeight / position.distanceTo(target)) * 180 / Math.PI;
  camera.position.copy(position); camera.lookAt(target);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  return camera;
}
