import { ContactShadows } from '@react-three/drei';
import type { JobOffer } from '@/types';
import { ConveyorBelt } from './ConveyorBelt';
import { Structure } from './Structure';
import { Package } from './Package';
import { DigitalScreen } from './DigitalScreen';
import { NeonLights } from './NeonLights';
import { ParticleBurst } from './Particles';
import { ShakeGroup } from './CameraShake';
import type { MachineActionType, MachinePhase } from './machineTypes';

interface MachineSceneProps {
  offer: JobOffer | null;
  phase: MachinePhase;
  remaining: number;
  total: number;
  actionId: number;
  actionType: MachineActionType;
  onExitComplete: () => void;
}

/** Everything that lives inside the <Canvas> for the main machine. */
export function MachineScene({
  offer,
  phase,
  remaining,
  total,
  actionId,
  actionType,
  onExitComplete,
}: MachineSceneProps) {
  return (
    <>
      {/* Lighting — fully local, no external HDR fetch */}
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#cfd6e4', '#1a1f2b', 0.7]} />
      <directionalLight
        position={[5, 8, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Warm key + cool rim to fake reflections on the metal */}
      <directionalLight position={[-6, 4, -4]} intensity={0.6} color="#FACC15" />
      <pointLight position={[0, 5, 5]} intensity={0.6} color="#ffffff" />
      <spotLight position={[-4, 7, 3]} angle={0.6} penumbra={0.8} intensity={0.8} color="#aab4ff" />

      <ShakeGroup actionId={actionId} type={actionType}>
        <Structure />
        <ConveyorBelt />
        <DigitalScreen offer={offer} remaining={remaining} total={total} />
        <NeonLights />
        <Package offer={offer} phase={phase} onExitComplete={onExitComplete} />
        <ParticleBurst actionId={actionId} type={actionType} />
      </ShakeGroup>

      {/* Soft grounded shadow */}
      <ContactShadows
        position={[0, -2.22, 0]}
        opacity={0.45}
        scale={18}
        blur={2.4}
        far={6}
        color="#000000"
      />
    </>
  );
}
