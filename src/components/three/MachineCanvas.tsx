import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { JobOffer } from '@/types';
import { MachineScene } from './MachineScene';
import type { MachineActionType, MachinePhase } from './machineTypes';

interface MachineCanvasProps {
  offer: JobOffer | null;
  phase: MachinePhase;
  remaining: number;
  total: number;
  actionId: number;
  actionType: MachineActionType;
  onExitComplete: () => void;
  onSelectOffer?: () => void;
}

export function MachineCanvas(props: MachineCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [6.5, 4.2, 9], fov: 42 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#0b0f17']} />
      <fog attach="fog" args={['#0b0f17', 16, 32]} />
      <Suspense fallback={null}>
        <MachineScene {...props} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={16}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 0]}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
