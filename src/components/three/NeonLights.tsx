import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** A single softly-pulsing neon tube. */
function NeonTube({
  position,
  rotation,
  length,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  length: number;
}) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const seed = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 1.6 + seed.current) * 0.3;
    if (mat.current) mat.current.emissiveIntensity = 1.2 * pulse;
    if (light.current) light.current.intensity = 1.6 * pulse;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, length, 12]} />
        <meshStandardMaterial
          ref={mat}
          color="#FACC15"
          emissive="#FACC15"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={light}
        color="#FACC15"
        intensity={1.6}
        distance={7}
        decay={2}
      />
    </group>
  );
}

/** The set of neon tubes framing the machine. */
export function NeonLights() {
  return (
    <group>
      {/* Horizontal bar under the gantry beam */}
      <NeonTube position={[0, 3.7, -1.05]} rotation={[0, 0, Math.PI / 2]} length={6.4} />
      {/* Vertical tubes on the uprights */}
      <NeonTube position={[-3.55, 2.0, -1.05]} length={3.4} />
      <NeonTube position={[3.55, 2.0, -1.05]} length={3.4} />
      {/* Low accent tubes along the belt front edge */}
      <NeonTube position={[0, -0.1, 1.35]} rotation={[0, 0, Math.PI / 2]} length={9.5} />
    </group>
  );
}
