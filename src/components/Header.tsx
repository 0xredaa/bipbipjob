import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CreditsBadge } from './CreditsBadge';
import { ThemeToggle } from './ThemeToggle';
import { Logo, MachineIcon, InboxIcon, ChatIcon, LogoutIcon, UserIcon, CrownIcon } from './icons';

type HeaderVariant = 'app' | 'landing';

interface HeaderProps {
  /** 'app' (default) shows the full authenticated bar; 'landing' shows just
   *  the logo plus Connexion / Inscription for the public home page. */
  variant?: HeaderVariant;
}

const NAV = [
  { to: '/machine', label: 'Application', Icon: MachineIcon },
  { to: '/inbox', label: 'Inbox', Icon: InboxIcon },
  { to: '/feedback', label: 'Feedback', Icon: ChatIcon },
  { to: '/plans', label: 'Abonnement', Icon: CrownIcon },
];

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U';
}

/** Floating overlay header. Sits above the 3D scene (absolute, high z-index). */
export function Header({ variant = 'app' }: HeaderProps = {}) {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();
  const isLanding = variant === 'landing';

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-4"
    >
      <div className="glass pointer-events-auto mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-3 py-2.5 shadow-lg sm:px-4">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="font-display text-lg font-bold tracking-tight">
            BipBip<span className="text-ruban">Job</span>
          </span>
        </NavLink>

        {/* App nav — hidden on the public landing header */}
        {!isLanding && (
        <nav className="hidden items-center gap-1 rounded-full bg-white/5 p-1 md:flex">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `btn relative px-4 py-1.5 text-sm ${
                  isActive ? 'text-ink' : 'text-white/70 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-ruban"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon width={16} height={16} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        )}

        {/* Right cluster — landing: auth buttons; app: credits + avatar */}
        {isLanding ? (
          <div className="flex items-center gap-2">
            <ThemeToggle className="mr-1" />
            <Link
              to="/login"
              className="btn px-4 py-2 text-sm text-white/80 hover:text-white"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="btn bg-ruban px-4 py-2 text-sm text-ink shadow-neon hover:bg-amber-400"
            >
              Inscription
            </Link>
          </div>
        ) : (
        <div className="flex items-center gap-2.5">
          <CreditsBadge />
          <div className="group relative">
            <NavLink
              to="/profile"
              className="block h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/10 transition hover:ring-ruban/50"
              aria-label="Profil"
            >
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Profil" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ruban to-amber-600 text-sm font-bold text-ink">
                  {initials(user?.firstName, user?.lastName)}
                </span>
              )}
            </NavLink>
            <div className="glass invisible absolute right-0 top-full mt-2 w-48 rounded-xl p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold">
                  {user ? `${user.firstName} ${user.lastName}` : 'Invité'}
                </p>
                <p className="truncate text-xs text-white/40">{user?.email}</p>
              </div>
              <NavLink
                to="/profile"
                className="btn w-full justify-start gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                <UserIcon width={16} height={16} />
                Mon profil
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn w-full justify-start gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                <LogoutIcon width={16} height={16} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Mobile nav — app only */}
      {!isLanding && (
      <nav className="pointer-events-auto mx-auto mt-2 flex max-w-6xl items-center justify-center gap-1 rounded-full md:hidden">
        <div className="glass flex gap-1 rounded-full p-1">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `btn px-3 py-1.5 text-xs ${
                  isActive ? 'bg-ruban text-ink' : 'text-white/70'
                }`
              }
            >
              <Icon width={15} height={15} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      )}
    </motion.header>
  );
}
