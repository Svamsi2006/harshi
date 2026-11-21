import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { sanitizeRedirectPath } from '../../lib/supabaseAuth';
import { PageTransition } from '../../components/common/PageTransition';
import { BrandLogo } from '../../components/common/BrandLogo';

const CHECKOUT_DISCOUNT_STORAGE_KEY = 'varniks_checkout_discount';

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

const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <PageTransition className="py-12 sm:py-16 px-4">
    <div className="max-w-md mx-auto bg-white border border-[#E7C7CC] rounded-3xl p-7 sm:p-9 shadow-warm space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center pb-1">
          <BrandLogo to="/" size="sm" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-[#3E2F27]">{title}</h1>
        <p className="text-sm text-[#7A655C]">{subtitle}</p>
      </div>
      {children}
    </div>
  </PageTransition>
);

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

function resolveRedirectTarget(
  searchParams: URLSearchParams,
  locationState: { from?: string; discount?: number } | null
): string {
  const fromQuery = searchParams.get('redirect');
  if (fromQuery) return sanitizeRedirectPath(fromQuery, '/account');
  if (locationState?.from) return sanitizeRedirectPath(locationState.from, '/account');
  try {
    const saved = sessionStorage.getItem('varniks_post_auth_redirect');
    if (saved) return sanitizeRedirectPath(saved, '/account');
  } catch {
    // ignore
  }
  return '/account';
}

export const LoginPage: React.FC = () => {
  const {
    user,
    authSyncing,
    loginWithCredentials,
    loginAsDemoCustomer,
    loginWithGoogle,
    googleAuthAvailable,
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navState = (location.state as { from?: string; discount?: number } | null) ?? null;
  const redirectTarget = resolveRedirectTarget(searchParams, navState);
  const isCheckoutRedirect = redirectTarget.startsWith('/checkout');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Persist discount across full-page OAuth redirect if coming from Cart
  useEffect(() => {
    if (typeof navState?.discount === 'number' && navState.discount > 0) {
      try {
        sessionStorage.setItem(CHECKOUT_DISCOUNT_STORAGE_KEY, String(navState.discount));
      } catch {
        // ignore
      }
    }
  }, [navState?.discount]);

  // Auto-redirect when already signed in or returning from Supabase Google OAuth callback
  useEffect(() => {
    if (!user) return;
    try {
      sessionStorage.removeItem('varniks_post_auth_redirect');
    } catch {
      // ignore
    }
    const target = user.role === 'owner' && redirectTarget === '/account' ? '/admin' : redirectTarget;
    navigate(target, {
      replace: true,
      state: typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
    });
  }, [user, navigate, redirectTarget, navState?.discount]);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle(redirectTarget);
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error || 'Could not start Google Sign-In.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }
    const res = loginWithCredentials(email, password);
    if (!res.ok) {
      setError(res.error || 'Unable to sign in.');
      return;
    }
    try {
      sessionStorage.removeItem('varniks_post_auth_redirect');
    } catch {
      // ignore
    }
    if (res.user?.role === 'owner' && redirectTarget === '/account') {
      navigate('/admin');
    } else {
      navigate(redirectTarget, {
        state: typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
      });
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle={
        isCheckoutRedirect
          ? 'Sign in to enter your delivery address, complete checkout, and track your order.'
          : 'Sign in to view your saved artworks, orders, and studio bag.'
      }
    >
      {authSyncing && (
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#6D1836] bg-[#FFF9F5] border border-[#E7C7CC] rounded-xl px-4 py-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Completing your Google sign-in...</span>
        </div>
      )}

      {isCheckoutRedirect && !authSyncing && (
        <div className="flex items-start gap-2.5 text-xs text-[#3E2F27] bg-[#F8EFEA] border border-[#E7C7CC] rounded-xl px-3.5 py-3">
          <ShieldCheck className="w-4 h-4 text-[#6D1836] shrink-0 mt-0.5" />
          <span>
            Login is required before placing an order so your bag, delivery address, and tracking updates stay linked to your account.
          </span>
        </div>
      )}

      {/* Supabase Google Sign-In */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => void handleGoogleSignIn()}
          disabled={googleLoading || authSyncing}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FFF9F5] border border-[#E7C7CC] hover:border-[#6D1836] text-sm font-medium text-[#3E2F27] inline-flex items-center justify-center gap-2.5 shadow-xs transition-colors disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#6D1836]" />
          ) : (
            <GoogleMark />
          )}
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {!googleAuthAvailable && (
          <p className="text-[11px] text-center text-[#7A655C]">
            Studio Admin: add <span className="font-mono">SUPABASE_ANON_KEY</span> &amp; enable Google in Supabase Auth to activate one-click Google Sign-In.
          </p>
        )}

        <div className="relative flex items-center py-1">
          <div className="flex-1 border-t border-[#E7C7CC]" />
          <span className="px-3 text-[11px] uppercase tracking-wider text-[#7A655C]">or with email</span>
          <div className="flex-1 border-t border-[#E7C7CC]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-[#7A655C] mb-1.5">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="ananya@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-medium text-[#7A655C]">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[#6D1836] hover:text-[#541129]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A655C] hover:text-[#3E2F27]"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[#7A655C] cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-[#E7C7CC] text-[#6D1836]"
          />
          <span>Remember me on this device</span>
        </label>

        <button
          type="submit"
          className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
        >
          {isCheckoutRedirect ? 'Sign In & Continue to Checkout' : 'Sign In'}
        </button>
      </form>

      <div className="pt-4 border-t border-[#E7C7CC] space-y-3">
        <button
          type="button"
          onClick={() => {
            loginAsDemoCustomer();
            navigate(redirectTarget, {
              state:
                typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
            });
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#F8EFEA] hover:bg-[#E7C7CC] text-xs font-medium text-[#3E2F27] inline-flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#6D1836]" />
          <span>Sign in with Demo Collector Account (Ananya)</span>
        </button>

        <div className="text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#6D1836] hover:text-[#541129]"
          >
            <span>Studio Owner? Open Admin Login →</span>
          </Link>
        </div>

        <p className="text-center text-xs text-[#7A655C]">
          New to varniks_atelier?{' '}
          <Link
            to={
              redirectTarget !== '/account'
                ? `/register?redirect=${encodeURIComponent(redirectTarget)}`
                : '/register'
            }
            state={navState ?? undefined}
            className="font-semibold text-[#6D1836] hover:text-[#541129]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  const { user, registerCustomer, loginWithGoogle, authSyncing } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navState = (location.state as { from?: string; discount?: number } | null) ?? null;
  const redirectTarget = resolveRedirectTarget(searchParams, navState);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate(redirectTarget, {
      replace: true,
      state: typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
    });
  }, [user, navigate, redirectTarget, navState?.discount]);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle(redirectTarget);
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error || 'Could not start Google Sign-In.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please complete all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const res = registerCustomer({ fullName, email, phone, password });
    if (!res.ok) {
      setError(res.error || 'Could not register.');
      return;
    }
    try {
      sessionStorage.removeItem('varniks_post_auth_redirect');
    } catch {
      // ignore
    }
    navigate(redirectTarget, {
      state: typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
    });
  };

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="Join our collector circle for order tracking, saved addresses & wishlists."
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => void handleGoogleSignIn()}
          disabled={googleLoading || authSyncing}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FFF9F5] border border-[#E7C7CC] hover:border-[#6D1836] text-sm font-medium text-[#3E2F27] inline-flex items-center justify-center gap-2.5 shadow-xs transition-colors disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#6D1836]" />
          ) : (
            <GoogleMark />
          )}
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center py-1">
          <div className="flex-1 border-t border-[#E7C7CC]" />
          <span className="px-3 text-[11px] uppercase tracking-wider text-[#7A655C]">or register with email</span>
          <div className="flex-1 border-t border-[#E7C7CC]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Meera Kulkarni"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="meera@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+91 98200 12345"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A655C]"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Re-enter password"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
        >
          {redirectTarget.startsWith('/checkout')
            ? 'Create Account & Continue to Checkout'
            : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs text-[#7A655C] pt-2 border-t border-[#E7C7CC]">
        Already have an account?{' '}
        <Link
          to={
            redirectTarget !== '/account'
              ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
              : '/login'
          }
          state={navState ?? undefined}
          className="font-semibold text-[#6D1836] hover:text-[#541129]"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <AuthShell
      title="Password Recovery"
      subtitle="Enter your email and we will send a studio reset link."
    >
      {sent ? (
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-[#3E2F27]">
            Recovery instructions have been sent to <strong>{email}</strong>.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
          >
            Send Reset Link
          </button>
          <p className="text-center text-xs text-[#7A655C]">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-[#6D1836]">
              Back to Sign In
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
};
