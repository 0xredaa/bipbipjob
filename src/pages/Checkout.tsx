import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { PLANS } from '@/data/plans';
import type { Plan } from '@/types';
import {
  Logo,
  CheckIcon,
  CrownIcon,
  CreditCardIcon,
  LockIcon,
  ArrowLeftIcon,
} from '@/components/icons';

// --- light input formatting helpers -----------------------------------------
const formatCard = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/** Mocked Stripe-style checkout for a paid plan. */
export function CheckoutPage() {
  const selectPlan = useStore((s) => s.selectPlan);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const planKey = (params.get('plan') as Plan) ?? 'pro';
  const plan = useMemo(
    () => PLANS.find((p) => p.key === planKey) ?? PLANS[2],
    [planKey],
  );

  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [paying, setPaying] = useState(false);

  // Free plan never reaches checkout — guard just in case.
  if (plan.key === 'free') {
    navigate('/plans', { replace: true });
    return null;
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (card.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvc.length < 3) {
      toast.error('Vérifiez vos informations de carte');
      return;
    }
    setPaying(true);
    // Simulate a payment intent round-trip.
    await new Promise((r) => setTimeout(r, 1100));
    await selectPlan(plan.key);
    setPaying(false);
    toast.success(`Paiement confirmé — plan ${plan.name} activé !`, { icon: '✅' });
    navigate('/machine');
  };

  return (
    <div className="min-h-screen bg-grid px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/plans?upgrade=1"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeftIcon width={16} height={16} />
          Changer de plan
        </Link>

        <div className="grid gap-6 md:grid-cols-[1fr_0.85fr]">
          {/* Payment form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass order-2 rounded-3xl p-7 md:order-1"
          >
            <div className="mb-6 flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <span className="font-display text-lg font-bold">
                BipBip<span className="text-ruban">Job</span>
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold">Paiement</h1>
            <p className="mb-6 mt-1 text-sm text-white/50">
              Saisissez vos informations de carte pour activer le plan {plan.name}.
            </p>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="label" htmlFor="name">Titulaire de la carte</label>
                <input
                  id="name"
                  className="field"
                  placeholder="Reda Benali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="card">Numéro de carte</label>
                <div className="relative">
                  <input
                    id="card"
                    inputMode="numeric"
                    className="field pr-11"
                    placeholder="4242 4242 4242 4242"
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    required
                  />
                  <CreditCardIcon
                    width={20}
                    height={20}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="exp">Expiration</label>
                  <input
                    id="exp"
                    inputMode="numeric"
                    className="field"
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="cvc">CVC</label>
                  <input
                    id="cvc"
                    inputMode="numeric"
                    className="field"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={paying}
                className="btn w-full bg-ruban py-3.5 text-ink shadow-neon hover:bg-amber-400 disabled:opacity-50"
              >
                {paying ? (
                  'Paiement en cours…'
                ) : (
                  <>
                    <LockIcon width={18} height={18} />
                    Payer {plan.price}{plan.period}
                  </>
                )}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-white/30">
                <LockIcon width={13} height={13} />
                Paiement sécurisé — démo, aucune carte n'est débitée
              </p>
            </form>
          </motion.div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="order-1 h-fit rounded-3xl bg-gradient-to-b from-ruban/15 to-transparent p-7 ring-2 ring-ruban shadow-neon md:order-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ruban px-3 py-1 text-xs font-bold text-ink">
              <CrownIcon width={14} height={14} />
              Plan {plan.name}
            </span>
            <div className="mt-4 flex items-end gap-1">
              <span className="font-display text-4xl font-bold">{plan.price}</span>
              <span className="mb-1 text-sm text-white/50">{plan.period}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-ruban">{plan.credits}</p>

            <ul className="mt-6 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                  <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-match" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-1.5 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-white/55">
                <span>Sous-total</span>
                <span>{plan.price}</span>
              </div>
              <div className="flex justify-between text-white/55">
                <span>TVA (20%)</span>
                <span>incluse</span>
              </div>
              <div className="flex justify-between pt-1 font-display text-lg font-bold">
                <span>Total</span>
                <span>{plan.price}{plan.period}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
