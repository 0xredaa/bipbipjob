import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { Logo, LinkedInIcon } from '@/components/icons';

/**
 * Landing route after the LinkedIn OAuth round-trip. The backend has already
 * set the session cookie; we just hydrate the store and forward the user in.
 */
export function LinkedInCallbackPage() {
  const hydrate = useStore((s) => s.hydrate);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const error = params.get('error');
    if (error) {
      toast.error(`LinkedIn : ${error}`);
      navigate('/login', { replace: true });
      return;
    }

    const isNewUser = params.get('new') === '1';

    (async () => {
      await hydrate();
      const { isAuthenticated, user } = useStore.getState();
      if (isAuthenticated) {
        toast.success(`Bienvenue ${user?.firstName || ''} !`.trim(), { icon: '✅' });
        // New accounts pick a plan first; returning users go straight in.
        navigate(isNewUser ? '/plans' : '/machine', { replace: true });
      } else {
        toast.error('Échec de la connexion LinkedIn');
        navigate('/login', { replace: true });
      }
    })();
  }, [params, hydrate, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-grid px-4">
      <div className="glass flex flex-col items-center gap-4 rounded-3xl p-10 text-center">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="font-display text-lg font-bold">
            BipBip<span className="text-ruban">Job</span>
          </span>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A66C2]/20 text-[#4e9ae6]">
          <LinkedInIcon width={24} height={24} />
        </span>
        <p className="flex items-center gap-2 text-sm text-white/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-ruban" />
          Connexion LinkedIn en cours…
        </p>
      </div>
    </div>
  );
}
