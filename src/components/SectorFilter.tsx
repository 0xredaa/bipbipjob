import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { SECTORS } from '@/services/mockData';
import { BriefcaseIcon, CheckIcon, CloseIcon } from './icons';

interface Props {
  /** Called after the selection changes so the page can reload the conveyor. */
  onChange?: () => void;
}

/**
 * Overlay control that lets the user pick which job sectors appear on the
 * conveyor (finance, logistics, tech…). Empty selection = all sectors.
 */
export function SectorFilter({ onChange }: Props) {
  const selected = useStore((s) => s.selectedSectors);
  const toggleSector = useStore((s) => s.toggleSector);
  const setSectors = useStore((s) => s.setSectors);
  const [open, setOpen] = useState(false);

  const count = selected.length;
  const label = count === 0 ? 'Tous les secteurs' : `${count} secteur${count > 1 ? 's' : ''}`;

  const handleToggle = (sector: Parameters<typeof toggleSector>[0]) => {
    toggleSector(sector);
    onChange?.();
  };

  const handleAll = () => {
    setSectors([]);
    onChange?.();
  };

  return (
    <div className="pointer-events-auto relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/10"
      >
        <BriefcaseIcon width={16} height={16} className="text-ruban" />
        <span>Je recherche : <span className="text-ruban">{label}</span></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9 L12 15 L18 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* click-away */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="glass absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-2xl p-3 shadow-xl"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Secteurs d'emploi
                </p>
                <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                  <CloseIcon width={15} height={15} />
                </button>
              </div>

              <button
                onClick={handleAll}
                className={`mb-1.5 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                  count === 0 ? 'bg-ruban/15 text-ruban' : 'hover:bg-white/5'
                }`}
              >
                Tous les secteurs
                {count === 0 && <CheckIcon width={15} height={15} />}
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                {SECTORS.map((s) => {
                  const active = selected.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      onClick={() => handleToggle(s.key)}
                      className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                        active ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: active ? s.color : 'transparent',
                          border: `1.5px solid ${s.color}`,
                        }}
                      >
                        {active && <CheckIcon width={11} height={11} className="text-ink" />}
                      </span>
                      <span className="truncate" style={{ color: active ? s.color : undefined }}>
                        {s.key}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
