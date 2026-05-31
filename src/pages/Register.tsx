import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { AuthShell } from './Login';
import { UploadIcon, CheckIcon } from '@/components/icons';
import type { ContractType } from '@/types';

const CONTRACTS: ContractType[] = ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'];

export function RegisterPage() {
  const register = useStore((s) => s.register);
  const navigate = useNavigate();
  const photoInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contract: 'CDI' as ContractType,
    job: '',
    location: '',
    bio: '',
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  };

  const handleCv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCvFileName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFileName) {
      toast.error('Ajoutez votre CV pour continuer');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      register({ ...form, photoUrl, cvFileName });
      toast.success('Compte créé — analyse de votre CV', { icon: '✅' });
      navigate('/cv-analysis');
    }, 700);
  };

  return (
    <AuthShell
      wide
      title="Créer un compte"
      subtitle="Votre profil sera envoyé aux entreprises à chaque match."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo + identity */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 transition hover:border-ruban/50"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Profil" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-white/40">
                <UploadIcon width={20} height={20} />
                <span className="text-[10px]">Photo</span>
              </span>
            )}
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />
          <div className="grid flex-1 grid-cols-2 gap-3">
            <Field label="Prénom" required value={form.firstName} onChange={(v) => set('firstName', v)} />
            <Field label="Nom" required value={form.lastName} onChange={(v) => set('lastName', v)} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" type="email" required value={form.email} onChange={(v) => set('email', v)} placeholder="vous@exemple.com" />
          <Field label="Téléphone" type="tel" required value={form.phone} onChange={(v) => set('phone', v)} placeholder="+33 6 …" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Métier" required value={form.job} onChange={(v) => set('job', v)} placeholder="Développeur Full-Stack" />
          <Field label="Localisation" required value={form.location} onChange={(v) => set('location', v)} placeholder="Paris, France" />
        </div>

        {/* Contract type */}
        <div>
          <label className="label">Type de contrat recherché</label>
          <div className="flex flex-wrap gap-2">
            {CONTRACTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('contract', c)}
                className={`btn px-4 py-2 text-sm ${
                  form.contract === c
                    ? 'bg-ruban text-ink'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* CV upload */}
        <div>
          <label className="label">CV (PDF)</label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 transition hover:border-ruban/50">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${cvFileName ? 'bg-match/20 text-match' : 'bg-white/10 text-white/50'}`}>
              {cvFileName ? <CheckIcon width={18} height={18} /> : <UploadIcon width={18} height={18} />}
            </span>
            <span className="text-sm">
              {cvFileName ? (
                <span className="font-medium text-white">{cvFileName}</span>
              ) : (
                <span className="text-white/50">Cliquez pour téléverser votre CV</span>
              )}
            </span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleCv} className="hidden" />
          </label>
        </div>

        {/* Bio */}
        <div>
          <label className="label" htmlFor="bio">Présentation</label>
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            rows={3}
            placeholder="Quelques lignes sur vous, vos compétences et ce que vous cherchez."
            className="field resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full bg-ruban py-3.5 text-ink shadow-neon hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-white/50">
        Déjà inscrit ?{' '}
        <Link to="/login" className="font-semibold text-ruban hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field"
      />
    </div>
  );
}
