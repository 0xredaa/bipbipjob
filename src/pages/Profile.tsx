import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { useStore } from '@/store/useStore';
import { SECTOR_COLOR } from '@/services/mockData';
import {
  MailIcon,
  MapPinIcon,
  BriefcaseIcon,
  StarIcon,
  SparkleIcon,
  CheckIcon,
  UploadIcon,
} from '@/components/icons';

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U';
}

export function ProfilePage() {
  const user = useStore((s) => s.user);
  const runCVAnalysis = useStore((s) => s.runCVAnalysis);
  const isAnalyzing = useStore((s) => s.isAnalyzing);
  const navigate = useNavigate();

  if (!user) {
    return (
      <Layout>
        <p className="text-white/60">Aucun utilisateur connecté.</p>
      </Layout>
    );
  }

  const cv = user.cvAnalysis;

  const reAnalyze = async () => {
    await runCVAnalysis();
    toast.success('CV ré-analysé', { icon: '✅' });
  };

  return (
    <Layout>
      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass overflow-hidden rounded-3xl"
      >
        <div className="h-24 bg-gradient-to-r from-ruban/30 via-amber-500/15 to-transparent" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt="Profil"
                  className="h-24 w-24 rounded-3xl object-cover ring-4 ring-ink"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-ruban to-amber-600 font-display text-3xl font-bold text-ink ring-4 ring-ink">
                  {initials(user.firstName, user.lastName)}
                </div>
              )}
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-white/55">{user.job}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/register')}
                className="btn bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
              >
                Modifier
              </button>
              <button
                onClick={reAnalyze}
                disabled={isAnalyzing}
                className="btn bg-ruban px-4 py-2 text-sm text-ink hover:bg-amber-400 disabled:opacity-50"
              >
                <SparkleIcon width={15} height={15} />
                {isAnalyzing ? 'Analyse…' : 'Ré-analyser le CV'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Info Icon={MailIcon} label="Email" value={user.email} />
            <Info Icon={MapPinIcon} label="Localisation" value={user.location} />
            <Info Icon={BriefcaseIcon} label="Contrat recherché" value={user.contract} />
          </div>

          {user.bio && (
            <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-white/70">
              {user.bio}
            </p>
          )}

          {/* CV file */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-match/15 text-match">
              <CheckIcon width={18} height={18} />
            </span>
            <span className="text-sm">
              <span className="font-medium text-white">{user.cvFileName}</span>
              <span className="ml-2 text-white/40">CV téléversé</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* CV analysis */}
      {cv ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Left column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass rounded-3xl p-6"
            >
              <div className="flex items-center gap-4">
                <ScoreRing score={cv.score} />
                <div>
                  <p className="font-display text-lg font-bold">Score CV</p>
                  <p className="text-sm text-white/50">
                    {cv.yearsOfExperience} ans d'expérience
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6"
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
                Secteurs recommandés
              </h2>
              <div className="flex flex-wrap gap-2">
                {cv.suggestedSectors.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                    style={{ background: `${SECTOR_COLOR[s]}1a`, color: SECTOR_COLOR[s] }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: SECTOR_COLOR[s] }} />
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-3xl p-6"
            >
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                <StarIcon width={15} height={15} /> Compétences
              </h2>
              <div className="flex flex-wrap gap-2">
                {cv.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/75">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column — experiences & education */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                <BriefcaseIcon width={15} height={15} /> Expériences & stages
              </h2>
              <ol className="relative space-y-4 border-l border-white/10 pl-5">
                {cv.experiences.map((exp, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[1.45rem] top-1 h-2.5 w-2.5 rounded-full bg-ruban ring-4 ring-ink" />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{exp.role}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          exp.type === 'Stage' || exp.type === 'Alternance'
                            ? 'bg-ruban/15 text-ruban'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {exp.type}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">{exp.company} · {exp.period}</p>
                    <p className="mt-0.5 text-sm text-white/60">{exp.description}</p>
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-3xl p-6"
            >
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Formation
              </h2>
              <div className="space-y-3">
                {cv.education.map((ed, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{ed.degree}</p>
                      <p className="text-xs text-white/50">{ed.school}</p>
                    </div>
                    <span className="text-sm font-medium text-white/40">{ed.year}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="glass mt-6 grid place-items-center rounded-3xl py-16 text-center">
          <div className="max-w-sm px-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ruban/15 text-ruban">
              <UploadIcon width={28} height={28} />
            </div>
            <h2 className="font-display text-lg font-bold">CV pas encore analysé</h2>
            <p className="mt-1.5 text-sm text-white/50">
              Lancez l'analyse pour extraire vos expériences, stages et compétences.
            </p>
            <button
              onClick={reAnalyze}
              disabled={isAnalyzing}
              className="btn mt-5 bg-ruban px-5 py-2.5 text-ink hover:bg-amber-400 disabled:opacity-50"
            >
              <SparkleIcon width={16} height={16} />
              {isAnalyzing ? 'Analyse…' : 'Analyser mon CV'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Info({
  Icon,
  label,
  value,
}: {
  Icon: typeof MailIcon;
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

function ScoreRing({ score }: { score: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#FACC15' : '#F59E0B';
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * score) / 100 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-lg font-bold" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
}
