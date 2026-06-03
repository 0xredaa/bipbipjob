import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { PLANS } from '@/data/plans';
import type { Plan } from '@/types';
import { Logo, CheckIcon, CrownIcon, BoltIcon } from '@/components/icons';

/**
 * Plan picker. Shown right after registration and also as the upgrade entry
 * point (?upgrade=1). The free plan is provisioned instantly; paid plans route
 * to the checkout/payment page first.
 */
export function PlansPage() {
  const selectPlan = useStore((s) => s.selectPlan);
  const user = useStore((s) => s.user);
  const credits = useStore((s) => s.credits);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isUpgrade = params.get('upgrade') === '1';
  const [loading, setLoading] = useState<Plan | null>(null);

  const choose = async (plan: Plan) => {
    if (loading) return;
    // Paid plans go through payment first.
    if (plan !== 'free') {
      navigate(`/checkout?plan=${plan}`);
      return;
    }
    // Already on Free → just continue; don't re-provision (would refill credits).
    if (credits?.plan === 'free') {
      navigate('/machine');
      return;
    }
    // Free is provisioned immediately (e.g. when downgrading from a paid plan).
    setLoading(plan);
    await selectPlan(plan);
    toast.success('Plan Free activé — c\'est parti !', { icon: '⚡' });
    navigate('/machine');
  };

  return (
    <div className="min-h-screen bg-grid px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex items-center justify-center gap-2.5">
            <Logo className="h-9 w-9" />
            <span className="font-display text-xl font-bold">
              BipBip<span className="text-ruban">Job</span>
            </span>
          </div>
          {isUpgrade ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ruban/30 bg-ruban/10 px-3 py-1 text-xs font-medium text-ruban">
              <CrownIcon width={14} height={14} />
              Améliorez votre plan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-match/30 bg-match/10 px-3 py-1 text-xs font-medium text-match">
              <CheckIcon width={14} height={14} />
              Compte créé{user?.firstName ? `, bienvenue ${user.firstName}` : ''}
            </span>
          )}
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            {isUpgrade ? 'Passez à la vitesse supérieure' : 'Choisissez votre plan'}
          </h1>
          <p className="mt-2 text-white/55">
            {isUpgrade
              ? 'Débloquez plus de crédits de matching. Vous pourrez changer à tout moment.'
              : 'Dernière étape avant de lancer la machine. Vous pourrez changer à tout moment.'}
          </p>
        </motion.div>

        {/* Plans */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative flex flex-col rounded-3xl p-7 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-ruban/15 to-transparent ring-2 ring-ruban shadow-neon'
                  : 'glass'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ruban px-3 py-1 text-xs font-bold text-ink">
                  <CrownIcon width={14} height={14} />
                  Recommandé
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="mb-1 text-sm text-white/40">{plan.period}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-ruban">{plan.credits}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-match" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(plan.key)}
                disabled={loading !== null}
                className={`btn mt-7 w-full py-3 disabled:opacity-50 ${
                  plan.highlight
                    ? 'bg-ruban text-ink hover:bg-amber-400'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {loading === plan.key ? (
                  'Activation…'
                ) : (
                  <>
                    <BoltIcon width={16} height={16} />
                    Choisir {plan.name}
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => choose('free')}
          disabled={loading !== null}
          className="mx-auto mt-8 block text-sm text-white/40 hover:text-white/70 disabled:opacity-50"
        >
          Continuer avec le plan gratuit →
        </button>
      </div>
    </div>
  );
}
