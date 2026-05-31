import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ConveyorBelt } from './ConveyorBelt';
import { Structure } from './Structure';
import { NeonLights } from './NeonLights';

/** A floating, slowly auto-rotating parcel for the landing hero. */
function HeroParcel() {
  const tape = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (tape.current) {
      tape.current.emissiveIntensity =
        0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
      <group position={[0, 1.0, 0]}>
        <RoundedBox args={[1.7, 1.5, 1.6]} radius={0.12} smoothness={4} castShadow>
          <meshStandardMaterial color="#C19A6B" roughness={0.85} />
        </RoundedBox>
        <mesh>
          <boxGeometry args={[1.74, 0.34, 1.64]} />
          <meshStandardMaterial
            ref={tape}
            color="#FACC15"
            emissive="#FACC15"
            emissiveIntensity={0.3}
            roughness={0.35}
          />
        </mesh>
      </group>
    </Float>
  );
}

function HeroRig() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.5;
    }
  });
  return (
    <group ref={group}>
      <Structure />
      <ConveyorBelt />
      <NeonLights />
      <HeroParcel />
    </group>
  );
}

/** Lightweight, non-interactive 3D preview used on the home page. */
export function HeroMachine() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [7, 4, 9], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#cfd6e4', '#1a1f2b', 0.7]} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} castShadow />
      <directionalLight position={[-6, 4, -4]} intensity={0.6} color="#FACC15" />
      <pointLight position={[0, 5, 5]} intensity={0.6} color="#ffffff" />
      <Suspense fallback={null}>
        <HeroRig />
        <ContactShadows position={[0, -2.22, 0]} opacity={0.4} scale={16} blur={2.4} far={6} />
      </Suspense>
    </Canvas>
  );
}
