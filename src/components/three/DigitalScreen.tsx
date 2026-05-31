import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { JobOffer } from '@/types';

interface DigitalScreenProps {
  offer: JobOffer | null;
  remaining: number;
  total: number;
}

/**
 * The gantry-mounted digital display: a dark panel with glowing amber text
 * showing the live credit counter and the current offer title.
 */
export function DigitalScreen({ offer, remaining, total }: DigitalScreenProps) {
  const glow = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (glow.current) {
      // Slow scanline-style flicker on the bezel glow.
      glow.current.emissiveIntensity =
        0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.12;
    }
  });

  return (
    <group position={[0, 3.0, -1.05]}>
      {/* Bezel */}
      <mesh castShadow>
        <boxGeometry args={[4.6, 1.5, 0.18]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Glowing inner frame */}
      <mesh position={[0, 0, 0.095]}>
        <boxGeometry args={[4.3, 1.25, 0.04]} />
        <meshStandardMaterial
          ref={glow}
          color="#0b0f17"
          emissive="#FACC15"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[4.18, 1.13]} />
        <meshBasicMaterial color="#05070c" />
      </mesh>

      {/* CREDITS label */}
      <Text
        position={[-1.95, 0.36, 0.14]}
        anchorX="left"
        fontSize={0.18}
        color="#9CA3AF"
        letterSpacing={0.18}
      >
        CRÉDITS RESTANTS
      </Text>

      {/* Counter */}
      <Text
        position={[-1.95, -0.04, 0.14]}
        anchorX="left"
        fontSize={0.5}
        color="#FACC15"
        fontWeight={700}
      >
        {`${remaining}/${total}`}
      </Text>

      {/* Divider */}
      <mesh position={[0.05, 0, 0.13]}>
        <boxGeometry args={[0.012, 0.95, 0.01]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>

      {/* OFFRE label */}
      <Text
        position={[0.35, 0.36, 0.14]}
        anchorX="left"
        fontSize={0.16}
        color="#9CA3AF"
        letterSpacing={0.12}
      >
        OFFRE EN COURS
      </Text>
      <Text
        position={[0.35, 0.0, 0.14]}
        anchorX="left"
        maxWidth={1.85}
        fontSize={0.2}
        color="#E5E7EB"
        lineHeight={1.1}
      >
        {offer?.title ?? '—'}
      </Text>
      <Text
        position={[0.35, -0.4, 0.14]}
        anchorX="left"
        maxWidth={1.85}
        fontSize={0.15}
        color="#22C55E"
      >
        {offer ? `${offer.company} · ${offer.location}` : ''}
      </Text>
    </group>
  );
}
