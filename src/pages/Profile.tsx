import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { useStore } from '@/store/useStore';
import { SECTOR_COLOR } from '@/services/mockData';
import type { CVAnalysis, CVExperience, ContractType, User } from '@/types';
import {
  MailIcon,
  MapPinIcon,
  BriefcaseIcon,
  StarIcon,
  CheckIcon,
  UploadIcon,
  CloseIcon,
  BoltIcon,
  ArrowRightIcon,
} from '@/components/icons';

const CONTRACTS: ContractType[] = ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'];

type Tab = 'cv' | 'perso' | 'files';
const TABS: { id: Tab; label: string }[] = [
  { id: 'cv', label: 'CV' },
  { id: 'perso', label: 'Personnel' },
  { id: 'files', label: 'Fichiers' },
];

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U';
}

interface Draft {
  firstName: string;
  lastName: string;
  job: string;
  location: string;
  phone: string;
  contract: ContractType;
  bio: string;
  skills: string[];
  experiences: CVExperience[];
}

function toDraft(user: User): Draft {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    job: user.job,
    location: user.location,
    phone: user.phone,
    contract: user.contract,
    bio: user.bio,
    skills: user.cvAnalysis?.skills ?? [],
    experiences: user.cvAnalysis?.experiences ?? [],
  };
}

export function ProfilePage() {
  const user = useStore((s) => s.user);
  const credits = useStore((s) => s.credits);
  const updateProfile = useStore((s) => s.updateProfile);

  const [tab, setTab] = useState<Tab>('cv');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const openImport = () => fileRef.current?.click();

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    const toastId = toast.loading('Analyse du document…');
    try {
      const { extractTextFromFile, parseCVText } = await import('@/services/cvParser');
      const text = await extractTextFromFile(file);
      const analysis = parseCVText(text, { job: user?.job });
      await updateProfile({ cvAnalysis: analysis, cvFileName: file.name });
      toast.success(
        analysis.experiences.length
          ? `${analysis.experiences.length} expérience(s) importée(s)`
          : 'Document analysé (peu d’expériences détectées)',
        { id: toastId, icon: '✅' },
      );
    } catch {
      toast.error("Échec de l'analyse — le PDF doit contenir du texte", { id: toastId });
    } finally {
      setImporting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <p className="text-white/60">Aucun utilisateur connecté.</p>
      </Layout>
    );
  }

  const cv = user.cvAnalysis;

  const startEdit = () => {
    setDraft(toDraft(user));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(null);
  };

  const save = async () => {
    if (!draft) return;
    const cleanExp = draft.experiences.filter((e) => e.role.trim() || e.company.trim());
    const nextAnalysis: CVAnalysis = {
      score: cv?.score ?? 70,
      yearsOfExperience: cv?.yearsOfExperience ?? cleanExp.length,
      summary: cv?.summary ?? '',
      suggestedSectors: cv?.suggestedSectors ?? ['Tech'],
      education: cv?.education ?? [],
      skills: draft.skills,
      experiences: cleanExp,
    };
    try {
      await updateProfile({
        firstName: draft.firstName,
        lastName: draft.lastName,
        job: draft.job,
        location: draft.location,
        phone: draft.phone,
        contract: draft.contract,
        bio: draft.bio,
        cvAnalysis: nextAnalysis,
      });
      setEditing(false);
      setDraft(null);
      toast.success('Profil mis à jour', { icon: '✅' });
    } catch {
      toast.error('Échec de la mise à jour');
    }
  };

  return (
    <Layout>
      <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleImportPdf} />

      {/* Credits banner */}
      <Link
        to="/plans"
        className="glass flex items-center justify-between rounded-2xl px-4 py-3 transition hover:bg-white/10"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-match text-white">
            <BoltIcon width={20} height={20} />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">
              <span className="text-ruban">{credits?.remaining ?? 0}</span> crédits restants
            </p>
            <p className="text-xs text-white/50">Voir les abonnements</p>
          </div>
        </div>
        <ArrowRightIcon width={18} height={18} className="text-white/40" />
      </Link>

      {/* Identity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass mt-4 overflow-hidden rounded-3xl"
      >
        <div className="h-20 bg-gradient-to-r from-ruban/30 via-amber-500/15 to-transparent" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt="Profil" className="h-20 w-20 rounded-3xl object-cover ring-4 ring-ink" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-ruban to-amber-600 font-display text-2xl font-bold text-ink ring-4 ring-ink">
                  {initials(user.firstName, user.lastName)}
                </div>
              )}
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-white/55">{user.job || 'Métier non renseigné'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={cancelEdit} className="btn bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
                    Annuler
                  </button>
                  <button onClick={save} className="btn bg-match px-4 py-2 text-sm text-white hover:bg-emerald-500">
                    <CheckIcon width={15} height={15} />
                    Enregistrer
                  </button>
                </>
              ) : (
                <button onClick={startEdit} className="btn bg-ruban px-4 py-2 text-sm text-ink hover:bg-amber-400">
                  Modifier
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 border-b border-white/10">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition ${
                active ? 'text-ruban' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t.label}
              {active && (
                <motion.span layoutId="profile-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ruban" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {tab === 'cv' &&
          (editing && draft ? (
            <CVEdit draft={draft} setDraft={setDraft} education={cv?.education ?? []} />
          ) : cv ? (
            <CVRead cv={cv} />
          ) : (
            <EmptyProfile onImport={openImport} onManual={startEdit} importing={importing} />
          ))}

        {tab === 'perso' &&
          (editing && draft ? (
            <PersonnelEdit draft={draft} setDraft={setDraft} email={user.email} />
          ) : (
            <PersonnelRead user={user} />
          ))}

        {tab === 'files' && (
          <FilesTab cvFileName={user.cvFileName} onImport={openImport} importing={importing} />
        )}
      </div>
    </Layout>
  );
}

// --- CV tab ------------------------------------------------------------------

function CVRead({ cv }: { cv: CVAnalysis }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">Secteurs recommandés</h2>
            <span className="rounded-full bg-ruban/15 px-2.5 py-0.5 text-xs font-semibold text-ruban">
              Score {cv.score}/100
            </span>
          </div>
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

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
            <StarIcon width={15} height={15} /> Compétences
          </h2>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/75">
                {skill}
              </span>
            ))}
            {cv.skills.length === 0 && <span className="text-sm text-white/40">Aucune compétence</span>}
          </div>
        </motion.div>

        {cv.education.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">Formation</h2>
            <ul className="space-y-3">
              {cv.education.map((ed, i) => (
                <li key={i}>
                  <p className="font-semibold">{ed.degree}</p>
                  <p className="text-sm text-white/50">
                    {ed.school} · {ed.year}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
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
              <p className="text-sm text-white/50">
                {exp.company} · {exp.period}
              </p>
              <p className="mt-0.5 text-sm text-white/60">{exp.description}</p>
            </li>
          ))}
          {cv.experiences.length === 0 && (
            <li className="text-sm text-white/40">Aucune expérience — cliquez sur « Modifier » pour en ajouter.</li>
          )}
        </ol>
      </motion.div>
    </div>
  );
}

function CVEdit({
  draft,
  setDraft,
  education,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  education: CVAnalysis['education'];
}) {
  return (
    <div className="space-y-6">
      <EditPanels draft={draft} setDraft={setDraft} />
      {education.length > 0 && (
        <div className="glass rounded-3xl p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
            Formation <span className="text-white/30">(via import CV)</span>
          </h2>
          <ul className="space-y-3">
            {education.map((ed, i) => (
              <li key={i}>
                <p className="font-semibold">{ed.degree}</p>
                <p className="text-sm text-white/50">
                  {ed.school} · {ed.year}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Personnel tab -----------------------------------------------------------

function PersonnelRead({ user }: { user: User }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">Informations</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Info Icon={MailIcon} label="Email" value={user.email} />
        <Info Icon={BriefcaseIcon} label="Téléphone" value={user.phone || '—'} />
        <Info Icon={MapPinIcon} label="Localisation" value={user.location || '—'} />
        <Info Icon={BriefcaseIcon} label="Contrat recherché" value={user.contract} />
      </div>
      {user.bio && (
        <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-white/70">{user.bio}</p>
      )}
    </motion.div>
  );
}

function PersonnelEdit({
  draft,
  setDraft,
  email,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  email: string;
}) {
  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">Informations</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <EditField label="Prénom" value={draft.firstName} onChange={(v) => setDraft({ ...draft, firstName: v })} />
        <EditField label="Nom" value={draft.lastName} onChange={(v) => setDraft({ ...draft, lastName: v })} />
        <EditField label="Métier" value={draft.job} onChange={(v) => setDraft({ ...draft, job: v })} />
        <EditField label="Localisation" value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} />
        <EditField label="Téléphone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
        <div>
          <label className="label">Contrat recherché</label>
          <select
            className="field"
            value={draft.contract}
            onChange={(e) => setDraft({ ...draft, contract: e.target.value as ContractType })}
          >
            {CONTRACTS.map((c) => (
              <option key={c} value={c} className="bg-panel">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label className="label">Email</label>
        <input className="field opacity-60" value={email} disabled />
      </div>
      <div className="mt-3">
        <label className="label">Présentation</label>
        <textarea
          className="field resize-none"
          rows={3}
          value={draft.bio}
          onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          placeholder="Quelques mots sur vous…"
        />
      </div>
    </div>
  );
}

// --- Files tab ---------------------------------------------------------------

function FilesTab({
  cvFileName,
  onImport,
  importing,
}: {
  cvFileName: string;
  onImport: () => void;
  importing: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">CV / Documents</h2>

      {cvFileName ? (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-match/15 text-match">
            <CheckIcon width={20} height={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white">{cvFileName}</p>
            <p className="text-xs text-white/40">Envoyé aux entreprises lors d'un match</p>
          </div>
          <span className="shrink-0 rounded-full bg-match/15 px-2.5 py-1 text-xs font-semibold text-match">
            Sélectionné
          </span>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/40">
          Aucun CV importé pour l'instant.
        </p>
      )}

      <button
        onClick={onImport}
        disabled={importing}
        className="btn mt-4 w-full bg-ruban py-3 text-ink hover:bg-amber-400 disabled:opacity-50"
      >
        <UploadIcon width={16} height={16} />
        {importing ? 'Analyse…' : cvFileName ? 'Remplacer le CV (PDF)' : 'Importer un CV (PDF)'}
      </button>
      <p className="mt-3 text-center text-xs text-white/30">
        Le PDF doit contenir du texte (pas une photo scannée). On en extrait vos expériences et compétences.
      </p>
    </motion.div>
  );
}

// --- Skills + experiences editor (shared) ------------------------------------

function EditPanels({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !draft.skills.includes(s)) setDraft({ ...draft, skills: [...draft.skills, s] });
    setSkillInput('');
  };

  const addExperience = () =>
    setDraft({
      ...draft,
      experiences: [{ role: '', company: '', period: '', type: 'CDI', description: '' }, ...draft.experiences],
    });

  const updateExp = (i: number, patch: Partial<CVExperience>) =>
    setDraft({
      ...draft,
      experiences: draft.experiences.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    });

  const removeExp = (i: number) =>
    setDraft({ ...draft, experiences: draft.experiences.filter((_, idx) => idx !== i) });

  return (
    <>
      {/* Skills editor */}
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
          <StarIcon width={15} height={15} /> Compétences
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {draft.skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm">
              {skill}
              <button
                onClick={() => setDraft({ ...draft, skills: draft.skills.filter((s) => s !== skill) })}
                className="text-white/40 hover:text-white"
              >
                <CloseIcon width={13} height={13} />
              </button>
            </span>
          ))}
          {draft.skills.length === 0 && <span className="text-sm text-white/40">Aucune compétence</span>}
        </div>
        <div className="flex gap-2">
          <input
            className="field"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Ajouter une compétence puis Entrée"
          />
          <button onClick={addSkill} className="btn shrink-0 bg-white/10 px-4 hover:bg-white/15">
            Ajouter
          </button>
        </div>
      </div>

      {/* Experiences editor */}
      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
            <BriefcaseIcon width={15} height={15} /> Expériences & stages
          </h2>
          <button onClick={addExperience} className="btn bg-ruban px-3 py-1.5 text-xs text-ink hover:bg-amber-400">
            + Ajouter
          </button>
        </div>
        <div className="space-y-4">
          {draft.experiences.map((exp, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <input
                  className="field !py-2 font-medium"
                  value={exp.role}
                  onChange={(e) => updateExp(i, { role: e.target.value })}
                  placeholder="Intitulé du poste"
                />
                <button
                  onClick={() => removeExp(i)}
                  className="mt-1 shrink-0 text-white/40 hover:text-next"
                  aria-label="Supprimer"
                >
                  <CloseIcon width={18} height={18} />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  className="field !py-2"
                  value={exp.company}
                  onChange={(e) => updateExp(i, { company: e.target.value })}
                  placeholder="Entreprise"
                />
                <input
                  className="field !py-2"
                  value={exp.period}
                  onChange={(e) => updateExp(i, { period: e.target.value })}
                  placeholder="2022 — aujourd'hui"
                />
                <select
                  className="field !py-2"
                  value={exp.type}
                  onChange={(e) => updateExp(i, { type: e.target.value as ContractType })}
                >
                  {CONTRACTS.map((c) => (
                    <option key={c} value={c} className="bg-panel">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="field mt-2 resize-none !py-2"
                rows={2}
                value={exp.description}
                onChange={(e) => updateExp(i, { description: e.target.value })}
                placeholder="Description"
              />
            </div>
          ))}
          {draft.experiences.length === 0 && (
            <p className="text-sm text-white/40">Aucune expérience. Cliquez sur « + Ajouter ».</p>
          )}
        </div>
      </div>
    </>
  );
}

// --- Small helpers -----------------------------------------------------------

function EmptyProfile({
  onImport,
  onManual,
  importing,
}: {
  onImport: () => void;
  onManual: () => void;
  importing: boolean;
}) {
  return (
    <div className="glass grid place-items-center rounded-3xl py-16 text-center">
      <div className="max-w-md px-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ruban/15 text-ruban">
          <UploadIcon width={28} height={28} />
        </div>
        <h2 className="font-display text-lg font-bold">Complétez votre profil</h2>
        <p className="mt-1.5 text-sm text-white/50">
          Importez votre <strong className="text-white/70">CV</strong> ou le
          <strong className="text-white/70"> PDF de votre profil LinkedIn</strong> — on en extrait
          automatiquement vos expériences, stages et compétences.
        </p>
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={onImport}
            disabled={importing}
            className="btn bg-ruban px-5 py-2.5 text-ink hover:bg-amber-400 disabled:opacity-50"
          >
            <UploadIcon width={16} height={16} />
            {importing ? 'Analyse…' : 'Importer mon CV / PDF'}
          </button>
          <button onClick={onManual} className="btn bg-white/10 px-5 py-2.5 hover:bg-white/15">
            Saisir manuellement
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ Icon, label, value }: { Icon: typeof MailIcon; label: string; value: string }) {
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

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="field" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
