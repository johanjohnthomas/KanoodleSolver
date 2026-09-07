'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { BirdFlock, PassingCar, PassingPlane } from './OutdoorActors';
import { useOutdoorPass } from '@/hooks/useOutdoorPass';

export function OutdoorActivity({ enabled }: Readonly<{ enabled: boolean }>) {
  const { gl, invalidate } = useThree();
  const [visible, setVisible] = useState(false);
  const pass = useOutdoorPass(enabled && visible);
  const actor = useRef<Group>(null);
  useEffect(() => {
    let inView = false;
    const update = () => setVisible(inView && document.visibilityState === 'visible');
    const observer = new IntersectionObserver(entries => { inView = entries[0]?.isIntersecting ?? false; update(); }, { threshold: .1 });
    observer.observe(gl.domElement); document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [gl]);
  useEffect(() => invalidate(), [pass, invalidate]);
  useFrame(state => {
    if (!pass || !actor.current || !enabled || !visible) return;
    const progress = Math.min(1, (performance.now() - pass.startedAt) / (pass.duration * 1000));
    actor.current.position.set((-24 + progress * 48) * pass.direction, pass.y, pass.z);
    state.invalidate();
  });
  if (!pass || !enabled || !visible) return null;
  const body = (() => {
    switch (pass.kind) {
      case 'birds': return <BirdFlock />;
      case 'plane': return <PassingPlane />;
      case 'car': return <PassingCar />;
      default: { const unreachable: never = pass; return unreachable; }
    }
  })();
  return <group ref={actor} scale={[pass.direction, 1, 1]} position={[-24 * pass.direction, pass.y, pass.z]}>{body}</group>;
}
