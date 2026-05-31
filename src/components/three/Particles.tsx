import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MachineActionType } from './machineTypes';

interface ParticleBurstProps {
  actionId: number;
  type: MachineActionType;
}

const COUNT = 120;

/**
 * A GPU-friendly Points burst. Each new `actionId` re-seeds the velocities and
 * replays the burst from the parcel's centre, green for MATCH, red for NEXT.
 */
export function ParticleBurst({ actionId, type }: ParticleBurstProps) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const velocities = useRef<Float32Array>(new Float32Array(COUNT * 3));
  const life = useRef(0);
  const active = useRef(false);

  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  // Re-seed and fire whenever a new action arrives.
  useEffect(() => {
    if (actionId === 0 || !type) return;
    const origin = type === 'match' ? new THREE.Vector3(0, 0.95, 0.6) : new THREE.Vector3(0, 0.95, 0.6);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;

      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.6 + 0.2,
        (Math.random() - 0.5) * 2,
      ).normalize();
      const speed = 2.5 + Math.random() * 3.5;
      velocities.current[i * 3] = dir.x * speed;
      velocities.current[i * 3 + 1] = dir.y * speed;
      velocities.current[i * 3 + 2] = dir.z * speed;
    }
    geometry.attributes.position.needsUpdate = true;
    life.current = 0;
    active.current = true;
    if (material.current) {
      material.current.color.set(type === 'match' ? '#22C55E' : '#EF4444');
      material.current.opacity = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionId, type]);

  useFrame((_, delta) => {
    if (!active.current || !material.current) return;
    life.current += delta;
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      velocities.current[i * 3 + 1] -= delta * 6.5; // gravity
      pos[i * 3] += velocities.current[i * 3] * delta;
      pos[i * 3 + 1] += velocities.current[i * 3 + 1] * delta;
      pos[i * 3 + 2] += velocities.current[i * 3 + 2] * delta;
    }
    geometry.attributes.position.needsUpdate = true;
    material.current.opacity = Math.max(0, 1 - life.current / 1.1);
    if (life.current > 1.1) {
      active.current = false;
      material.current.opacity = 0;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        ref={material}
        size={0.13}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#22C55E"
        toneMapped={false}
      />
    </points>
  );
}
