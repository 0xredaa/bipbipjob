import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckIcon, SparkleIcon, ArrowRightIcon, CrownIcon } from '@/components/icons';
import { PLANS } from '@/data/plans';

const STEPS = [
  { n: '01', title: 'Les offres défilent', text: 'Chaque offre arrive comme un colis sur le tapis roulant 3D.' },
  { n: '02', title: 'Vous faites bip-bip', text: 'MATCH pour postuler, NEXT pour passer. Un geste, une décision.' },
  { n: '03', title: "L'email part tout seul", text: "On envoie votre CV à l'entreprise automatiquement. Suivez le statut dans l'Inbox." },
];

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Header variant="landing" />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pt-28 pb-12 sm:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ruban/30 bg-ruban/10 px-3 py-1 text-xs font-medium text-ruban">
            <SparkleIcon width={14} height={14} />
            Le matching emploi, version arcade
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Faites <span className="text-ruban">bip-bip</span>,<br />
            trouvez votre job
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/60">
            Les offres défilent comme des colis sur une machine 3D. Un clic sur
            MATCH et votre CV part directement à l'entreprise. C'est tout.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="btn bg-ruban px-6 py-3.5 text-ink shadow-neon transition hover:bg-amber-400"
            >
              Créer un compte
              <ArrowRightIcon width={18} height={18} />
            </Link>
            <Link
              to="/login"
              className="btn glass px-6 py-3.5 text-white hover:bg-white/10"
            >
              Se connecter
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-white/40">
            <span><strong className="text-white">12k+</strong> candidats</span>
            <span><strong className="text-white">3 500</strong> entreprises</span>
            <span><strong className="text-white">98%</strong> emails délivrés</span>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          Comment ça marche
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <span className="font-display text-3xl font-bold text-ruban/40">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/55">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-12 pb-28">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Tarifs simples</h2>
          <p className="mt-3 text-white/55">Choisissez le rythme de votre recherche.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-3xl p-7 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-ruban/15 to-transparent ring-2 ring-ruban shadow-neon'
                  : 'glass'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ruban px-3 py-1 text-xs font-bold text-ink">
                  <CrownIcon width={14} height={14} />
                  Populaire
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="mb-1 text-sm text-white/40">{plan.period}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-ruban">{plan.credits}</p>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-match" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`btn mt-7 w-full py-3 ${
                  plan.highlight
                    ? 'bg-ruban text-ink hover:bg-amber-400'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
