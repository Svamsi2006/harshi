import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  MailCheck,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
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

interface EmailOtpVerifyPanelProps {
  email: string;
  mode: 'signup' | 'login';
  redirectTarget: string;
  onVerified: () => void;
  onBack: () => void;
}

const EmailOtpVerifyPanel: React.FC<EmailOtpVerifyPanelProps> = ({
  email,
  mode,
  redirectTarget,
  onVerified,
  onBack,
}) => {
  const { verifyEmailOtp, resendVerificationEmail, sendLoginOtp } = useStore();
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = otpCode.trim();
    if (!cleaned || cleaned.length < 6) {
      setError('Please enter the 6-digit verification code from your email.');
      return;
    }
    setError('');
    setVerifying(true);
    const res = await verifyEmailOtp({ email, token: cleaned, mode });
    setVerifying(false);
    if (!res.ok) {
      setError(res.error || 'Invalid or expired code. Please try again.');
      return;
    }
    onVerified();
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setNotice('');
    setResending(true);
    const res =
      mode === 'signup'
        ? await resendVerificationEmail(email, redirectTarget)
        : await sendLoginOtp(email, redirectTarget);
    setResending(false);
    if (!res.ok) {
      setError(res.error || 'Could not resend verification email.');
      return;
    }
    setNotice('A fresh verification email has been sent. Please check your inbox and spam folder.');
    setCooldown(30);
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#E7C7CC] text-center space-y-2">
        <div className="w-11 h-11 rounded-full bg-[#6D1836]/10 text-[#6D1836] flex items-center justify-center mx-auto">
          <MailCheck className="w-5 h-5" />
        </div>
        <h2 className="font-display text-lg font-medium text-[#3E2F27]">Verify Your Email</h2>
        <p className="text-xs text-[#7A655C] leading-relaxed">
          We sent a confirmation email to <strong className="text-[#3E2F27]">{email}</strong>.
          Click the <strong>verification link</strong> in that email, or enter the{' '}
          <strong>6-digit OTP code</strong> below.
        </p>
      </div>

      {error && (
        <p className="text-xs text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-xs text-[#3E2F27] bg-[#F8EFEA] border border-[#C9A66B]/50 rounded-xl px-3.5 py-2.5">
          {notice}
        </p>
      )}

      <form onSubmit={(e) => void handleVerify(e)} className="space-y-4">
        <div>
          <label htmlFor="email-otp-code" className="block text-xs font-medium text-[#7A655C] mb-1.5">
            6-Digit Email OTP Code
          </label>
          <input
            id="email-otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="123456"
            className="w-full px-4 py-3 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-center font-mono tracking-[0.4em] text-base text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
          />
        </div>

        <button
          type="submit"
          disabled={verifying}
          className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-65"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify Code &amp; Continue</span>
          )}
        </button>
      </form>

      <div className="flex items-center justify-between pt-2 border-t border-[#E7C7CC] text-xs">
        <button
          type="button"
          onClick={onBack}
          className="text-[#7A655C] hover:text-[#6D1836] font-medium"
        >
          ← Change Email
        </button>
        <button
          type="button"
          disabled={cooldown > 0 || resending}
          onClick={() => void handleResend()}
          className="inline-flex items-center gap-1 font-semibold text-[#6D1836] hover:text-[#541129] disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}</span>
        </button>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const {
    user,
    isAdmin,
    authSyncing,
    loginWithCredentials,
    loginWithGoogle,
    sendLoginOtp,
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navState = (location.state as { from?: string; discount?: number } | null) ?? null;
  const redirectTarget = resolveRedirectTarget(searchParams, navState);
  const isCheckoutRedirect = redirectTarget.startsWith('/checkout');

  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingVerify, setPendingVerify] = useState<{
    email: string;
    mode: 'signup' | 'login';
  } | null>(null);

  // Persist discount across full-page OAuth / email confirmation redirects
  useEffect(() => {
    if (typeof navState?.discount === 'number' && navState.discount > 0) {
      try {
        sessionStorage.setItem(CHECKOUT_DISCOUNT_STORAGE_KEY, String(navState.discount));
      } catch {
        // ignore
      }
    }
  }, [navState?.discount]);

  // Auto-redirect when signed in or returning from Supabase OAuth / email verification link
  useEffect(() => {
    if (!user) return;
    try {
      sessionStorage.removeItem('varniks_post_auth_redirect');
    } catch {
      // ignore
    }
    const target = isAdmin && redirectTarget === '/account' ? '/admin' : redirectTarget;
    navigate(target, {
      replace: true,
      state: typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
    });
  }, [user, isAdmin, navigate, redirectTarget, navState?.discount]);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle(redirectTarget);
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error || 'Could not start Google Sign-In.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (authMethod === 'otp') {
      setError('');
      setSubmitting(true);
      const res = await sendLoginOtp(cleanedEmail, redirectTarget);
      setSubmitting(false);
      if (!res.ok) {
        setError(res.error || 'Could not send login OTP.');
        return;
      }
      setPendingVerify({ email: cleanedEmail, mode: 'login' });
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setSubmitting(true);
    const res = await loginWithCredentials(cleanedEmail, password);
    setSubmitting(false);

    if (!res.ok) {
      if (res.needsVerification) {
        setPendingVerify({ email: cleanedEmail, mode: 'signup' });
        return;
      }
      setError(res.error || 'Unable to sign in.');
      return;
    }

    try {
      sessionStorage.removeItem('varniks_post_auth_redirect');
    } catch {
      // ignore
    }
    const target =
      res.user?.role === 'owner' && redirectTarget === '/account' ? '/admin' : redirectTarget;
    navigate(target, {
      state: typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
    });
  };

  return (
    <AuthShell
      title={pendingVerify ? 'Check Your Inbox' : 'Welcome Back'}
      subtitle={
        pendingVerify
          ? 'Verify your email address to complete sign-in.'
          : isCheckoutRedirect
            ? 'Sign in to enter your delivery address, complete checkout, and track your order.'
            : 'Sign in to view your saved artworks, orders, and studio bag.'
      }
    >
      {authSyncing && (
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#6D1836] bg-[#FFF9F5] border border-[#E7C7CC] rounded-xl px-4 py-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Completing your sign-in...</span>
        </div>
      )}

      {pendingVerify ? (
        <EmailOtpVerifyPanel
          email={pendingVerify.email}
          mode={pendingVerify.mode}
          redirectTarget={redirectTarget}
          onVerified={() => {
            try {
              sessionStorage.removeItem('varniks_post_auth_redirect');
            } catch {
              // ignore
            }
          }}
          onBack={() => {
            setPendingVerify(null);
            setError('');
          }}
        />
      ) : (
        <>
          {isCheckoutRedirect && !authSyncing && (
            <div className="flex items-start gap-2.5 text-xs text-[#3E2F27] bg-[#F8EFEA] border border-[#E7C7CC] rounded-xl px-3.5 py-3">
              <ShieldCheck className="w-4 h-4 text-[#6D1836] shrink-0 mt-0.5" />
              <span>
                Login is required before placing an order so your bag, delivery address, and
                tracking updates stay linked to your account.
              </span>
            </div>
          )}

          {/* Supabase Google Sign-In */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={googleLoading || authSyncing || submitting}
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
              <span className="px-3 text-[11px] uppercase tracking-wider text-[#7A655C]">
                or with email
              </span>
              <div className="flex-1 border-t border-[#E7C7CC]" />
            </div>

            {/* Password vs Email OTP toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F8EFEA] border border-[#E7C7CC]">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('password');
                  setError('');
                }}
                className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  authMethod === 'password'
                    ? 'bg-white text-[#6D1836] shadow-xs'
                    : 'text-[#7A655C] hover:text-[#3E2F27]'
                }`}
              >
                Email &amp; Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setError('');
                }}
                className={`py-1.5 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors ${
                  authMethod === 'otp'
                    ? 'bg-white text-[#6D1836] shadow-xs'
                    : 'text-[#7A655C] hover:text-[#3E2F27]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Email OTP</span>
              </button>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {error && (
              <p className="text-xs text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-[#7A655C] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            {authMethod === 'password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-medium text-[#7A655C]"
                  >
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
                    autoComplete="current-password"
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
            )}

            <button
              type="submit"
              disabled={submitting || authSyncing}
              className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-65"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{authMethod === 'otp' ? 'Sending OTP...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>
                  {authMethod === 'otp'
                    ? 'Send Verification Code / Link'
                    : isCheckoutRedirect
                      ? 'Sign In & Continue to Checkout'
                      : 'Sign In'}
                </span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E7C7CC]">
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
        </>
      )}
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  const { user, isAdmin, registerCustomer, loginWithGoogle, authSyncing } = useStore();
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
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const target = isAdmin && redirectTarget === '/account' ? '/admin' : redirectTarget;
    navigate(target, {
      replace: true,
      state: typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
    });
  }, [user, isAdmin, navigate, redirectTarget, navState?.discount]);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle(redirectTarget);
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error || 'Could not start Google Sign-In.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please complete all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
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

    setError('');
    setSubmitting(true);
    const cleanedEmail = email.trim().toLowerCase();
    const res = await registerCustomer(
      { fullName, email: cleanedEmail, phone, password },
      redirectTarget
    );
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Could not create account.');
      return;
    }

    if (res.needsVerification) {
      setPendingVerifyEmail(cleanedEmail);
      return;
    }

    try {
      sessionStorage.removeItem('varniks_post_auth_redirect');
    } catch {
      // ignore
    }
    const target =
      res.user?.role === 'owner' && redirectTarget === '/account' ? '/admin' : redirectTarget;
    navigate(target, {
      state: typeof navState?.discount === 'number' ? { discount: navState.discount } : undefined,
    });
  };

  return (
    <AuthShell
      title={pendingVerifyEmail ? 'Verify Your Email' : 'Create Your Account'}
      subtitle={
        pendingVerifyEmail
          ? 'Confirm your email address to activate your studio account.'
          : 'Join our collector circle for order tracking, saved addresses & wishlists.'
      }
    >
      {pendingVerifyEmail ? (
        <EmailOtpVerifyPanel
          email={pendingVerifyEmail}
          mode="signup"
          redirectTarget={redirectTarget}
          onVerified={() => {
            try {
              sessionStorage.removeItem('varniks_post_auth_redirect');
            } catch {
              // ignore
            }
          }}
          onBack={() => {
            setPendingVerifyEmail(null);
            setError('');
          }}
        />
      ) : (
        <>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={googleLoading || authSyncing || submitting}
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
              <span className="px-3 text-[11px] uppercase tracking-wider text-[#7A655C]">
                or register with email
              </span>
              <div className="flex-1 border-t border-[#E7C7CC]" />
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {error && (
              <p className="text-xs text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Full Name</label>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Meera Kulkarni"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="meera@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                autoComplete="tel"
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
                  autoComplete="new-password"
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
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || authSyncing}
              className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-65"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>
                  {redirectTarget.startsWith('/checkout')
                    ? 'Create Account & Continue to Checkout'
                    : 'Create Account'}
                </span>
              )}
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
        </>
      )}
    </AuthShell>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset, updateAccountPassword } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUpdateMode = searchParams.get('mode') === 'update';

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [updated, setUpdated] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitting(true);
    const res = await sendPasswordReset(email);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Could not send reset email.');
      return;
    }
    setSent(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSubmitting(true);
    const res = await updateAccountPassword(newPassword);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Could not update password. Try requesting a fresh reset link.');
      return;
    }
    setUpdated(true);
  };

  if (isUpdateMode) {
    return (
      <AuthShell
        title="Set New Password"
        subtitle="Choose a fresh password for your studio account."
      >
        {updated ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-[#3E2F27]">Your password has been updated successfully.</p>
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
            >
              Continue to Account
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleUpdatePassword(e)} className="space-y-4">
            {error && (
              <p className="text-xs text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-65"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{submitting ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Password Recovery"
      subtitle="Enter your email and we will send a Supabase password reset link."
    >
      {sent ? (
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-[#3E2F27]">
            Recovery instructions have been sent to <strong>{email}</strong>. Open the link in your
            email to set a new password.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSendReset(e)} className="space-y-4">
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
            disabled={submitting}
            className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-65"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{submitting ? 'Sending...' : 'Send Reset Link'}</span>
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
