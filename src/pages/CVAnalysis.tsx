import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { SECTOR_COLOR } from '@/services/mockData';
import type { CVAnalysis } from '@/types';
import {
  Logo,
  SparkleIcon,
  CheckIcon,
  BriefcaseIcon,
  StarIcon,
  ArrowRightIcon,
} from '@/components/icons';

const SCAN_STEPS = [
  'Lecture du document…',
  'Extraction des expériences…',
  'Détection des compétences…',
  'Analyse des stages & formations…',
  'Calcul des secteurs recommandés…',
];

/**
 * Post-registration CV analyzer. Plays a short "scanning" sequence, runs the
 * (mocked) analysis, then shows the extracted profile before the plan picker.
 */
export function CVAnalysisPage() {
  const user = useStore((s) => s.user);
  const runCVAnalysis = useStore((s) => s.runCVAnalysis);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(
    user?.cvAnalysis ?? null,
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    const interval = window.setInterval(() => {
      setStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1));
    }, 460);

    runCVAnalysis().then((result) => {
      if (!mounted) return;
      setAnalysis(result);
      window.clearInterval(interval);
      setStep(SCAN_STEPS.length - 1);
      setDone(true);
    });

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-grid px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="font-display text-xl font-bold">
            BipBip<span className="text-ruban">Job</span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!done ? (
            <Scanning key="scan" step={step} fileName={user?.cvFileName} />
          ) : (
            analysis && (
              <Results
                key="results"
                analysis={analysis}
                onContinue={() => navigate('/plans')}
              />
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Scanning({ step, fileName }: { step: number; fileName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass rounded-3xl p-10 text-center"
    >
      {/* Animated scanner */}
      <div className="relative mx-auto mb-8 h-40 w-32 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {/* fake document lines */}
        <div className="space-y-2 p-4">
          {[90, 70, 80, 55, 75, 60, 85, 50].map((w, i) => (
            <div key={i} className="h-2 rounded bg-white/15" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* scan beam */}
        <motion.div
          className="absolute inset-x-0 h-10 bg-gradient-to-b from-ruban/0 via-ruban/40 to-ruban/0"
          animate={{ y: ['-10%', '420%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 ring-1 ring-ruban/30" />
      </div>

      <div className="mb-1 flex items-center justify-center gap-2 text-ruban">
        <SparkleIcon width={18} height={18} className="animate-pulse" />
        <h1 className="font-display text-xl font-bold">Analyse de votre CV</h1>
      </div>
      <p className="mb-6 text-sm text-white/40">{fileName ?? 'votre-cv.pdf'}</p>

      <div className="mx-auto max-w-xs space-y-2 text-left">
        {SCAN_STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-2.5 text-sm transition-colors ${
              i <= step ? 'text-white' : 'text-white/25'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                i < step
                  ? 'border-match bg-match/20 text-match'
                  : i === step
                    ? 'border-ruban text-ruban'
                    : 'border-white/15'
              }`}
            >
              {i < step ? <CheckIcon width={12} height={12} /> : i + 1}
            </span>
            {label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Results({
  analysis,
  onContinue,
}: {
  analysis: CVAnalysis;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Score header */}
      <div className="glass rounded-3xl p-7">
        <div className="flex items-center gap-5">
          <ScoreRing score={analysis.score} />
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-match/30 bg-match/10 px-2.5 py-0.5 text-xs font-medium text-match">
              <CheckIcon width={13} height={13} />
              CV analysé
            </span>
            <h1 className="mt-1.5 font-display text-2xl font-bold">Votre profil</h1>
            <p className="text-sm text-white/50">
              {analysis.yearsOfExperience} ans d'expérience ·{' '}
              {analysis.experiences.length} expériences détectées
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-white/70">
          {analysis.summary}
        </p>
      </div>

      {/* Suggested sectors */}
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
          Secteurs recommandés
        </h2>
        <div className="flex flex-wrap gap-2">
          {analysis.suggestedSectors.map((s) => (
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
      </div>

      {/* Skills */}
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
          <StarIcon width={15} height={15} /> Compétences
        </h2>
        <div className="flex flex-wrap gap-2">
          {analysis.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/75">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experiences & internships */}
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
          <BriefcaseIcon width={15} height={15} /> Expériences & stages
        </h2>
        <ol className="relative space-y-4 border-l border-white/10 pl-5">
          {analysis.experiences.map((exp, i) => (
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
      </div>

      <button
        onClick={onContinue}
        className="btn w-full bg-ruban py-3.5 text-ink shadow-neon hover:bg-amber-400"
      >
        Continuer vers les plans
        <ArrowRightIcon width={18} height={18} />
      </button>
    </motion.div>
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
