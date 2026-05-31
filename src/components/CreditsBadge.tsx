import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { BoltIcon, ClockIcon } from './icons';

function formatReset(resetAt: string): string {
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return 'imminent';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}min`;
}

export function CreditsBadge() {
  const credits = useStore((s) => s.credits);
  const refreshCredits = useStore((s) => s.refreshCredits);
  const [hover, setHover] = useState(false);

  // Initial fetch + 5s polling, as specified.
  useEffect(() => {
    void refreshCredits();
    const id = window.setInterval(() => void refreshCredits(), 5000);
    return () => window.clearInterval(id);
  }, [refreshCredits]);

  const ratio = credits ? credits.remaining / credits.total : 1;
  const color = useMemo(() => {
    if (!credits || credits.remaining === 0) return '#EF4444';
    if (ratio < 0.2) return '#F59E0B';
    return '#22C55E';
  }, [credits, ratio]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors"
        style={{
          borderColor: `${color}55`,
          background: `${color}1a`,
          boxShadow: `0 0 18px ${color}22`,
        }}
      >
        <BoltIcon width={16} height={16} style={{ color }} />
        <span className="font-display text-sm font-semibold tabular-nums" style={{ color }}>
          {credits ? `${credits.remaining}` : '—'}
          <span className="text-white/40">/{credits?.total ?? '—'}</span>
        </span>
        {/* Mini progress ring */}
        <div className="h-1.5 w-10 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            animate={{ width: `${Math.max(ratio * 100, credits?.remaining ? 6 : 0)}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {hover && credits && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-full z-50 mt-2 w-52 rounded-xl p-3 text-xs shadow-xl"
          >
            <div className="mb-1 flex items-center gap-1.5 text-white/80">
              <ClockIcon width={14} height={14} />
              <span className="font-semibold">Reset dans {formatReset(credits.resetAt)}</span>
            </div>
            <p className="text-white/50">
              Plan <span className="font-semibold uppercase text-ruban">{credits.plan}</span> —{' '}
              {credits.total} crédits / cycle. Chaque match consomme 1 crédit.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
