import { useMemo } from 'react';

/** A row of rivets along a leg, instanced for cheapness. */
function Rivets({ count, spacing, y, z }: { count: number; spacing: number; y: number; z: number }) {
  const positions = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * spacing),
    [count, spacing],
  );
  return (
    <>
      {positions.map((x) => (
        <mesh key={x} position={[x, y, z]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#6b7280" roughness={0.3} metalness={0.95} />
        </mesh>
      ))}
    </>
  );
}

/**
 * The metal frame holding the conveyor: legs, cross-beams, base plates and
 * rivet detailing in the "modern factory" grey (#9CA3AF).
 */
export function Structure() {
  const legPositions: [number, number][] = [
    [-4.6, 1.0],
    [-4.6, -1.0],
    [4.6, 1.0],
    [4.6, -1.0],
  ];

  return (
    <group>
      {/* Legs */}
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, -1.0, z]} castShadow>
          <boxGeometry args={[0.28, 2.4, 0.28]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}

      {/* Foot plates */}
      {legPositions.map(([x, z], i) => (
        <mesh key={`foot-${i}`} position={[x, -2.18, z]} receiveShadow>
          <boxGeometry args={[0.55, 0.1, 0.55]} />
          <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* Lower cross-beams (long sides) */}
      {[1.0, -1.0].map((z) => (
        <mesh key={`beam-${z}`} position={[0, -1.4, z]} castShadow>
          <boxGeometry args={[9.6, 0.22, 0.22]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}

      {/* Lower cross-beams (short sides) */}
      {[-4.6, 4.6].map((x) => (
        <mesh key={`xbeam-${x}`} position={[x, -1.4, 0]} castShadow>
          <boxGeometry args={[0.22, 0.22, 2.2]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}

      {/* Top frame under the belt */}
      {[1.15, -1.15].map((z) => (
        <mesh key={`top-${z}`} position={[0, 0.0, z]} castShadow>
          <boxGeometry args={[10.4, 0.22, 0.2]} />
          <meshStandardMaterial color="#aab0b9" roughness={0.35} metalness={0.85} />
        </mesh>
      ))}

      {/* Rivet rows on the top frame */}
      <Rivets count={11} spacing={0.95} y={0.0} z={1.26} />
      <Rivets count={11} spacing={0.95} y={0.0} z={-1.26} />

      {/* Gantry uprights that carry the screen + neon bar */}
      {[-3.4, 3.4].map((x) => (
        <mesh key={`gantry-${x}`} position={[x, 2.0, -1.25]} castShadow>
          <boxGeometry args={[0.22, 4.0, 0.22]} />
          <meshStandardMaterial color="#9CA3AF" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
      {/* Gantry top beam */}
      <mesh position={[0, 3.95, -1.25]} castShadow>
        <boxGeometry args={[7.2, 0.26, 0.26]} />
        <meshStandardMaterial color="#aab0b9" roughness={0.35} metalness={0.85} />
      </mesh>
      <Rivets count={7} spacing={1.0} y={3.95} z={-1.1} />
    </group>
  );
}
