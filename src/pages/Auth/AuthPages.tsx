import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { BrandLogo } from '../../components/common/BrandLogo';

const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <PageTransition className="py-12 sm:py-16 px-4">
    <div className="max-w-md mx-auto bg-white border border-[#EAE3D5] rounded-3xl p-7 sm:p-9 shadow-warm space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center pb-1">
          <BrandLogo to="/" size="sm" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-[#2B2623]">{title}</h1>
        <p className="text-sm text-[#6E655F]">{subtitle}</p>
      </div>
      {children}
    </div>
  </PageTransition>
);

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials, loginAsDemoCustomer } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

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
    if (res.user?.role === 'owner') {
      navigate('/admin');
    } else {
      navigate('/account');
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to view your saved artworks, orders, and studio bag."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-[#B2593E] bg-[#C86D51]/10 border border-[#C86D51]/25 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-[#6E655F] mb-1.5">
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
            <label htmlFor="login-password" className="block text-xs font-medium text-[#6E655F]">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[#C86D51] hover:text-[#B2593E]"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E655F] hover:text-[#2B2623]"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[#6E655F] cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-[#EAE3D5] text-[#C86D51]"
          />
          <span>Remember me on this device</span>
        </label>

        <button
          type="submit"
          className="w-full py-3 px-5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
        >
          Sign In
        </button>
      </form>

      <div className="pt-4 border-t border-[#EAE3D5] space-y-3">
        <button
          type="button"
          onClick={() => {
            loginAsDemoCustomer();
            navigate('/account');
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#F3EDE2] hover:bg-[#EAE3D5] text-xs font-medium text-[#2B2623] inline-flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
          <span>Sign in with Demo Collector Account (Ananya)</span>
        </button>

        <div className="text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#C86D51] hover:text-[#B2593E]"
          >
            <span>Studio Owner? Open Admin Login →</span>
          </Link>
        </div>

        <p className="text-center text-xs text-[#6E655F]">
          New to varniks_atelier?{' '}
          <Link to="/register" className="font-semibold text-[#C86D51] hover:text-[#B2593E]">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export const RegisterPage: React.FC = () => {
  const { registerCustomer } = useStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

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
    navigate('/account');
  };

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="Join our collector circle for order tracking, saved addresses & wishlists."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-[#B2593E] bg-[#C86D51]/10 border border-[#C86D51]/25 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div>
          <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Meera Kulkarni"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="meera@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+91 98200 12345"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Password</label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E655F]"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
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
          className="w-full py-3 px-5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
        >
          Create Account
        </button>
      </form>

      <p className="text-center text-xs text-[#6E655F] pt-2 border-t border-[#EAE3D5]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#C86D51] hover:text-[#B2593E]">
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
          <div className="w-12 h-12 rounded-full bg-[#7A9178]/15 text-[#7A9178] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-[#2B2623]">
            Recovery instructions have been sent to <strong>{email}</strong>.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 px-5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-[#B2593E] bg-[#C86D51]/10 border border-[#C86D51]/25 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
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
            className="w-full py-3 px-5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
          >
            Send Reset Link
          </button>
          <p className="text-center text-xs text-[#6E655F]">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-[#C86D51]">
              Back to Sign In
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
};
