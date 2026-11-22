import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { isAdminEmail } from '../../utils/admin';
import { PageTransition } from '../../components/common/PageTransition';
import { BrandLogo } from '../../components/common/BrandLogo';

const GoogleMark: React.FC = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.29v3.1A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29A7.22 7.22 0 0 1 4.9 12c0-.79.14-1.56.38-2.29V6.61H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.39l3.99-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l3.99 3.1c.95-2.84 3.6-4.95 6.72-4.95z"
    />
  </svg>
);

export const AdminLoginPage: React.FC = () => {
  const {
    loginWithCredentials,
    loginWithGoogle,
    googleAuthAvailable,
    authSyncing,
    user,
    isAdmin,
    logout,
  } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleGoogleAdminLogin = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle('/admin');
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error || 'Could not start Google Sign-In.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your admin email and password.');
      return;
    }
    const res = await loginWithCredentials(email, password);
    if (!res.ok) {
      setError(res.error || 'Authentication failed.');
      return;
    }
    if (res.user?.role !== 'owner' && !isAdminEmail(res.user?.email)) {
      setError('This account does not have Studio Admin permissions.');
      return;
    }
    navigate('/admin');
  };

  return (
    <PageTransition className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E7C7CC] rounded-3xl p-8 shadow-warm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-2">
            <BrandLogo to="/" size="lg" />
          </div>
          <span className="inline-block px-3 py-1 rounded-md bg-[#6D1836]/15 text-[#6D1836] text-xs font-semibold uppercase tracking-wider">
            Studio Admin Portal
          </span>
          <h1 className="font-display text-2xl font-medium text-[#3E2F27]">Studio Management</h1>
          <p className="text-sm text-[#7A655C]">
            Sign in with an authorized Studio Admin account, then enter your Admin PIN to unlock.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8EFEA]/70 border border-[#E7C7CC] text-xs text-[#7A655C] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#6D1836] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#3E2F27]">Two-Step Admin Protection</p>
            <p className="mt-0.5">
              Authorized admin emails enter with Google or email sign-in, followed by the Admin
              Security PIN gate.
            </p>
          </div>
        </div>

        {user && !isAdmin && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#6D1836]/10 border border-[#6D1836]/30 text-xs text-[#6D1836]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-semibold">Customer Account Active ({user.email})</p>
              <p>
                This account does not have admin access. Sign out and log in with an authorized
                admin email.
              </p>
              <button
                type="button"
                onClick={logout}
                className="underline font-semibold text-[#541129]"
              >
                Sign out now
              </button>
            </div>
          </div>
        )}

        {/* Primary Google OAuth Admin Sign-In */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={googleLoading || authSyncing}
            onClick={() => void handleGoogleAdminLogin()}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#FFF9F5] border border-[#E7C7CC] hover:border-[#6D1836] text-sm font-medium text-[#3E2F27] inline-flex items-center justify-center gap-2.5 shadow-xs transition-colors disabled:opacity-60"
          >
            {googleLoading || authSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#6D1836]" />
            ) : (
              <GoogleMark />
            )}
            <span>
              {googleLoading || authSyncing
                ? 'Connecting to Google...'
                : 'Continue with Google (Admin)'}
            </span>
          </button>

          {!googleAuthAvailable && (
            <p className="text-[11px] text-center text-[#7A655C]">
              Add <span className="font-mono">SUPABASE_ANON_KEY</span> &amp; enable Google in
              Supabase Auth to activate one-click Google Admin Sign-In.
            </p>
          )}

          <div className="relative flex items-center py-1">
            <div className="flex-1 border-t border-[#E7C7CC]" />
            <span className="px-3 text-[11px] uppercase tracking-wider text-[#7A655C]">
              or with email
            </span>
            <div className="flex-1 border-t border-[#E7C7CC]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-[#6D1836] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-medium text-[#7A655C] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A655C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-[#7A655C] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A655C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors shadow-warm"
          >
            Continue to Admin PIN Gate
          </button>
        </form>

        <div className="pt-4 border-t border-[#E7C7CC] text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-[#7A655C] hover:text-[#6D1836]"
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    </PageTransition>
  );
};
