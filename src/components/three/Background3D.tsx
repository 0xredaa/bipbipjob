import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { ConveyorBelt } from './ConveyorBelt';
import { Structure } from './Structure';
import { NeonLights } from './NeonLights';

/**
 * Full-viewport interactive 3D background telling the product story: a self-
 * running factory where job-offer parcels flow along the conveyor, pass through
 * a glowing scanner gate, and ~1 in 3 lights up green ("MATCH") and lifts off
 * while the rest continue. Reuses the existing machine assets. Rendered fixed
 * behind all content with pointer-events: none, so the UI stays clickable.
 */

const PARCEL_COUNT = 7;
const X_START = -6.4;
const X_END = 6.4;
const SPEED = 1.45;
const BASE_Y = 0.72;
const MATCH_RATE = 0.34;

type Pointer = React.MutableRefObject<{ x: number; y: number }>;

function usePointer(): Pointer {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return pointer;
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

interface ParcelState {
  x: number;
  z: number;
  decided: boolean;
  matched: boolean;
  lift: number;
  spin: number;
}

/** One job-offer parcel travelling the belt; decides MATCH at the scanner (x≈0). */
function FlowParcel({ phase, onMatch }: { phase: number; onMatch: () => void }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.MeshStandardMaterial>(null);
  const tape = useRef<THREE.MeshStandardMaterial>(null);

  const state = useRef<ParcelState>({
    x: X_START + phase * (X_END - X_START),
    z: (Math.random() - 0.5) * 0.7,
    decided: phase > 0.5, // ones already past the scanner just exit calmly
    matched: false,
    lift: 0,
    spin: Math.random() * Math.PI,
  });

  const respawn = (s: ParcelState) => {
    s.x = X_START - Math.random() * 1.5;
    s.z = (Math.random() - 0.5) * 0.7;
    s.decided = false;
    s.matched = false;
    s.lift = 0;
    s.spin = Math.random() * Math.PI;
  };

  useFrame((st, delta) => {
    const s = state.current;
    const g = group.current;
    if (!g) return;
    const d = Math.min(delta, 0.05);

    s.x += SPEED * d;

    // Decision happens as the parcel reaches the scanner gate.
    if (!s.decided && s.x >= 0) {
      s.decided = true;
      s.matched = Math.random() < MATCH_RATE;
      if (s.matched) onMatch();
    }
    if (s.matched && s.x >= 0) s.lift = Math.min(s.lift + d / 1.0, 1.3);

    const lift = easeOut(Math.min(s.lift, 1));
    g.position.x = s.x + (s.matched ? lift * 1.4 : 0);
    g.position.y = BASE_Y + lift * 3.4 + Math.sin(st.clock.elapsedTime * 2 + s.spin) * 0.015;
    g.position.z = s.z + (s.matched ? lift * 0.8 : 0);
    g.rotation.y = s.spin + st.clock.elapsedTime * 0.25;
    const scale = 1 - lift * 0.35;
    g.scale.setScalar(scale);

    // Colour + fade.
    if (tape.current) {
      if (s.matched) {
        tape.current.color.set('#22C55E');
        tape.current.emissive.set('#22C55E');
        tape.current.emissiveIntensity = 0.6 + lift * 1.2;
      } else {
        tape.current.color.set('#FACC15');
        tape.current.emissive.set('#FACC15');
        tape.current.emissiveIntensity = 0.25;
      }
      const fade = s.lift > 0.85 ? Math.max(0, 1 - (s.lift - 0.85) / 0.45) : 1;
      tape.current.opacity = fade;
      if (body.current) body.current.opacity = fade;
    }

    if (s.x > X_END || s.lift > 1.25) respawn(s);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[1.05, 0.92, 1.0]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial ref={body} color="#C19A6B" roughness={0.85} transparent />
      </RoundedBox>
      {/* Tape band — yellow normally, green when matched. */}
      <mesh>
        <boxGeometry args={[1.09, 0.22, 1.04]} />
        <meshStandardMaterial
          ref={tape}
          color="#FACC15"
          emissive="#FACC15"
          emissiveIntensity={0.25}
          roughness={0.35}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** The glowing scanner gate over the belt at x≈0, with a sweeping scan line. */
function Scanner({ flash }: { flash: React.MutableRefObject<number> }) {
  const beam = useRef<THREE.Mesh>(null);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null);
  const greenLight = useRef<THREE.PointLight>(null);

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    // Sweep the scan plane up and down within the arch.
    if (beam.current) beam.current.position.y = 1.3 + Math.sin(t * 2.2) * 0.85;
    if (beamMat.current) beamMat.current.opacity = 0.25 + (Math.sin(t * 2.2) * 0.5 + 0.5) * 0.25;
    // Flare the green light from the shared "match" flash (decayed in FactoryRig).
    if (greenLight.current) greenLight.current.intensity = flash.current * 6;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Arch frame around the belt */}
      {[-1.25, 1.25].map((z) => (
        <mesh key={z} position={[0, 1.45, z]} castShadow>
          <boxGeometry args={[0.16, 3.0, 0.16]} />
          <meshStandardMaterial color="#aab0b9" roughness={0.35} metalness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 2.95, 0]} castShadow>
        <boxGeometry args={[0.16, 0.16, 2.66]} />
        <meshStandardMaterial color="#aab0b9" roughness={0.35} metalness={0.85} />
      </mesh>
      {/* Cyan scan plane that sweeps vertically */}
      <mesh ref={beam} position={[0, 1.3, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.04, 0.06, 2.5]} />
        <meshBasicMaterial
          ref={beamMat}
          color="#38BDF8"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 1.6, 0.4]} color="#38BDF8" intensity={1.4} distance={6} decay={2} />
      {/* Green burst light that flares when a parcel matches */}
      <pointLight ref={greenLight} position={[1.2, 1.2, 0.6]} color="#22C55E" intensity={0} distance={7} decay={2} />
    </group>
  );
}

function FactoryRig({ pointer }: { pointer: Pointer }) {
  const rig = useRef<THREE.Group>(null);
  const flash = useRef(0);

  useFrame((st, delta) => {
    const g = rig.current;
    if (!g) return;
    const t = st.clock.elapsedTime;
    // Gentle ambient sway + pointer parallax.
    const targetY = Math.sin(t * 0.12) * 0.18 + pointer.current.x * 0.22;
    const targetX = pointer.current.y * 0.08;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.04);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.04);
    // Decay the match flash here (single source of truth).
    flash.current = Math.max(0, flash.current - Math.min(delta, 0.05) * 2.5);
  });

  return (
    <group ref={rig} position={[0, -0.4, 0]}>
      <Structure />
      <ConveyorBelt />
      <NeonLights />
      <Scanner flash={flash} />
      {Array.from({ length: PARCEL_COUNT }, (_, i) => (
        <FlowParcel key={i} phase={i / PARCEL_COUNT} onMatch={() => (flash.current = 1)} />
      ))}
      <ContactShadows position={[0, -2.2, 0]} opacity={0.45} scale={18} blur={2.6} far={6} />
    </group>
  );
}

export function Background3D() {
  const pointer = usePointer();
  return (
    <div
      aria-hidden
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
    >
      {/* Blurred, slightly over-scaled canvas so the machine reads as a soft,
          out-of-focus backdrop rather than a competing foreground subject. */}
      <div style={{ position: 'absolute', inset: '-14px', filter: 'blur(4px)' }}>
        <CanvasErrorBoundary fallback={null}>
          <Canvas
            shadows
            dpr={[1, 1.75]}
            camera={{ position: [7.5, 4.4, 9.5], fov: 40 }}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#0b0f17']} />
            <fog attach="fog" args={['#0b0f17', 13, 28]} />
            <ambientLight intensity={0.45} />
            <hemisphereLight args={['#cfd6e4', '#1a1f2b', 0.5]} />
            <directionalLight position={[5, 8, 6]} intensity={1.0} castShadow />
            <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#FACC15" />
            <Suspense fallback={null}>
              <FactoryRig pointer={pointer} />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      </div>
      {/* Dark veil to dim the scene and keep foreground text fully readable. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(125% 125% at 50% 40%, rgba(11,15,23,0.55) 0%, rgba(11,15,23,0.8) 100%)',
        }}
      />
    </div>
  );
}
