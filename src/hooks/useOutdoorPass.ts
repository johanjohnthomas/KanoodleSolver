'use client';

import { useEffect, useState } from 'react';

const passes = [
  { kind: 'birds', duration: 10, gap: 15, y: 6.4, z: -21, direction: 1 },
  { kind: 'plane', duration: 11, gap: 18, y: 8.1, z: -25, direction: -1 },
  { kind: 'car', duration: 9, gap: 24, y: .95, z: -15.5, direction: 1 },
] as const;
type OutdoorPass = (typeof passes)[number] & Readonly<{ startedAt: number }>;

export function useOutdoorPass(running: boolean) {
  const [pass, setPass] = useState<OutdoorPass | null>(null);
  useEffect(() => {
    setPass(null);
    if (!running) return;
    let index = 0; let timer: ReturnType<typeof setTimeout>;
    const begin = () => {
      const next = passes[index % passes.length]; setPass({ ...next, startedAt: performance.now() });
      timer = setTimeout(() => { setPass(null); index++; timer = setTimeout(begin, next.gap * 1000); }, next.duration * 1000);
    };
    timer = setTimeout(begin, 6000);
    return () => clearTimeout(timer);
  }, [running]);
  return running ? pass : null;
}
