import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HomePage } from '@/pages/Home';
import { MachinePage } from '@/pages/Machine';
import { InboxPage } from '@/pages/Inbox';
import { FeedbackPage } from '@/pages/Feedback';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { PlansPage } from '@/pages/Plans';
import { CheckoutPage } from '@/pages/Checkout';
import { CVAnalysisPage } from '@/pages/CVAnalysis';
import { ProfilePage } from '@/pages/Profile';

export default function App() {
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
        <Route path="/" element={<HomePage />} />
        <Route path="/machine" element={<MachinePage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cv-analysis" element={<CVAnalysisPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
