import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Header } from '@/components/Header';
import { SectorFilter } from '@/components/SectorFilter';
import { SECTOR_COLOR } from '@/services/mockData';

// Lazy-load the WebGL scene so the overlay UI shows instantly while it boots.
const MachineCanvas = lazy(() =>
  import('@/components/three/MachineCanvas').then((m) => ({ default: m.MachineCanvas })),
);
import { HeartCheckIcon, ArrowRightIcon, CrownIcon, SparkleIcon, CloseIcon } from '@/components/icons';
import { useStore } from '@/store/useStore';
import { playMatchBip, playNextBlip, playDeniedBuzz } from '@/utils/sound';
import { isWebGLAvailable } from '@/utils/webgl';
import { CanvasErrorBoundary } from '@/components/three/CanvasErrorBoundary';
import { MachineFallback2D } from '@/components/three/MachineFallback2D';
import type { MachineActionType, MachinePhase } from '@/components/three/machineTypes';

export function MachinePage() {
  const currentOffer = useStore((s) => s.currentOffer);
  const credits = useStore((s) => s.credits);
  const loadNextOffer = useStore((s) => s.loadNextOffer);
  const matchCurrent = useStore((s) => s.matchCurrent);
  const refreshCredits = useStore((s) => s.refreshCredits);

  const [phase, setPhase] = useState<MachinePhase>('incoming');
  const [action, setAction] = useState<{ id: number; type: MachineActionType }>({
    id: 0,
    type: null,
  });
  const [busy, setBusy] = useState(false);
  const pendingMatch = useRef(false);
  const navigate = useNavigate();
  // Probe WebGL once on mount; fall back to a 2D machine if it's unavailable.
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(isWebGLAvailable()), []);
  // Lets the user dismiss the upgrade prompt and keep browsing offers.
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);

  const outOfCredits = credits?.remaining === 0;
  const showUpgrade = outOfCredits && !upgradeDismissed;

  // Load the first offer + credits on mount.
  useEffect(() => {
    if (!currentOffer) void loadNextOffer();
    void refreshCredits();
  }, [currentOffer, loadNextOffer, refreshCredits]);

  // After the "incoming" slide, settle into idle so the parcel hovers.
  useEffect(() => {
    if (phase !== 'incoming') return;
    const t = window.setTimeout(() => setPhase('idle'), 700);
    return () => window.clearTimeout(t);
  }, [phase, currentOffer]);

  // In 2D fallback mode there's no 3D parcel to report exit completion, so we
  // advance the flow on a timer matching the CSS exit animation.
  useEffect(() => {
    if (webgl) return;
    if (phase !== 'matching' && phase !== 'skipping') return;
    const t = window.setTimeout(() => void handleExitComplete(), 650);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, webgl]);

  const triggerAction = (type: MachineActionType) =>
    setAction((a) => ({ id: a.id + 1, type }));

  const handleMatch = useCallback(async () => {
    if (busy || !currentOffer) return;
    if (outOfCredits) {
      playDeniedBuzz();
      toast.error('Plus de crédits — passez au plan supérieur');
      return;
    }
    setBusy(true);
    pendingMatch.current = true;
    playMatchBip();
    triggerAction('match');
    setPhase('matching');

    const ok = await matchCurrent();
    if (!ok) {
      toast.error("Échec de l'envoi du match");
      pendingMatch.current = false;
      setPhase('idle');
      setBusy(false);
    }
  }, [busy, currentOffer, outOfCredits, matchCurrent]);

  const handleNext = useCallback(() => {
    if (busy || !currentOffer) return;
    setBusy(true);
    pendingMatch.current = false;
    playNextBlip();
    triggerAction('next');
    setPhase('skipping');
  }, [busy, currentOffer]);

  // Called by the parcel when its exit animation finishes.
  const handleExitComplete = useCallback(async () => {
    if (pendingMatch.current) {
      toast.success("Match envoyé ! L'entreprise a été notifiée", {
        icon: '✅',
      });
      pendingMatch.current = false;
    }
    await loadNextOffer();
    setPhase('incoming');
    setBusy(false);
  }, [loadNextOffer]);

  // When the sector filter changes, bring in a fresh offer from the new pool.
  const handleSectorsChange = useCallback(async () => {
    if (busy) return;
    await loadNextOffer();
    setPhase('incoming');
  }, [busy, loadNextOffer]);

  // Keyboard shortcuts: ← skip, → / Enter match.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        void handleMatch();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleMatch, handleNext]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ink">
      <Header />

      {/* 3D scene fills the viewport (with 2D fallback if WebGL is missing) */}
      <div className="absolute inset-0">
        {webgl ? (
          <CanvasErrorBoundary
            onError={() => setWebgl(false)}
            fallback={<MachineFallback2D offer={currentOffer} phase={phase} />}
          >
            <Suspense
              fallback={
                <div className="grid h-full place-items-center text-sm text-white/30">
                  Chargement de la machine…
                </div>
              }
            >
              <MachineCanvas
                offer={currentOffer}
                phase={phase}
                remaining={credits?.remaining ?? 0}
                total={credits?.total ?? 0}
                actionId={action.id}
                actionType={action.type}
                onExitComplete={handleExitComplete}
              />
            </Suspense>
          </CanvasErrorBoundary>
        ) : (
          <MachineFallback2D offer={currentOffer} phase={phase} />
        )}
      </div>

      {/* Sector filter + hint */}
      <div className="absolute left-1/2 top-24 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
        <SectorFilter onChange={handleSectorsChange} />
        <p className="pointer-events-none text-xs uppercase tracking-[0.2em] text-white/30">
          Glissez pour pivoter · ← passer · → matcher
        </p>
      </div>

      {/* Bottom action bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-4 pb-8">
        {currentOffer && (
          <motion.div
            key={currentOffer.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass max-w-md rounded-2xl px-5 py-2.5 text-center"
          >
            <div className="mb-0.5 flex items-center justify-center gap-2">
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: `${SECTOR_COLOR[currentOffer.sector]}22`,
                  color: SECTOR_COLOR[currentOffer.sector],
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: SECTOR_COLOR[currentOffer.sector] }}
                />
                {currentOffer.sector}
              </span>
              <p className="text-sm font-semibold text-white">{currentOffer.title}</p>
            </div>
            <p className="text-xs text-white/50">
              {currentOffer.company} · {currentOffer.location} · {currentOffer.salary}
            </p>
          </motion.div>
        )}

        <div className="flex items-center gap-5">
          {/* NEXT */}
          <ActionButton
            onClick={handleNext}
            disabled={busy}
            color="#EF4444"
            label="NEXT"
          >
            <ArrowRightIcon width={28} height={28} />
          </ActionButton>

          {/* MATCH */}
          <ActionButton
            onClick={handleMatch}
            disabled={busy || outOfCredits}
            color="#22C55E"
            label="MATCH"
            large
          >
            <HeartCheckIcon width={34} height={34} />
          </ActionButton>
        </div>
      </div>

      {/* Out-of-credits overlay */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-ink/70 backdrop-blur-sm"
            onClick={() => setUpgradeDismissed(true)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass relative mx-4 max-w-sm rounded-3xl p-8 text-center shadow-neon-strong"
            >
              {/* Close — continue without upgrading */}
              <button
                onClick={() => setUpgradeDismissed(true)}
                aria-label="Fermer"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <CloseIcon width={18} height={18} />
              </button>

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ruban/20 text-ruban">
                <CrownIcon width={30} height={30} />
              </div>
              <h2 className="font-display text-2xl font-bold">Plus de crédits</h2>
              <p className="mt-2 text-sm text-white/60">
                Vous avez utilisé tous vos crédits de matching pour ce cycle.
                Passez à un plan supérieur pour continuer à postuler sans limite.
              </p>
              <button
                onClick={() => navigate('/plans?upgrade=1')}
                className="btn mt-6 w-full bg-ruban px-6 py-3 text-ink shadow-neon hover:bg-amber-400"
              >
                <SparkleIcon width={18} height={18} />
                Passer au plan Pro
              </button>
              <button
                onClick={() => setUpgradeDismissed(true)}
                className="mt-3 w-full text-sm text-white/40 transition hover:text-white/70"
              >
                Non merci, continuer
              </button>
              <p className="mt-3 text-xs text-white/30">
                Reset automatique des crédits à la fin du cycle.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  label: string;
  large?: boolean;
  children: React.ReactNode;
}

function ActionButton({ onClick, disabled, color, label, large, children }: ActionButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.88, y: 4 }}
        whileHover={disabled ? undefined : { scale: 1.06 }}
        className="flex items-center justify-center rounded-full font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          width: large ? 84 : 68,
          height: large ? 84 : 68,
          background: color,
          boxShadow: `0 10px 30px ${color}66, inset 0 -4px 8px rgba(0,0,0,0.25)`,
        }}
        aria-label={label}
      >
        {children}
      </motion.button>
      <span
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
