import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Aluminium conveyor belt. The tread texture scrolls continuously to sell the
 * "running" motion; the two end rollers spin in sync.
 */
export function ConveyorBelt() {
  const beltMat = useRef<THREE.MeshStandardMaterial>(null);
  const rollerL = useRef<THREE.Mesh>(null);
  const rollerR = useRef<THREE.Mesh>(null);

  const beltTexture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 64;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#3a3f47';
    ctx.fillRect(0, 0, 128, 64);
    // Cross treads
    for (let x = 0; x < 128; x += 16) {
      ctx.fillStyle = '#2a2e34';
      ctx.fillRect(x, 0, 8, 64);
      ctx.fillStyle = '#4b5158';
      ctx.fillRect(x + 8, 0, 2, 64);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 1.4);
    return tex;
  }, []);

  useFrame((_, delta) => {
    beltTexture.offset.x -= delta * 0.6;
    if (beltMat.current) beltMat.current.map = beltTexture;
    const spin = delta * 3.6;
    if (rollerL.current) rollerL.current.rotation.z -= spin;
    if (rollerR.current) rollerR.current.rotation.z -= spin;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Belt surface */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[11, 0.12, 2.2]} />
        <meshStandardMaterial
          ref={beltMat}
          map={beltTexture}
          color="#9aa1ab"
          roughness={0.55}
          metalness={0.6}
        />
      </mesh>

      {/* Side rails (aluminium) */}
      {[1.25, -1.25].map((z) => (
        <mesh key={z} position={[0, 0.18, z]} castShadow>
          <boxGeometry args={[11, 0.3, 0.18]} />
          <meshStandardMaterial color="#c2c7cf" roughness={0.3} metalness={0.85} />
        </mesh>
      ))}

      {/* End rollers */}
      {[
        { x: -5.4, ref: rollerL },
        { x: 5.4, ref: rollerR },
      ].map(({ x, ref }) => (
        <mesh key={x} ref={ref} position={[x, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 2.2, 24]} />
          <meshStandardMaterial color="#d4d8df" roughness={0.25} metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
