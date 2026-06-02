import { LinkedInIcon } from './icons';

/**
 * Starts the real LinkedIn OAuth flow. It's a plain anchor (full-page redirect)
 * because /api is served by the backend, not the SPA router.
 */
export function LinkedInButton({ label }: { label: string }) {
  return (
    <a
      href="/api/auth/linkedin"
      className="btn w-full bg-[#0A66C2] py-3 text-white transition hover:bg-[#0959aa]"
    >
      <LinkedInIcon width={18} height={18} />
      {label}
    </a>
  );
}
