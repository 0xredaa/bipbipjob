import { motion } from 'framer-motion';
import type { JobOffer } from '@/types';
import type { MachinePhase } from './machineTypes';
import { MapPinIcon, BriefcaseIcon, BoltIcon } from '@/components/icons';

interface Props {
  offer: JobOffer | null;
  phase: MachinePhase;
}

/**
 * Pure-CSS replacement for the WebGL machine, shown when a WebGL context can't
 * be created. Keeps the product fully usable (the overlay MATCH/NEXT buttons
 * still drive the same store actions) — it just renders the current offer as an
 * animated 2D parcel instead of a 3D one.
 */
export function MachineFallback2D({ offer, phase }: Props) {
  const exitX = phase === 'matching' ? -420 : phase === 'skipping' ? 420 : 0;
  const exitRotate = phase === 'matching' ? -8 : phase === 'skipping' ? 16 : 0;
  const exitY = phase === 'skipping' ? 240 : 0;

  return (
    <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,#1a2030,#0b0f17_70%)]">
      {/* Faux conveyor */}
      <div className="absolute bottom-[28%] left-0 right-0 h-3 bg-gradient-to-b from-metal/40 to-metal/10" />
      <div className="absolute bottom-[26%] left-0 right-0 h-1 animate-pulse bg-ruban/20" />

      {offer && (
        <motion.div
          key={offer.id}
          initial={{ x: 360, opacity: 0, rotate: 6 }}
          animate={{
            x: exitX,
            y: exitY,
            opacity: phase === 'matching' || phase === 'skipping' ? 0 : 1,
            rotate: exitRotate,
          }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          className="relative w-[300px] -translate-y-6 rounded-3xl bg-carton p-1.5 shadow-2xl"
          style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Tape */}
          <div className="absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 bg-ruban/90 shadow-inner" />
          {/* Label */}
          <div className="relative rounded-2xl bg-white p-5 text-ink">
            <div className="-mx-5 -mt-5 mb-4 rounded-t-2xl bg-ink px-5 py-2 text-xs font-bold tracking-wider text-ruban">
              BIPBIPJOB · EXPRESS
            </div>
            <h3 className="font-display text-lg font-bold leading-snug">{offer.title}</h3>
            <p className="mt-0.5 text-sm font-semibold text-gray-600">{offer.company}</p>
            <div className="mt-3 space-y-1.5 text-xs text-gray-500">
              <p className="flex items-center gap-1.5">
                <MapPinIcon width={14} height={14} /> {offer.location}
              </p>
              <p className="flex items-center gap-1.5">
                <BriefcaseIcon width={14} height={14} /> {offer.contract}
              </p>
              <p className="flex items-center gap-1.5">
                <BoltIcon width={14} height={14} /> {offer.salary}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {offer.tags.map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-[11px] text-white/30">
        Mode 2D — WebGL indisponible sur ce navigateur
      </p>
    </div>
  );
}
