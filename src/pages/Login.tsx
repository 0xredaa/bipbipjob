import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { Logo, BoltIcon, ArrowRightIcon } from '@/components/icons';

export function LoginPage() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('reda.benali@example.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      login({ email });
      toast.success('Connexion réussie');
      navigate('/machine');
    }, 600);
  };

  return (
    <AuthShell
      title="Bon retour"
      subtitle="Connectez-vous pour relancer la machine."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="vous@exemple.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn w-full bg-ruban py-3.5 text-ink shadow-neon hover:bg-amber-400 disabled:opacity-50"
        >
          <BoltIcon width={18} height={18} />
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-semibold text-ruban hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-grid px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-3xl p-8 shadow-2xl`}
      >
        <Link to="/" className="mb-6 flex items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="font-display text-xl font-bold">
            BipBip<span className="text-ruban">Job</span>
          </span>
        </Link>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-white/50">{subtitle}</p>
        {children}
        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-1 text-xs text-white/30 hover:text-white/60"
        >
          Retour à l'accueil
          <ArrowRightIcon width={13} height={13} />
        </Link>
      </motion.div>
    </div>
  );
}
