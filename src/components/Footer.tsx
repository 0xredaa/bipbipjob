import { Link } from 'react-router-dom';
import { Logo, LinkedInIcon, InstagramIcon, XIcon } from './icons';

const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
  { to: '/legal', label: 'Mentions légales' },
];

const SOCIALS = [
  { href: 'https://www.linkedin.com/', label: 'LinkedIn', Icon: LinkedInIcon },
  { href: 'https://www.instagram.com/', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://x.com/', label: 'X (Twitter)', Icon: XIcon },
];

/** Marketing footer: brand, page links, social icons and copyright. */
export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand + page links */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <span className="font-display text-lg font-bold tracking-tight">
                BipBip<span className="text-ruban">Job</span>
              </span>
            </Link>
            <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
              {NAV.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
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

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/40">
          © {new Date().getFullYear()} BipBipJob. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
