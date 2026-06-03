import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  MailIcon,
  ArrowRightIcon,
  LinkedInIcon,
  InstagramIcon,
  XIcon,
} from '@/components/icons';

const CONTACT_EMAIL = 'contact@bipbipjob.app';

const SOCIALS = [
  { href: 'https://www.linkedin.com/', label: 'LinkedIn', Icon: LinkedInIcon },
  { href: 'https://www.instagram.com/', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://x.com/', label: 'X (Twitter)', Icon: XIcon },
];

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend mailer yet: open the visitor's mail client pre-filled.
    const subject = encodeURIComponent(`Contact BipBipJob — ${name || 'Visiteur'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen">
      <Header variant="landing" />

      <main className="mx-auto max-w-5xl px-4 pt-28 pb-12 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ruban/30 bg-ruban/10 px-3 py-1 text-xs font-medium text-ruban">
            Contact
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            On vous répond <span className="text-ruban">vite</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/60">
            Une question, un partenariat, un bug à signaler ? Écrivez-nous, l'équipe
            BipBipJob lit tout.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="name">Nom</label>
                <input
                  id="name"
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="label" htmlFor="message">Message</label>
              <textarea
                id="message"
                className="field min-h-[140px] resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dites-nous tout…"
                required
              />
            </div>
            <button
              type="submit"
              className="btn mt-5 w-full bg-ruban py-3.5 text-ink shadow-neon transition hover:bg-amber-400"
            >
              Envoyer le message
              <ArrowRightIcon width={18} height={18} />
            </button>
          </form>

          {/* Side: email + socials */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ruban/15 text-ruban">
                <MailIcon width={22} height={22} />
              </span>
              <h2 className="mt-4 text-lg font-semibold">Par email</h2>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-1 inline-block text-sm text-ruban hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Sur les réseaux</h2>
              <div className="mt-4 flex items-center gap-3">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:border-ruban/40 hover:text-ruban"
                  >
                    <Icon width={18} height={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
