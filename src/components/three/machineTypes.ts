export type MachinePhase = 'incoming' | 'idle' | 'matching' | 'skipping';

export type MachineActionType = 'match' | 'next' | null;

export interface MachineSignal {
  /** Increments on every user action so the scene can re-trigger effects. */
  actionId: number;
  type: MachineActionType;
}
