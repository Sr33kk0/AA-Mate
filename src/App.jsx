import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import Welcome from './pages/Welcome';
import Login from './pages/Login';

const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HostReceiptWaitClaim = lazy(() => import('./pages/HostReceiptWaitClaim'));
const HostReceiptWaitingForPayment = lazy(() => import('./pages/HostReceiptWaitingForPayment'));
const ClientReceiptPending = lazy(() => import('./pages/ClientReceiptPending'));
const HostReceiptSettled = lazy(() => import('./pages/HostReceiptSettled'));
const ClientReceiptPaid = lazy(() => import('./pages/ClientReceiptPaid'));
const Profile = lazy(() => import('./pages/Profile'));

function LoadingFallback() {
  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center">
      <div className="w-10 h-10 rounded-full bg-[#FF007F] animate-pulse shadow-[0_0_24px_6px_rgba(255,0,127,0.7)]" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/welcome', { replace: true });
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') navigate('/welcome', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking) return null;
  return children;
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col flex-1 h-full w-full"
      >
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Detailed Pages */}
            <Route path="/host-receipt-waitclaim/:receiptId" element={<ProtectedRoute><HostReceiptWaitClaim /></ProtectedRoute>} />
            <Route path="/host-receipt-waitpayment/:receiptId" element={<ProtectedRoute><HostReceiptWaitingForPayment /></ProtectedRoute>} />
            <Route path="/host-receipt-settled/:receiptId" element={<ProtectedRoute><HostReceiptSettled /></ProtectedRoute>} />
            <Route path="/client-receipt-pending/:receiptId" element={<ProtectedRoute><ClientReceiptPending /></ProtectedRoute>} />
            <Route path="/client-receipt-paid/:receiptId" element={<ProtectedRoute><ClientReceiptPaid /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Container simulating mobile viewport bound context */}
      <div className="mobile-container flex flex-col relative overflow-hidden bg-bg isolation">
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
