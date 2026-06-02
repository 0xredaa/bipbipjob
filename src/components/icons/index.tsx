import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

/** BipBipJob wordmark logo — a parcel with a yellow tape + spark on top. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="5" y="11" width="22" height="16" rx="3" fill="#C19A6B" />
      <rect x="5" y="16.5" width="22" height="4" fill="#FACC15" />
      <path d="M16 3 L20 9 H12 Z" fill="#FACC15" />
      <path d="M16 9 V11" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
      <rect x="5" y="11" width="22" height="16" rx="3" stroke="#0B0F17" strokeWidth="1.4" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2 L4.5 13.5 H11 L9.5 22 L19.5 9.5 H12.5 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Heart with a check — the MATCH icon. */
export function HeartCheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20.5 C12 20.5 3.5 15 3.5 8.8 A4.8 4.8 0 0 1 12 6 A4.8 4.8 0 0 1 20.5 8.8 C20.5 11 19.5 12.7 18.2 14.2" />
      <path d="M14 17.5 L16.3 19.8 L21 14.5" />
    </svg>
  );
}

/** Arrow pointing right — the NEXT icon. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12 H19" />
      <path d="M13 6 L19 12 L13 18" />
    </svg>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 13 L7 5 H17 L20 13" />
      <path d="M4 13 V18 A1 1 0 0 0 5 19 H19 A1 1 0 0 0 20 18 V13" />
      <path d="M4 13 H8 L9.5 15.5 H14.5 L16 13 H20" />
    </svg>
  );
}

export function MachineIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="13" width="18" height="5" rx="2.5" />
      <circle cx="6.5" cy="15.5" r="0.6" fill="currentColor" />
      <circle cx="17.5" cy="15.5" r="0.6" fill="currentColor" />
      <rect x="8.5" y="6" width="7" height="6" rx="1.2" />
      <path d="M12 3 V6" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 L14.6 8.5 L20.5 9.3 L16.2 13.5 L17.3 19.5 L12 16.6 L6.7 19.5 L7.8 13.5 L3.5 9.3 L9.4 8.5 Z" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5 H20 A1 1 0 0 1 21 6 V15 A1 1 0 0 1 20 16 H9 L4 20 V6 A1 1 0 0 1 4 5 Z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12.5 L9 17.5 L20 6.5" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7 L12 13 L20 7" />
    </svg>
  );
}

export function MailOpenIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10 L12 4 L21 10 V18 A1 1 0 0 1 20 19 H4 A1 1 0 0 1 3 18 Z" />
      <path d="M3 10 L12 16 L21 10" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5 V12 L15 14" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21 C12 21 5 14.5 5 9.5 A7 7 0 0 1 19 9.5 C19 14.5 12 21 12 21 Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M8.5 7.5 V5.5 A1 1 0 0 1 9.5 4.5 H14.5 A1 1 0 0 1 15.5 5.5 V7.5" />
      <path d="M3 12.5 H21" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 16 V4" />
      <path d="M7 9 L12 4 L17 9" />
      <path d="M4 16 V19 A1 1 0 0 0 5 20 H19 A1 1 0 0 0 20 19 V16" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12 H5" />
      <path d="M11 6 L5 12 L11 18" />
    </svg>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 18 H20" />
      <path d="M4 18 L5.5 8 L9.5 12 L12 6 L14.5 12 L18.5 8 L20 18 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 4 H6 A1 1 0 0 0 5 5 V19 A1 1 0 0 0 6 20 H9" />
      <path d="M14 16 L19 12 L14 8" />
      <path d="M19 12 H9" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 L13.6 9.2 L20 12 L13.6 14.8 L12 21 L10.4 14.8 L4 12 L10.4 9.2 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6S0 4.88 0 3.5 1.11 1 2.49 1 4.98 2.12 4.98 3.5ZM0.2 8h4.56v14H0.2V8Zm7.4 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.56v-6.54c0-1.56-.03-3.56-2.17-3.56-2.17 0-2.5 1.7-2.5 3.45V22H7.6V8Z" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20 C5 16 8 14.5 12 14.5 C16 14.5 19 16 19 20" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6 L18 18" />
      <path d="M18 6 L6 18" />
    </svg>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 9.5 H21" />
      <path d="M6.5 14.5 H10" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5 V7.5 A4 4 0 0 1 16 7.5 V10.5" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
