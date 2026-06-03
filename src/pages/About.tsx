import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowRightIcon, BoltIcon, HeartCheckIcon, MailIcon } from '@/components/icons';

const VALUES = [
  {
    Icon: BoltIcon,
    title: 'Rapide comme un bip',
    text: 'Plus de candidatures interminables. Une offre, un geste : MATCH ou NEXT. Votre recherche avance en quelques minutes.',
  },
  {
    Icon: HeartCheckIcon,
    title: 'Le bon match',
    text: 'On filtre les offres selon votre profil et vos secteurs. Vous ne voyez que ce qui compte vraiment pour vous.',
  },
  {
    Icon: MailIcon,
    title: 'Zéro friction',
    text: "Dès qu'un MATCH tombe, votre CV part automatiquement à l'entreprise. Vous suivez tout depuis votre Inbox.",
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header variant="landing" />

      <main className="mx-auto max-w-4xl px-4 pt-28 pb-12 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ruban/30 bg-ruban/10 px-3 py-1 text-xs font-medium text-ruban">
            À propos
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            La recherche d'emploi, <span className="text-ruban">version arcade</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/60">
            BipBipJob transforme la candidature en un jeu simple et efficace. Les
            offres défilent comme des colis sur un tapis roulant 3D : vous scannez,
            vous décidez, et votre CV part tout seul. Notre mission : vous faire
            gagner du temps et vous reconnecter à des opportunités qui vous
            correspondent vraiment.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map(({ Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ruban/15 text-ruban">
                <Icon width={22} height={22} />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-white/55">{text}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass mt-12 flex flex-col items-start gap-4 rounded-2xl p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Prêt à faire bip-bip ?</h2>
            <p className="mt-1.5 text-sm text-white/55">
              Créez votre compte et lancez votre première session en moins d'une minute.
            </p>
          </div>
          <Link
            to="/register"
            className="btn shrink-0 bg-ruban px-6 py-3.5 text-ink shadow-neon transition hover:bg-amber-400"
          >
            Créer un compte
            <ArrowRightIcon width={18} height={18} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
