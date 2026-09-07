'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3, MathUtils } from 'three';
import { SEATED_VIEW, OVERHEAD_VIEW } from '@/lib/room';

const seatedPosition = new Vector3(...SEATED_VIEW.position);
const seatedTarget = new Vector3(...SEATED_VIEW.target);
const topPosition = new Vector3(...OVERHEAD_VIEW.position);
const topTarget = new Vector3(...OVERHEAD_VIEW.target);

export function SceneCamera({ overhead, reducedMotion }: Readonly<{ overhead: boolean; reducedMotion: boolean }>) {
  const { camera, size, invalidate } = useThree();
  const look = useRef(seatedTarget.clone());
  const fieldOfView = useRef(50);
  const initialized = useRef(false);
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const view = overhead ? OVERHEAD_VIEW : SEATED_VIEW;
    const distance = overhead ? topPosition.distanceTo(topTarget) : seatedPosition.distanceTo(seatedTarget);
    camera.aspect = size.width / size.height;
    fieldOfView.current = MathUtils.radToDeg(2 * Math.atan(Math.max(view.height / 2, view.width / (2 * camera.aspect)) / distance));
    if (!initialized.current) { camera.fov = fieldOfView.current; initialized.current = true; }
    camera.updateProjectionMatrix(); invalidate();
  }, [camera, size, overhead, invalidate]);
  useFrame((state, dt) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const position = overhead ? topPosition : seatedPosition;
    const target = overhead ? topTarget : seatedTarget;
    const blend = reducedMotion ? 1 : 1 - Math.exp(-8 * Math.min(dt, 1 / 30));
    camera.position.lerp(position, blend); look.current.lerp(target, blend);
    camera.fov += (fieldOfView.current - camera.fov) * blend;
    camera.lookAt(look.current); camera.updateProjectionMatrix();
    if (camera.position.distanceTo(position) > .001 || look.current.distanceTo(target) > .001 || Math.abs(camera.fov - fieldOfView.current) > .001) state.invalidate();
  });
  return null;
}
