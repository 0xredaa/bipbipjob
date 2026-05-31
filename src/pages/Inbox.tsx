import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useStore } from '@/store/useStore';
import type { EmailStatus, Match } from '@/types';
import {
  MailIcon,
  MailOpenIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  BriefcaseIcon,
  InboxIcon,
  BoltIcon,
} from '@/components/icons';

const STATUS_META: Record<EmailStatus, { label: string; color: string; Icon: typeof MailIcon }> = {
  pending: { label: 'En attente', color: '#9CA3AF', Icon: ClockIcon },
  sent: { label: 'Envoyé', color: '#FACC15', Icon: MailIcon },
  delivered: { label: 'Délivré', color: '#22C55E', Icon: CheckIcon },
  opened: { label: 'Ouvert', color: '#06B6D4', Icon: MailOpenIcon },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

export function InboxPage() {
  const matches = useStore((s) => s.matches);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = matches.find((m) => m.id === selectedId) ?? null;

  return (
    <Layout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Inbox</h1>
          <p className="mt-1 text-white/50">
            {matches.length} match{matches.length > 1 ? 's' : ''} envoyé
            {matches.length > 1 ? 's' : ''} aux entreprises.
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* List */}
          <div className="space-y-3">
            {matches.map((m, i) => (
              <MatchRow
                key={m.id}
                match={m}
                index={i}
                active={m.id === selectedId}
                onClick={() => setSelectedId(m.id)}
              />
            ))}
          </div>

          {/* Detail */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <AnimatePresence mode="wait">
              {selected ? (
                <MatchDetail key={selected.id} match={selected} />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass grid h-64 place-items-center rounded-2xl text-center text-white/40"
                >
                  <div>
                    <MailIcon width={32} height={32} className="mx-auto mb-2 opacity-50" />
                    Sélectionnez un match pour voir le détail
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </Layout>
  );
}

function MatchRow({
  match,
  index,
  active,
  onClick,
}: {
  match: Match;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const meta = STATUS_META[match.emailStatus];
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className={`glass flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${
        active ? 'ring-2 ring-ruban' : 'hover:bg-white/[0.07]'
      }`}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white"
        style={{ background: match.offer.logoColor }}
      >
        {match.offer.company.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{match.offer.title}</p>
        <p className="truncate text-xs text-white/50">
          {match.offer.company} · {timeAgo(match.matchedAt)}
        </p>
      </div>
      <span
        className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
        style={{ background: `${meta.color}1a`, color: meta.color }}
      >
        <meta.Icon width={13} height={13} />
        {meta.label}
      </span>
    </motion.button>
  );
}

function MatchDetail({ match }: { match: Match }) {
  const meta = STATUS_META[match.emailStatus];
  const { offer } = match;
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="glass overflow-hidden rounded-2xl"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl font-display text-lg font-bold text-white"
            style={{ background: offer.logoColor }}
          >
            {offer.company.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{offer.title}</h2>
            <p className="text-white/60">{offer.company}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {offer.tags.map((t) => (
            <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
              {t}
            </span>
          ))}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Info Icon={MapPinIcon} label="Localisation" value={offer.location} />
          <Info Icon={BriefcaseIcon} label="Contrat" value={offer.contract} />
          <Info Icon={BoltIcon} label="Salaire" value={offer.salary} />
          <Info Icon={ClockIcon} label="Envoyé" value={timeAgo(match.matchedAt)} />
        </dl>

        <p className="mt-5 text-sm leading-relaxed text-white/60">{offer.description}</p>
      </div>

      {/* Email status track */}
      <div className="border-t border-white/5 bg-white/[0.02] p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Statut de l'email
        </p>
        <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: `${meta.color}22`, color: meta.color }}
          >
            <meta.Icon width={18} height={18} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: meta.color }}>
              {meta.label}
            </p>
            <p className="text-xs text-white/40">
              CV envoyé à <span className="text-white/60">{offer.companyEmail}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Info({
  Icon,
  label,
  value,
}: {
  Icon: typeof MapPinIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
      <Icon width={16} height={16} className="shrink-0 text-white/40" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass grid place-items-center rounded-3xl py-24 text-center"
    >
      <div className="max-w-sm px-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ruban/15 text-ruban">
          <InboxIcon width={32} height={32} />
        </div>
        <h2 className="font-display text-xl font-bold">Aucun match pour l'instant</h2>
        <p className="mt-2 text-sm text-white/50">
          Lancez la machine et faites bip-bip sur les offres qui vous plaisent.
          Vos candidatures apparaîtront ici.
        </p>
        <Link
          to="/machine"
          className="btn mt-6 bg-ruban px-6 py-3 text-ink shadow-neon hover:bg-amber-400"
        >
          <BoltIcon width={18} height={18} />
          Lancer la machine
        </Link>
      </div>
    </motion.div>
  );
}
