import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { JobOffer } from '@/types';
import { getOfferMissions } from '@/services/mockData';
import { CloseIcon, CheckIcon, HeartCheckIcon } from '@/components/icons';

interface Props {
  offer: JobOffer;
  onClose: () => void;
  onMatch?: () => void;
  canMatch?: boolean;
}

/**
 * The job post rendered as a logistics delivery note ("bon de livraison") on a
 * warehouse clipboard — opened when the parcel is clicked.
 */
export function OfferDetail({ offer, onClose, onMatch, canMatch = true }: Props) {
  const missions = getOfferMissions(offer);
  const tracking = `BBJ-${offer.id.slice(-8).toUpperCase().padStart(8, '0')}`;
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Deterministic pseudo-barcode derived from the offer id.
  const bars = useMemo(() => {
    const seed = offer.id || 'BIPBIPJOB';
    return Array.from({ length: 52 }, (_, i) => ((seed.charCodeAt(i % seed.length) + i * 7) % 3) + 1);
  }, [offer.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Clipboard board */}
      <motion.div
        initial={{ y: -40, rotate: -6, scale: 0.92, opacity: 0 }}
        animate={{ y: 0, rotate: -1.5, scale: 1, opacity: 1 }}
        exit={{ y: 30, rotate: 4, scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#43474f] to-[#2f333a] p-3 shadow-2xl ring-1 ring-black/40"
        style={{ maxHeight: '88vh' }}
      >
        {/* Metal clip */}
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <div className="h-6 w-24 rounded-md bg-gradient-to-b from-[#d4d8df] to-[#9aa1ab] shadow-md ring-1 ring-black/30" />
          <div className="mx-auto -mt-1 h-2 w-10 rounded-b bg-[#7c828c]" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-1 top-1 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/70 transition hover:bg-black/50 hover:text-white"
        >
          <CloseIcon width={18} height={18} />
        </button>

        {/* Paper sheet */}
        <div
          className="relative mt-2 overflow-y-auto rounded-md bg-[#f4efe1] text-[#26262b] shadow-inner"
          style={{ maxHeight: 'calc(88vh - 1.75rem)' }}
        >
          {/* TALENT INSIDE stamp */}
          <div className="pointer-events-none absolute right-4 top-28 z-10 rotate-[14deg] select-none">
            <div className="rounded border-[3px] border-[#c0392b]/70 px-2.5 py-1 text-[#c0392b]/80">
              <span className="font-mono text-sm font-extrabold uppercase tracking-wider">
                Talent inside
              </span>
            </div>
          </div>

          {/* Express header */}
          <div className="flex items-center justify-between bg-[#1b1f27] px-4 py-2.5 text-white">
            <div className="flex items-center gap-2">
              <span className="rounded-sm bg-ruban px-1.5 py-0.5 font-mono text-[10px] font-extrabold tracking-wider text-ink">
                BIPBIPJOB
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                Express
              </span>
            </div>
            <span className="font-mono text-[10px] text-white/50">{today}</span>
          </div>
          {/* Yellow tape line */}
          <div className="h-1.5 bg-ruban" />

          <div className="px-5 py-4">
            <div className="flex items-end justify-between border-b-2 border-dashed border-[#cdc4ad] pb-2">
              <h2 className="font-mono text-base font-extrabold uppercase tracking-wide">
                Bon de livraison
              </h2>
              <span className="font-mono text-[10px] text-[#8a7f63]">N° {tracking}</span>
            </div>

            {/* Destinataire */}
            <div className="mt-3 flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold text-white shadow"
                style={{ background: offer.logoColor }}
              >
                {offer.company.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8a7f63]">
                  Destinataire
                </p>
                <p className="truncate font-display text-lg font-bold leading-tight">{offer.title}</p>
                <p className="truncate text-sm text-[#5c5647]">{offer.company}</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="mt-4 space-y-1.5">
              <Row label="Secteur" value={offer.sector} />
              <Row label="Lieu" value={offer.location} />
              <Row label="Contrat" value={offer.contract} />
              <Row label="Salaire" value={offer.salary} />
              <Row label="Contact" value={offer.companyEmail} />
            </div>

            {/* Contenu du colis — missions checklist */}
            <section className="mt-5">
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#8a7f63]">
                Contenu du colis
              </p>
              <ul className="space-y-2">
                {missions.map((m, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-snug text-[#3a352a]">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-[#6b6452] text-[#1f7a3a]">
                      <CheckIcon width={11} height={11} strokeWidth={3} />
                    </span>
                    {m}
                  </li>
                ))}
              </ul>
            </section>

            {/* Notes */}
            <section className="mt-5">
              <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#8a7f63]">
                Notes
              </p>
              <p className="text-sm italic leading-relaxed text-[#4a4536]">{offer.description}</p>
              <p className="mt-2 text-sm italic leading-relaxed text-[#4a4536]">
                Profil : maîtrise de {offer.tags.slice(0, 3).join(', ')}. Une expérience en{' '}
                {offer.contract} est un plus.
              </p>
            </section>

            {/* Tag stickers */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {offer.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-sm border border-[#cdc4ad] bg-[#eae3d0] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#5c5647]"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Barcode */}
            <div className="mt-5 border-t-2 border-dashed border-[#cdc4ad] pt-3">
              <div className="flex h-12 items-stretch gap-px overflow-hidden">
                {bars.map((w, i) => (
                  <span
                    key={i}
                    style={{ width: w * 1.6, background: i % 2 ? 'transparent' : '#1a1a1a' }}
                  />
                ))}
              </div>
              <p className="mt-1 text-center font-mono text-[10px] tracking-[0.3em] text-[#5c5647]">
                {tracking}
              </p>
            </div>
          </div>

          {/* Footer action — sticky "stamp" */}
          <div className="sticky bottom-0 border-t border-[#d8cfb8] bg-[#efe8d6]/95 p-3 backdrop-blur">
            {onMatch ? (
              <button
                onClick={() => {
                  onMatch();
                  onClose();
                }}
                disabled={!canMatch}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f7a3a] py-3 font-mono text-sm font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-[#1c8c41] disabled:cursor-not-allowed disabled:bg-[#9aa1ab] disabled:opacity-60"
              >
                <HeartCheckIcon width={18} height={18} />
                {canMatch ? 'Tamponner — Postuler' : 'Plus de crédits'}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-[#3a3f47] py-3 font-mono text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#4a4f57]"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-[#8a7f63]">
        {label}
      </span>
      <span className="min-w-[1rem] flex-1 translate-y-[-2px] border-b border-dotted border-[#bcb295]" />
      <span className="max-w-[62%] truncate text-right font-mono text-xs font-semibold text-[#26262b]">
        {value}
      </span>
    </div>
  );
}
