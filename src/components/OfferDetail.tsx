import { motion } from 'framer-motion';
import type { JobOffer } from '@/types';
import { getOfferMissions, SECTOR_COLOR } from '@/services/mockData';
import {
  CloseIcon,
  MapPinIcon,
  BriefcaseIcon,
  BoltIcon,
  CheckIcon,
  HeartCheckIcon,
  MailIcon,
} from '@/components/icons';

interface Props {
  offer: JobOffer;
  onClose: () => void;
  onMatch?: () => void;
  canMatch?: boolean;
}

/** Slide-over card with the full job post: description, missions, profile. */
export function OfferDetail({ offer, onClose, onMatch, canMatch = true }: Props) {
  const missions = getOfferMissions(offer);
  const color = SECTOR_COLOR[offer.sector];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex justify-end bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-panel/95 shadow-2xl ring-1 ring-white/10"
      >
        {/* Header */}
        <div className="relative shrink-0 p-6 pb-4">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <CloseIcon width={18} height={18} />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-bold text-white"
              style={{ background: offer.logoColor }}
            >
              {offer.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: `${color}22`, color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                {offer.sector}
              </span>
              <h2 className="mt-1 font-display text-xl font-bold leading-tight">{offer.title}</h2>
              <p className="text-white/55">{offer.company}</p>
            </div>
          </div>

          {/* Quick facts */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Fact Icon={MapPinIcon} value={offer.location} />
            <Fact Icon={BriefcaseIcon} value={offer.contract} />
            <Fact Icon={BoltIcon} value={offer.salary} />
            <Fact Icon={MailIcon} value={offer.companyEmail} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 px-6 pb-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {offer.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
                {t}
              </span>
            ))}
          </div>

          {/* Description */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              Le poste
            </h3>
            <p className="text-sm leading-relaxed text-white/70">{offer.description}</p>
          </section>

          {/* Missions */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              Vos missions
            </h3>
            <ul className="space-y-2.5">
              {missions.map((m, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${color}22`, color }}
                  >
                    <CheckIcon width={13} height={13} />
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          </section>

          {/* Profile sought */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              Profil recherché
            </h3>
            <p className="text-sm leading-relaxed text-white/70">
              Vous maîtrisez {offer.tags.slice(0, 3).join(', ')} et souhaitez évoluer dans le
              secteur {offer.sector.toLowerCase()}. Une expérience en {offer.contract} est un plus.
            </p>
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 shrink-0 border-t border-white/10 bg-panel/95 p-4">
          {onMatch ? (
            <button
              onClick={() => {
                onMatch();
                onClose();
              }}
              disabled={!canMatch}
              className="btn w-full bg-match py-3 text-white shadow-lg hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HeartCheckIcon width={18} height={18} />
              {canMatch ? 'Postuler — envoyer mon CV' : 'Plus de crédits'}
            </button>
          ) : (
            <button onClick={onClose} className="btn w-full bg-white/10 py-3 hover:bg-white/15">
              Fermer
            </button>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function Fact({ Icon, value }: { Icon: typeof MapPinIcon; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
      <Icon width={15} height={15} className="shrink-0 text-white/40" />
      <span className="truncate text-xs text-white/80">{value}</span>
    </div>
  );
}
