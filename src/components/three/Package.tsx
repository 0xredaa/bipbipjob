import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { JobOffer } from '@/types';
import { usePackageLabelTexture } from './usePackageTexture';
import type { MachinePhase } from './machineTypes';

interface PackageProps {
  offer: JobOffer | null;
  phase: MachinePhase;
  /** Called once when an exit animation (match/skip) finishes. */
  onExitComplete: () => void;
  /** Called when the user clicks the parcel (open the offer detail card). */
  onSelect?: () => void;
}

const CENTER = new THREE.Vector3(0, 0.95, 0);
const SPAWN_X = 6.2; // off to the right
const MATCH_X = -7; // slides off to the left
const SKIP_X = 6.5; // slides right then falls

export function Package({ offer, phase, onExitComplete, onSelect }: PackageProps) {
  const group = useRef<THREE.Group>(null);
  const tape = useRef<THREE.Mesh>(null);
  const exitFired = useRef(false);
  const labelTexture = usePackageLabelTexture(offer);

  // Reset position whenever a fresh offer starts its "incoming" slide.
  const prevPhase = useRef<MachinePhase>('incoming');
  if (phase === 'incoming' && prevPhase.current !== 'incoming') {
    if (group.current) {
      group.current.position.set(SPAWN_X, CENTER.y, 0);
      group.current.rotation.set(0, 0, 0);
    }
    exitFired.current = false;
  }
  prevPhase.current = phase;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.0001, delta); // frame-rate independent lerp factor

    if (phase === 'incoming') {
      g.position.x = THREE.MathUtils.lerp(g.position.x, CENTER.x, k * 0.9);
      g.position.y = CENTER.y + Math.sin(t * 2) * 0.015;
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, k);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, 0, k * 0.6);
    } else if (phase === 'idle') {
      // Gentle hover + slow turn so the label catches the light.
      g.position.x = THREE.MathUtils.lerp(g.position.x, CENTER.x, k * 0.8);
      g.position.y = CENTER.y + Math.sin(t * 1.6) * 0.04;
      g.rotation.y = Math.sin(t * 0.5) * 0.12;
    } else if (phase === 'matching') {
      g.position.x = THREE.MathUtils.lerp(g.position.x, MATCH_X, k * 0.85);
      g.position.y = THREE.MathUtils.lerp(g.position.y, CENTER.y + 1.4, k * 0.4);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0.4, k * 0.5);
      if (g.position.x < MATCH_X + 0.6 && !exitFired.current) {
        exitFired.current = true;
        onExitComplete();
      }
    } else if (phase === 'skipping') {
      g.position.x = THREE.MathUtils.lerp(g.position.x, SKIP_X, k * 0.7);
      g.position.y -= delta * (4 + Math.max(0, g.position.x)); // fall faster as it moves out
      g.rotation.z -= delta * 3.2;
      if (g.position.y < -4 && !exitFired.current) {
        exitFired.current = true;
        onExitComplete();
      }
    }

    if (tape.current) {
      const mat = tape.current.material as THREE.MeshStandardMaterial;
      const targetEmissive = phase === 'matching' ? 1.4 : 0.15;
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        targetEmissive,
        k * 0.4,
      );
    }
  });

  return (
    <group
      ref={group}
      position={[SPAWN_X, CENTER.y, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (phase === 'idle' || phase === 'incoming') onSelect?.();
      }}
      onPointerOver={() => {
        if (onSelect) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Cardboard body */}
      <RoundedBox args={[1.7, 1.5, 1.6]} radius={0.12} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#C19A6B" roughness={0.85} metalness={0.05} />
      </RoundedBox>

      {/* Front shipping label */}
      <mesh position={[0, 0, 0.81]}>
        <planeGeometry args={[1.55, 1.4]} />
        <meshStandardMaterial map={labelTexture} roughness={0.6} />
      </mesh>

      {/* Yellow tape — horizontal band wrapping around the box (relief) */}
      <mesh ref={tape} position={[0, 0, 0]}>
        <boxGeometry args={[1.74, 0.34, 1.64]} />
        <meshStandardMaterial
          color="#FACC15"
          emissive="#FACC15"
          emissiveIntensity={0.15}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* Vertical tape strip on top going front-to-back */}
      <mesh position={[0, 0.76, 0]}>
        <boxGeometry args={[0.34, 0.02, 1.66]} />
        <meshStandardMaterial color="#EAB308" roughness={0.4} />
      </mesh>
    </group>
  );
}
