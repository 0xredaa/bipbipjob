import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Éditeur du site',
    body: "Le site BipBipJob est édité par BipBipJob. Pour toute question, contactez-nous à contact@bipbipjob.app. (À compléter : raison sociale, forme juridique, capital, RCS, SIRET, adresse du siège, directeur de la publication.)",
  },
  {
    title: '2. Hébergement',
    body: "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com.",
  },
  {
    title: '3. Propriété intellectuelle',
    body: "L'ensemble des contenus présents sur le site (textes, visuels, logo, éléments 3D, code) est la propriété de BipBipJob, sauf mention contraire. Toute reproduction ou réutilisation sans autorisation préalable est interdite.",
  },
  {
    title: '4. Données personnelles (RGPD)',
    body: "BipBipJob collecte les données nécessaires à la création de compte et au service de mise en relation (nom, email, CV, préférences). Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données. Pour exercer ces droits, écrivez à contact@bipbipjob.app.",
  },
  {
    title: '5. Cookies',
    body: "Le site utilise des cookies strictement nécessaires à son fonctionnement (session, authentification). Aucun cookie publicitaire tiers n'est déposé sans votre consentement.",
  },
  {
    title: '6. Responsabilité',
    body: "BipBipJob met tout en œuvre pour assurer l'exactitude des informations diffusées mais ne saurait être tenu responsable des erreurs, d'une indisponibilité du service ou de la suite donnée aux candidatures par les entreprises.",
  },
];

export function LegalPage() {
  return (
    <div className="min-h-screen">
      <Header variant="landing" />

      <main className="mx-auto max-w-3xl px-4 pt-28 pb-12 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ruban/30 bg-ruban/10 px-3 py-1 text-xs font-medium text-ruban">
            Légal
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Mentions légales
          </h1>
          <p className="mt-4 text-sm text-white/40">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
          </p>
        </motion.div>

        <div className="mt-10 space-y-4">
          {SECTIONS.map((s) => (
            <section key={s.title} className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
