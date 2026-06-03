import type { SVGProps } from 'react';
import { useTheme, type ThemeMode } from '@/theme';

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function AutoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const OPTIONS: { mode: ThemeMode; label: string; Icon: typeof SunIcon }[] = [
  { mode: 'auto', label: 'Auto', Icon: AutoIcon },
  { mode: 'light', label: 'Clair', Icon: SunIcon },
  { mode: 'dark', label: 'Sombre', Icon: MoonIcon },
];

/** Segmented control to pick light / dark / auto (time-based) theme. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { mode, setMode } = useTheme();
  return (
    <div className={`glass flex items-center gap-0.5 rounded-full p-1 ${className}`}>
      {OPTIONS.map(({ mode: m, label, Icon }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={active}
            aria-label={`Thème ${label}`}
            className={`btn rounded-full px-2.5 py-1 text-xs ${
              active ? 'bg-ruban text-ink' : 'text-white/60 hover:text-white'
            }`}
          >
            <Icon width={15} height={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
