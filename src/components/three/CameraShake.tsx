import { useEffect, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MachineActionType } from './machineTypes';

interface ShakeGroupProps {
  actionId: number;
  type: MachineActionType;
  children: ReactNode;
}

/**
 * Wraps the machine content and gives it a brief shake when an action lands —
 * a strong "validation" punch on MATCH, a drier nudge on NEXT. Shaking the
 * content group (rather than the camera) avoids fighting OrbitControls.
 */
export function ShakeGroup({ actionId, type, children }: ShakeGroupProps) {
  const group = useRef<THREE.Group>(null);
  const trauma = useRef(0);

  useEffect(() => {
    if (actionId === 0 || !type) return;
    trauma.current = type === 'match' ? 1 : 0.4;
  }, [actionId, type]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (trauma.current <= 0.001) {
      g.position.set(0, 0, 0);
      g.rotation.z = 0;
      return;
    }
    const t = trauma.current;
    const amt = t * t * 0.12;
    const time = state.clock.elapsedTime * 38;
    g.position.x = Math.sin(time * 1.1) * amt;
    g.position.y = Math.cos(time * 1.7) * amt;
    g.rotation.z = Math.sin(time * 0.9) * amt * 0.12;
    trauma.current = Math.max(0, trauma.current - delta * 2.2);
  });

  return <group ref={group}>{children}</group>;
}
