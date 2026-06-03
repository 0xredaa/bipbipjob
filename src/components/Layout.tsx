import type { ReactNode } from 'react';
import { Header } from './Header';

/**
 * Shell used by "classic" (non-fullscreen-3D) pages: renders the overlay header
 * and a scrollable, grid-backed content area with top padding for the header.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:pt-32">{children}</main>
    </div>
  );
}
