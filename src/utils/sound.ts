/**
 * Tiny Web Audio helper. Lazily creates a single AudioContext (browsers require
 * it to be resumed after a user gesture, which the MATCH/NEXT clicks provide).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, gain = 0.15) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const env = audio.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  env.gain.setValueAtTime(0, audio.currentTime + start);
  env.gain.linearRampToValueAtTime(gain, audio.currentTime + start + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(env).connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.02);
}

/** The signature "bip-bip" played on a successful MATCH. */
export function playMatchBip() {
  tone(880, 0, 0.09);
  tone(1320, 0.11, 0.12);
}

/** A short low blip played on NEXT. */
export function playNextBlip() {
  tone(220, 0, 0.12, 0.1);
}

/** A soft error buzz when the user is out of credits. */
export function playDeniedBuzz() {
  tone(140, 0, 0.18, 0.12);
  tone(120, 0.12, 0.2, 0.12);
}
