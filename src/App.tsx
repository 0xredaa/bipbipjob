import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { HomePage } from '@/pages/Home';
import { MachinePage } from '@/pages/Machine';
import { InboxPage } from '@/pages/Inbox';
import { FeedbackPage } from '@/pages/Feedback';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { PlansPage } from '@/pages/Plans';
import { CheckoutPage } from '@/pages/Checkout';
import { LinkedInCallbackPage } from '@/pages/LinkedInCallback';
import { ProfilePage } from '@/pages/Profile';
import { Logo } from '@/components/icons';

/** Gate that waits for hydration, then redirects unauthenticated users to /login. */
function RequireAuth({ children }: { children: ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!hydrated) return <Splash />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-grid">
      <div className="flex items-center gap-2.5 opacity-80">
        <Logo className="h-8 w-8 animate-pulse" />
        <span className="font-display text-lg font-bold">
          BipBip<span className="text-ruban">Job</span>
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const hydrate = useStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(17, 24, 39, 0.92)',
            color: '#E5E7EB',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '14px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/linkedin" element={<LinkedInCallbackPage />} />

        {/* Authenticated */}
        <Route path="/machine" element={<RequireAuth><MachinePage /></RequireAuth>} />
        <Route path="/inbox" element={<RequireAuth><InboxPage /></RequireAuth>} />
        <Route path="/feedback" element={<RequireAuth><FeedbackPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/plans" element={<RequireAuth><PlansPage /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
